import { random } from 'lodash-es'
import { sha256 } from '@liquality/crypto'
import { INTERVALS, TIMEOUTS, timestamp, unlockAsset, updateOrder } from '../utils'
import cryptoassets from '@liquality/cryptoassets'
import { createLoanNotification } from '../../broker/notification'
import { payments } from 'bitcoinjs-lib'
import { fetchLoanFromChain, withdrawFromLoan } from '../../utils/loans/helpers'

export const performNextLoanAction = async ({ commit, getters, dispatch }, { network, walletId, id }) => {
  const loan = getters.historyItemById(network, walletId, id)
  if (!loan || loan.type !== 'LOAN' || !loan.status) return

  const { agentUrl, loanId, principal, principalAmount, collateralAmount, collateral, requestCreatedAt, lenderPrincipalAddress, borrowerPrincipalAddress, borrowerCollateralPublicKey, borrowerCollateralWalletAddress, secretHashes } = loan

  const principalClient = getters.client(network, walletId, principal)
  const collateralClient = getters.client(network, walletId, collateral)

  const agent = getters.agent(agentUrl)

  if (loan.status === 'QUOTE') {
    const [{ address: borrowerPrincipalAddress }, { address: borrowerCollateralWalletAddress, publicKey: borrowerCollateralPublicKey }] = await dispatch('getUnusedAddresses', { network, walletId, assets: [loan.principal, loan.collateral] })

    const msg = `Confirming loan for ${principalAmount} ${principal} with ${collateralAmount} ${collateral} Collateral for ${borrowerPrincipalAddress} from Lender ${lenderPrincipalAddress} at ${requestCreatedAt}`

    const secrets = await principalClient.loan.secrets.generateSecrets(Buffer.from(msg).toString('hex'), 4)
    const secretHashes = secrets.map(secret => sha256(secret))

    const updates = {
      secrets,
      borrowerPrincipalAddress,
      borrowerCollateralPublicKey,
      borrowerCollateralWalletAddress,
      secretHashes,
      status: 'SECRET_READY'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createLoanNotification({
      ...loan,
      ...updates
    })

    dispatch('performNextLoanAction', { network, walletId, id })
  } else if (loan.status === 'SECRET_READY') {
    if (await dispatch('checkIfQuoteExpired', { network, walletId, id })) return
    const lock = await dispatch('getLockForAsset', { network, walletId, asset: loan.principal, id })

    const timestamp = Date.now()
    const data = Buffer.from(
      `${borrowerPrincipalAddress} ${principalAmount} ${timestamp}`,
      'utf8'
    )
    const dataScript = payments.embed({ data: [data] })
    const collateralAmountUnits = cryptoassets[collateral.toLowerCase()].currencyToUnit(collateralAmount)

    let proofOfFundsTxHex
    try {
      proofOfFundsTxHex = await collateralClient.chain.buildBatchTransaction([
        {
          to: borrowerCollateralWalletAddress,
          value: collateralAmountUnits.toNumber()
        },
        { to: dataScript.output, value: 0 }
      ])
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    try {
      await agent.sendProofOfFunds(id, proofOfFundsTxHex, secretHashes, borrowerPrincipalAddress, borrowerCollateralPublicKey.toString('hex'))
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    }

    const updates = {
      status: 'INITIATED'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createLoanNotification({
      ...loan,
      ...updates
    })

    dispatch('performNextLoanAction', { network, walletId, id })
  } else if (loan.status === 'INITIATED') {
    const interval = setInterval(async () => {
      // TODO: VERIFY SANE COLLATERAL AMOUNTS FROM AGENT

      const {
        status, createdAt,
        collateralSeizableP2SHAddress,
        collateralRefundableP2SHAddress,
        refundableCollateralAmount,
        seizableCollateralAmount,
        loanExpiration,
        loanId
      } = await agent.getLoanInfoByRequestId(id)

      console.log(status)

      if (status === 'AWAITING_COLLATERAL' && createdAt !== '0') {
        clearInterval(interval)
        const updates = {
          status,
          collateralSeizableP2SHAddress,
          collateralRefundableP2SHAddress,
          refundableCollateralAmount,
          seizableCollateralAmount,
          loanExpiration,
          loanId
        }

        commit('UPDATE_HISTORY', {
          network,
          walletId,
          id,
          updates

        })

        createLoanNotification({
          ...loan,
          ...updates
        })

        dispatch('performNextLoanAction', { network, walletId, id })
      }
    }, random(15000, 30000))

    INTERVALS.push(interval)
  } else if (loan.status === 'AWAITING_COLLATERAL') {
    console.log('awaiting collat... fetching details')
    const chainLoan = await fetchLoanFromChain(principalClient, network, principal, loanId)
    const { pubKeys, secretHashes, expirations } = chainLoan

    const updates = {
      pubKeys,
      secretHashes,
      expirations,
      status: 'READY_TO_LOCK'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })
    dispatch('performNextLoanAction', { network, walletId, id })
  } else if (loan.status === 'READY_TO_LOCK') {
    console.log('locking...')
    const lock = await dispatch('getLockForAsset', { network, walletId, asset: loan.principal, id })
    const {
      pubKeys,
      secretHashes,
      expirations,
      refundableCollateralAmount,
      seizableCollateralAmount
    } = loan

    let txHash
    try {
      const seizableValue = cryptoassets[collateral.toLowerCase()].currencyToUnit(seizableCollateralAmount).toNumber()
      const refundableValue = cryptoassets[collateral.toLowerCase()].currencyToUnit(refundableCollateralAmount).toNumber()
      txHash = await collateralClient.loan.collateral.lock(
        {
          seizableValue,
          refundableValue
        },
        pubKeys,
        secretHashes,
        expirations
      )
    } catch (e) {
      console.log(e)
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    const updates = {
      txHash,
      status: 'WAIT_FOR_WITHDRAW'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    dispatch('performNextLoanAction', { network, walletId, id })
  } else if (loan.status === 'WAIT_FOR_WITHDRAW') {
    const interval = setInterval(async () => {
      const {
        status
      } = await agent.getLoanInfoByRequestId(id)

      if (status === 'APPROVED') {
        clearInterval(interval)
        const lock = await dispatch('getLockForAsset', { network, walletId, asset: loan.principal, id })
        try {
          await withdrawFromLoan(principalClient, network, principal, loanId, loan.secrets[0])
        } catch (e) {
          console.log(e)
          commit('UPDATE_HISTORY', {
            network,
            walletId,
            id,
            updates: {
              error: e.toString()
            }
          })
          return
        } finally {
          unlockAsset(lock)
        }

        const updates = {
          status: 'WITHDRAWN'
        }

        commit('UPDATE_HISTORY', {
          network,
          walletId,
          id,
          updates

        })

        createLoanNotification({
          ...loan,
          ...updates
        })

        dispatch('updateBalances', { network, walletId, assets: [loan.principal, loan.collateral] })
      }
    }, random(15000, 30000))

    INTERVALS.push(interval)
  } else if (loan.status === 'READY_TO_REPAY') {
    const lock = await dispatch('getLockForAsset', { network, walletId, asset: loan.to, id })

    let sendToHash

    try {
      sendToHash = await toClient.chain.sendTransaction(loan.sendTo, loan.toAmount)
    } catch (e) {
      commit('UPDATE_HISTORY', {
        network,
        walletId,
        id,
        updates: {
          error: e.toString()
        }
      })
      return
    } finally {
      unlockAsset(lock)
    }

    const updates = {
      sendToHash,
      endTime: Date.now(),
      status: 'SUCCESS'
    }

    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id,
      updates
    })

    createSwapNotification({
      ...order,
      ...updates
    })

    dispatch('updateBalances', { network, walletId, assets: [loan.to, loan.from] })
  }
}

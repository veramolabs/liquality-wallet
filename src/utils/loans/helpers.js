import Web3 from 'web3'
import { remove0x, ensure0x } from '@liquality/ethereum-utils'
import { getContract } from './contracts'
const { numberToHex, padLeft } = Web3.utils

function numToBytes32 (num) {
  return padLeft(numberToHex(num), 64)
}

export const fetchLoanFromChain = async (client, network, principal, loanId, additionalFields = []) => {
  const loansContract = await getContract(client, network, principal, 'loans')
  const loanIdHex = numToBytes32(loanId)

  const fields = [
    'owedForLoan',
    'owing',
    'bools',
    'secretHashes',
    'approveExpiration',
    'acceptExpiration',
    'liquidationExpiration',
    'seizureExpiration',
    'collateral',
    'pubKeys',
    ...additionalFields
  ]

  const loan = {
    id: loanIdHex,
    ...(await loansContract.methods.loans(loanIdHex).call()),
    ...(
      await Promise.all(
        fields.map(
          field => loansContract.methods[field](loanIdHex).call().then((fieldData) => ({ [field]: fieldData }))
        )
      )
    ).reduce((r, a) => Object.assign(r, a), {})
  }

  Object.keys(loan.pubKeys).map(k => {
    loan.pubKeys[k] = remove0x(loan.pubKeys[k])
  })

  Object.keys(loan.secretHashes).map(k => {
    loan.secretHashes[k] = remove0x(loan.secretHashes[k])
  })

  loan.expirations = {
    approveExpiration: loan.approveExpiration,
    liquidationExpiration: loan.liquidationExpiration,
    seizureExpiration: loan.seizureExpiration,
    loanExpiration: loan.loanExpiration
  }

  Object.assign(loan, loan.bools)

  console.log(loan)
  return loan
}

export const withdrawFromLoan = async (client, network, principal, loanId, secret) => {
  const loansContract = await getContract(client, network, principal, 'loans')
  const web3 = client.web3

  const from = web3.eth.accounts.wallet[0].address
  const gas = await loansContract.methods.withdraw(numToBytes32(loanId), ensure0x(secret)).estimateGas()
  const gasPrice = await client.web3.eth.getGasPrice()

  return await loansContract.methods
    .withdraw(numToBytes32(loanId), ensure0x(secret))
    .send({ from, gas, gasPrice })
}

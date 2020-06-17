import { stringify } from 'qs'
import { random } from 'lodash-es'
import { createPopup } from '../../broker/utils'
import { emitter } from '../utils'
import BN from 'bignumber.js'

import cryptoassets from '@liquality/cryptoassets'

export const newExternalLoan = ({ dispatch, state }, { network, walletId, agentUrl, principal, collateral, collateralAmount, amount, length, sendTo }) => {
  const FEE = 0.0001

  let collateralBalance = cryptoassets[collateral.toLowerCase()].unitToCurrency(state.balances[network][walletId][collateral])

  if (BN(collateralAmount).plus(FEE).lt(collateralBalance)) {
    return dispatch('newLoan', { network, walletId, agentUrl, principal, collateral, collateralAmount, amount, length, sendTo })
  }

  const depositId = Date.now() + '.' + Math.random()
  const query = stringify({ isPopup: true, amount: collateralAmount + FEE, depositId })

  const interval = setInterval(async () => {
    const [{ balance }] = await dispatch('updateBalances', { network, walletId, assets: [collateral] })
    collateralBalance = cryptoassets[collateral.toLowerCase()].unitToCurrency(balance)

    if (BN(collateralAmount).plus(FEE).lte(collateralBalance)) {
      clearInterval(interval)
      dispatch('newLoan', { network, walletId, agentUrl, principal, collateral, collateralAmount, amount, length, sendTo })
    }
  }, random(10000, 20000))

  createPopup(`/account/${collateral}/receive?${query}`)
  emitter.$once(`deposit-cancelled:${depositId}`, () => clearInterval(interval))
}

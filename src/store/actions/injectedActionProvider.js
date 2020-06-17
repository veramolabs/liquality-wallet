import { stringify } from 'qs'

import { emitter } from '../utils'
import { createPopup } from '../../broker/utils'

export const injectedActionProvider = async ({ state, getters, dispatch }, { origin, data }) => {
  if (!state.unlockedAt) throw new Error('Wallet is locked. Unlock the wallet first.')
  if (!state.activeWalletId) throw new Error('No active wallet found. Select a wallet first.')

  const { action, actionData } = data

  const id = Date.now() + '.' + Math.random()

  await new Promise((resolve, reject) => {
    emitter.$once(`permission:${id}`, allowed => {
      if (allowed) resolve(true)
      else reject(new Error('User denied'))
    })

    const query = stringify({
      id,
      origin,
      method: action,
      args: JSON.stringify(actionData)
    })

    createPopup(`/permission?${query}`)
  })

  return dispatch(action, { ...actionData, network: state.activeNetwork, walletId: state.activeWalletId })
}

import { timestamp } from '../utils'

export const checkIfQuoteExpired = async ({ commit, getters }, { network, walletId, id }) => {
  const item = getters.historyItemById(network, walletId, id)

  if (timestamp() >= item.expiresAt) {
    commit('UPDATE_HISTORY', {
      network,
      walletId,
      id: item.id,
      updates: {
        status: 'QUOTE_EXPIRED'
      }
    })

    return true
  }

  return false
}

import { NetworkAssets } from '../factory/client'

const PENDING_STATES = [
  'SECRET_READY',
  'INITIATED',
  'WAITING_FOR_CONFIRMATIONS',
  'INITIATION_REPORTED',
  'READY_TO_EXCHANGE',
  'GET_REFUND',
  'READY_TO_SEND'
]

const PENDING_LOAN_STATES = [
  'WAIT_FOR_WITHDRAW'
]

export const checkPendingSwaps = async ({ state, dispatch }) => {
  Object.keys(NetworkAssets).forEach(network => {
    if (!state.history[network]) return

    Object.keys(state.history[network]).forEach(walletId => {
      state.history[network][walletId].forEach(item => {
        if (item.type === 'SWAP' && PENDING_STATES.includes(item.status)) {
          dispatch('performNextAction', { network, walletId, id: item.id })
        }
        if (item.type === 'LOAN' && PENDING_LOAN_STATES.includes(item.status)) {
          dispatch('performNextLoanAction', { network, walletId, id: item.id })
        }
      })
    })
  })
}

import { emitter } from '../utils'

export const replyDepositCancelled = async (_, { id }) => {
  emitter.$emit(`deposit-cancelled:${id}`)
}

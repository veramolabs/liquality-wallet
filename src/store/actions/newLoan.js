export const newLoan = async ({ dispatch, commit, getters }, { network, walletId, agentUrl, principal, collateral, collateralAmount, amount, length, sendTo }) => {
  const agent = getters.agent(agentUrl)
  const loan = await agent.newLoan(principal, amount, collateral, length)

  loan.type = 'LOAN'
  loan.from = principal // lists loan tx under the proper asset screen
  loan.network = network
  loan.agentUrl = agentUrl
  loan.startTime = Date.now()
  loan.expiresAt = loan.requestExpiresAt
  loan.status = 'QUOTE'
  loan.collateralAmount = collateralAmount
  loan.sendTo = sendTo
  loan.walletId = walletId

  commit('NEW_LOAN', { network, walletId, loan })
  dispatch('performNextLoanAction', { network, walletId, id: loan.id })
}

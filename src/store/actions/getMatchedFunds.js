export const getMatchedFunds = async ({ getters }, { network, asset, collateral, amount, length, maxLength, maxAmount }) => {
  const matchedFunds = await getters.arbiter(network).matchFunds(asset, collateral, length, amount, maxLength, maxAmount)
  return matchedFunds
}

export const getUnusedAddresses = ({ commit, getters }, { network, walletId, assets }) => {
  return Promise.all(assets.map(async asset => {
    const address = await getters.client(network, walletId, asset).wallet.getUnusedAddress()

    commit('UPDATE_UNUSED_ADDRESS', { network, walletId, asset, address })

    return address
  }))
}

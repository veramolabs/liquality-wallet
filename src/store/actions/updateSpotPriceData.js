import axios from 'axios'
import { NetworkAssets } from '../factory/client'

export const updateSpotPriceData = async ({ commit }, { network, assets }) => {
  const networkAssets = assets || NetworkAssets[network]

  const assetSpotPrices = (await Promise.all(networkAssets.map(asset => axios.get(`https://api.coinbase.com/v2/prices/${asset}-USD/spot`).then(({ data }) => data.data).catch(e => false)))).filter(r => r !== false)
  const spotPriceData = assetSpotPrices.reduce((acc, { base, amount }) => {
    acc[base] = amount
    return acc
  }, {})

  commit('UPDATE_SPOT_PRICE_DATA', { spotPriceData })

  return {
    spotPriceData
  }
}

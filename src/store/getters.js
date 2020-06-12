import createClient from './factory/client'
import createArbiter from './factory/arbiter'
import createAgent from './factory/agent'

const agentEndpoints = {
  testnet: [
    'https://liquality.io/swap-testnet/agent'
  ],
  mainnet: [
    'https://liquality.io/swap/agent'
  ]
}

const clientCache = {}
const arbiterCache = {}
const agentCache = {}

export default {
  agentEndpoints () {
    return network => agentEndpoints[network]
  },
  client (state) {
    return (network, walletId, asset) => {
      const cacheKey = [network, walletId].join('-')

      const cachedClient = clientCache[cacheKey]
      if (cachedClient) return cachedClient[asset]

      const { mnemonic } = state.wallets.find(w => w.id === walletId)
      const client = createClient(network, mnemonic)
      clientCache[cacheKey] = client

      return client[asset]
    }
  },
  arbiter () {
    return (network) => {
      const cachedArbiter = arbiterCache[network]
      if (cachedArbiter) return cachedArbiter

      const arbiter = createArbiter(network)
      arbiterCache[network] = arbiter

      return arbiter
    }
  },
  agent () {
    return (agentUrl) => {
      const cachedAgent = agentCache[agentUrl]
      if (cachedAgent) return cachedAgent

      const agent = createAgent(agentUrl)
      agentCache[agentUrl] = agent

      return agent
    }
  },
  historyItemById (state) {
    return (network, walletId, id) => state.history[network][walletId].find(i => i.id === id)
  }
}

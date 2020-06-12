import axios from 'axios'
import querystring from 'querystring'

const arbiterEndpoints = {
  mainnet: 'https://arbiter.atomic.loans/api/loan',
  testnet: 'https://kovan-arbiter.atomic.loans/api/loan'
}

class Arbiter {
  constructor (arbiterUrl) {
    this.url = arbiterUrl
  }

  async init () {
    const {
      data: { version }
    } = await axios.get(`${this.url}/version`)

    this.version = version
  }

  async matchFunds (stablecoinTicker, collateralTicker, length, amount, maxLength, maxAmount) {
    const query = querystring.stringify({
      length,
      amount,
      maxLength,
      maxAmount
    })

    return (
      await axios.get(
        `${this.url}/agents/matchfunds/${stablecoinTicker}/${collateralTicker}?${query}`
      )
    ).data
  }
}

const createArbiter = (network) => {
  const arbiterUrl = arbiterEndpoints[network]
  return new Arbiter(arbiterUrl)
}

export default createArbiter

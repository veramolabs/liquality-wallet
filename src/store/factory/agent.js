import axios from 'axios'

class Agent {
  constructor (agentUrl) {
    this.url = agentUrl
  }

  async getInfo (stablecoinTicker, collateralTicker) {
    return (
      await axios.get(
        `${this.url}/agentinfo/ticker/${this.getTicker(stablecoinTicker)}/${collateralTicker}`
      )
    ).data
  }

  async getLoanInfo (stablecoinTicker, loanId) {
    return (
      await axios.get(`${this.url}/loans/contract/${this.getTicker(stablecoinTicker)}/${loanId}/`)
    ).data
  }

  async getLoanInfoByRequestId (id) {
    return (
      await axios.get(`${this.url}/loans/${id}`)
    ).data
  }

  async getFundInfo (stablecoinTicker) {
    return (await axios.get(`${this.url}/funds/ticker/${stablecoinTicker}`)).data
  }

  async getAutoupdateSetting () {
    return (await axios.get(`${this.url}/autoupdate`)).data
  }

  async newLoan (principal, principalAmount, collateral, loanDuration) {
    return (await axios.post(`${this.url}/loans/new`, { principal, principalAmount, collateral, loanDuration })).data
  }

  async sendProofOfFunds (requestId, proofOfFundsTxHex, borrowerSecretHashes, borrowerPrincipalAddress, borrowerCollateralPublicKey) {
    return (await axios.post(
      `${this.url}/loans/${requestId}/proof_of_funds`,
      {
        proofOfFundsTxHex,
        borrowerSecretHashes,
        borrowerPrincipalAddress,
        borrowerCollateralPublicKey
      }
    )).data
  }
}

const createAgent = (agentUrl) => {
  return new Agent(agentUrl)
}

export default createAgent

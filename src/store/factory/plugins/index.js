import { EthereumJsWalletProvider } from '@liquality/ethereum-js-wallet-provider'
import * as u8a from 'uint8arrays'

export class DIDStore {
  constructor (args) {
    this.addresses = args.addresses
  }

  async get ({ did }) {
    return {
      did,
      provider: 'did:ethr',
      services: [],
      keys: [{ kid: did.replace('did:ethr:0x', ''), type: 'Secp256k1' }]
    }
  }

  async list () {
    return await Promise.all(
      this.addresses.map(async address => {
        return this.get({ did: `did:ethr:0x${address.address}` })
      })
    )
  }
}

export class KeyStore {
  constructor (args) {
    this.addresses = args.addresses
    this.mnemonic = args.mnemonic
  }

  async getKeys (addresses, mnemonic) {
    return await Promise.all(
      addresses.map(async address => {
        const client = new EthereumJsWalletProvider({
          network: 'mainnet',
          mnemonic: mnemonic,
          derivationPath: address.derivationPath
        })
        const hdKey = await client.hdKey()

        return {
          kid: address.address,
          privateKeyHex: u8a.toString(hdKey.privateKey, 'base16'),
          publicKeyHex: u8a.toString(hdKey.publicKey, 'base16'),
          type: 'Secp256k1',
          kms: 'local'
        }
      })
    )
  }

  async get ({ kid }) {
    const keys = await this.getKeys(this.addresses, this.mnemonic)
    const key = keys.find(key => key.kid === kid)
    if (!key) throw Error('Key not found')
    return key
  }
}

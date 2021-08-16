import { createAgent as _createAgent } from '@veramo/core'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { DIDManager } from '@veramo/did-manager'
import { KeyManager } from '@veramo/key-manager'
import { CredentialIssuer } from '@veramo/credential-w3c'
import { Resolver } from 'did-resolver'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDStore, KeyStore } from './plugins'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import buildConfig from '../../build.config'

export const createAgent = (addresses, mnemonic) => {
  return _createAgent({
    plugins: [
      new KeyManager({
        store: new KeyStore({ addresses, mnemonic }),
        kms: {
          local: new KeyManagementSystem()
        }
      }),
      new DIDManager({
        store: new DIDStore({ addresses })
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId: buildConfig.infuraApiKey }),
          ...webDidResolver()
        })
      }),
      new CredentialIssuer()
    ]
  })
}

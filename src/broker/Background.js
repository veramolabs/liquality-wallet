import jsqr from 'jsqr'
import WalletConnect from "@walletconnect/client";
import { BG_PREFIX, handleConnection, removeConnectId, getRootURL } from './utils'

class Background {
  constructor (store) {
    this.store = store
    this.internalConnections = []
    this.externalConnectionApprovalMap = {}

    this.subscribeToMutations()

    handleConnection(connection => {
      const { url } = connection.sender
      const isInternal = url.startsWith(getRootURL())

      if (isInternal) {
        this.onInternalConnection(connection)
      } else {
        this.externalConnection = connection
        this.onExternalConnection(connection)
      }
    })
  }

  subscribeToMutations () {
    this.store.subscribe(mutation => {
      this.internalConnections.forEach(connection => {
        let { type } = mutation

        if (type.startsWith(connection.name)) return

        type = removeConnectId(type)

        this.sendMutation(connection, { ...mutation, type: BG_PREFIX + type })
      })
    })
  }

  onInternalConnection (connection) {
    this.internalConnections.push(connection)

    connection.onMessage.addListener(message => this.onInternalMessage(connection, message))

    connection.onDisconnect.addListener(() => {
      this.onInternalDisconnect(connection)
      this.unbindMutation(connection)
    })

    this.bindMutation(connection)

    this.store.restored.then(() => connection.postMessage({
      type: 'REHYDRATE_STATE',
      data: this.store.state
    }))
  }

  onExternalConnection (connection) {
    connection.onMessage.addListener(message => this.onExternalMessage(connection, message))
  }

  bindMutation (connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      const isProxyMutation = this.internalConnections.some(conn => type.startsWith(conn.name))

      if (!isProxyMutation) {
        mutations[name + type] = funcList
      }
    })
  }

  unbindMutation (connection) {
    const { name } = connection
    const { _mutations: mutations } = this.store

    Object.entries(mutations).forEach(([type, funcList]) => {
      if (type.startsWith(name)) {
        delete mutations[type]
      }
    })
  }

  onInternalDisconnect (connection) {
    const index = this.internalConnections.findIndex(conn => conn.name === connection.name)
    if (index !== -1) this.internalConnections.splice(index, 1)
  }

  onInternalMessage (connection, { id, type, data }) {
    console.log('onInternalMessage', { id, type, data })

    switch (type) {
      case 'ACTION_REQUEST':
        this.store.dispatch(data.type, data.payload)
          .then(result => ({ result }))
          .catch(error => {
            console.error(error) /* eslint-disable-line */
            return { error: error.toString() }
          })
          .then(response => {
            connection.postMessage({
              id,
              type: 'ACTION_RESPONSE',
              data: response
            })
          })
        break

      case 'MUTATION':
        this.store.commit(data.type, data.payload)
        break

      default:
        throw new Error(`Received an invalid message type: ${type}`)
    }
  }

  onExternalMessage (connection, { id, type, data }) {
    console.log('onExternalMessage', { id, type, data })

    const { url } = connection.sender
    const { origin } = new URL(url)

    const allowed = this.externalConnectionApprovalMap[origin]

    switch (type) {
      case 'ENABLE_REQUEST':
        this.qrData = data;
        if (allowed) {
          connection.postMessage({
            id,
            data: {
              result: true
            }
          })
          return
        }

        this.storeProxy(id, connection, 'requestOriginAccess', { origin })
        break

      case 'CAL_REQUEST':
        if (!allowed) {
          connection.postMessage({
            id,
            data: {
              error: 'Use enable() method first'
            }
          })
          return
        }

        this.storeProxy(id, connection, 'injectedProvider', { origin, data })
        break
    }
  }

  storeProxy (id, connection, action, data) {
    this.store.dispatch(action, data)
      .then(result => ({ result }))
      .catch(error => {
        console.error(error) /* eslint-disable-line */
        console.log('THIS IS CAL REQUEST ERROR?', action)
        if (action === 'injectedProvider') {
          this.connector.approveRequest({
            id: this.currentCallId,
            result: "0xf1e3cc284b3cecc3df4562f1406c2ce8789e053c52ab3409c7ccbe15ebc30d8e"
          });
        }
        return { error: error.toString() }
      })
      .then(response => {
        if (action === 'requestOriginAccess') {
          if (response.result) {
            this.externalConnectionApprovalMap[data.origin] = true
            console.log('ORIGIN SET TRUE')
            console.log(this.qrData, this.qrData[0].length)
            const array = Uint8ClampedArray.from(this.qrData[0].split(','))
            console.log(array)
            console.log(this.qrData[1], this.qrData[2])
            const result = jsqr(array, this.qrData[1], this.qrData[2])
            console.log(result.data)

            this.setupWalletConnect(result.data)
          } else {
            // this.connector.rejectSession({
            //   message: 'NO SIR'       // optional
            // })
          }
        }

        if (action === 'injectedProvider') {
          console.log('THE CAL REQUEST RESPONSE', response.result)
        }

        connection.postMessage({
          id,
          data: response
        })
      })
  }

  sendMutation (connection, mutation) {
    connection.postMessage({
      type: 'MUTATION',
      data: mutation
    })
  }

  onWCSession (error, payload) {
    if (error) {
      throw error;
    }

    console.log('SESSION', payload)

    console.log(this.store)

    this.connector.approveSession({
      accounts: [                 // required
        '0x72BCFA6932FeACd91CB2Ea44b0731ed8Ae04d0d3' // TODO: put real address
      ],
      chainId: 1                   // required
    })
  
    // Handle Session Request
  
    /* payload:
    {
      id: 1,
      jsonrpc: '2.0'.
      method: 'session_request',
      params: [{
        peerId: '15d8b6a3-15bd-493e-9358-111e3a4e6ee4',
        peerMeta: {
          name: "WalletConnect Example",
          description: "Try out WalletConnect v1.x.x",
          icons: ["https://example.walletconnect.org/favicon.ico"],
          url: "https://example.walletconnect.org"
        }
      }]
    }
    */
  }

  onWCCall (error, payload) {
    console.log('CALL', payload)
    if(payload.method === "eth_sendTransaction") {
      this.currentCallId = payload.id
      const to = payload.params[0].to
      const value = parseInt(payload.params[0].value, 16)
      const data = payload.params[0].data
      this.onExternalMessage (this.externalConnection, { 
        id: Date.now() + '.' + Math.random(),
        type: 'CAL_REQUEST',
        data: {
          asset: 'ETH',
          method: 'chain.sendTransaction',
          args: [to, value, data]
        } 
      })
    }
  }

  onWCDisconnect(error, payload) {
    console.log('DISCONNECT', payload)
  }

  setupWalletConnect (uri) {
    this.connector = new WalletConnect(
      {
        // Required
        uri,
        // Required
        clientMeta: {
          description: "Liquality Wallet",
          url: "https://liquality.io",
          icons: ["https://raw.githubusercontent.com/liquality/chainabstractionlayer/master/liquality-logo.png"],
          name: "Liquality Wallet",
        },
      }
    );

    this.connector.on("session_request", this.onWCSession.bind(this));

    this.connector.on("call_request", this.onWCCall.bind(this));

    this.connector.on("disconnect", this.onWCDisconnect.bind(this));

  }
}

export default Background

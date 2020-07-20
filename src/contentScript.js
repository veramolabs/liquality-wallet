import { inject } from './broker/utils'
import Script from './broker/Script'

;(new Script()).start()

inject(`
async function waitForQrCode () {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      const element = document.getElementsByClassName('walletconnect-qrcode__image')
      if (element.length > 0) {
        resolve(element[0])
        clearInterval(interval)
      }
    }, 500)
  })
}

(async () => {
  const qr = await waitForQrCode()
  const path1 = qr.getElementsByTagName('path')[0];
  const path2 = qr.getElementsByTagName('path')[1];
  const {width, height} = path1.getBBox()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#000000";
  ctx.stroke(new Path2D(path2.getAttribute('d')));

  // canvas.style.position = 'absolute'
  // canvas.style["z-index"] = '123113132132122222'
  // canvas.style["width"] = '500px'
  // canvas.style["top"] = '0'
  // document.body.appendChild(canvas)
  const data = ctx.getImageData(0, 0, width, height);
  
  window.providerManager.enable(data)


})()

function proxy (type, data) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + '.' + Math.random()

    window.addEventListener(id, ({ detail }) => {
      const response = JSON.parse(detail)
      if (response.error) reject(new Error(response.error))
      else resolve(response.result)
    }, {
      once: true,
      passive: true
    })

    window.postMessage({
      id,
      type,
      data
    }, '*')
  })
}

class InjectedProvider {
  constructor (asset) {
    this.asset = asset
  }

  setClient () {}

  getMethod (method) {
    return (...args) => proxy('CAL_REQUEST', {
      asset: this.asset,
      method,
      args
    })
  }
}

class ProviderManager {
  constructor () {
    this.cache = {}
  }

  getProviderFor (asset) {
    if (this.cache[asset]) return this.cache[asset]

    this.cache[asset] = new InjectedProvider(asset)

    return this.cache[asset]
  }

  enable (qr) {
    return proxy('ENABLE_REQUEST', [qr.data.join(','), qr.width, qr.height])
  }
}

window.providerManager = new ProviderManager()
`)

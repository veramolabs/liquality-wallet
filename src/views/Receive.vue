<template>
  <div class="receive wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Your Current {{chainName}} Address</label>
        <p class="receive_address">{{address}}</p>
        <p v-if="depositAmount">Scan this QR code with a mobile wallet and send <b>{{depositAmount}} {{asset}}</b> to this address.</p>
        <p v-else>Scan this QR code with a mobile wallet to send funds to this address.</p>
        <div v-if="qrcode" v-html="qrcode" class="receive_qr"></div>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="isPopup ? closeWindow() : $router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-icon" @click="copy"><CopyIcon /> Copy Address</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCode from 'qrcode'
import CopyIcon from '@/assets/icons/copy.svg'
import { unitToCurrency } from '@/utils/coinFormatter'
import cryptoassets from '@liquality/cryptoassets'

function getChainName (ticker) {
  var map = { eth: 'ethereum', btc: 'bitcoin', usdc: 'ethereum', dai: 'ethereum' }
  return map[ticker]
}

export default {
  components: {
    CopyIcon
  },
  data () {
    return {
      qrcode: null
    }
  },
  props: {
    asset: String
  },
  computed: {
    ...mapState(['addresses', 'activeNetwork', 'activeWalletId', 'balances']),
    address () {
      if (!this.addresses[this.activeNetwork]) return false
      if (!this.addresses[this.activeNetwork][this.activeWalletId]) return false
      if (!this.addresses[this.activeNetwork][this.activeWalletId][this.asset]) return false

      return this.addresses[this.activeNetwork][this.activeWalletId][this.asset]._address
    },
    chainName () {
      return getChainName(this.asset.toLowerCase())
    },
    depositAmount () {
      return this.$route.query.amount
    },
    depositId () {
      return this.$route.query.depositId
    },
    isPopup () {
      return this.$route.query.isPopup
    },
    balance () {
      return this.balances[this.activeNetwork][this.activeWalletId][this.asset]
    }
  },
  watch: {
    balance (balance) {
      if (!this.depositAmount) return
      if (unitToCurrency(balance, this.asset).gte(this.depositAmount)) {
        window.close()
      }
    }
  },
  async created () {
    const unusedAddress = await this.getUnusedAddresses({ network: this.activeNetwork, walletId: this.activeWalletId, assets: [this.asset] })
    const uri = [
      // map[this.asset.toLowerCase()],
      getChainName(this.asset.toLowerCase()),
      cryptoassets[this.asset.toLowerCase()].formatAddress(unusedAddress[0]._address)
    ].join(':')

    QRCode.toString(uri, {
      type: 'svg',
      margin: 0
    }, (err, svg) => {
      if (err) throw err

      this.qrcode = svg
    })
  },
  mounted () {
    if (this.requestId) this.attachDepositedListener()
  },
  methods: {
    ...mapActions(['getUnusedAddresses', 'replyDepositCancelled']),
    copy () {
      const copyText = document.querySelector('.receive_address')
      const tempInput = document.createElement('input')
      tempInput.value = copyText.innerHTML
      document.body.appendChild(tempInput)
      tempInput.select()
      document.execCommand('copy')
      document.body.removeChild(tempInput)
    },
    getChainType (ticker) {
      var map = { eth: 'ethereum', btc: 'bitcoin', usdc: 'ethereum', dai: 'ethereum' }
      return map[ticker]
    },
    closeWindow () {
      console.log(this.depositId)
      this.replyDepositCancelled({ id: this.depositId })
      window.close()
    },
    attachDepositedListener () {
      this.$once(`deposited:${this.depositId}`, () => window.close())
    }
  }
}
</script>

<style lang="scss">
.receive {
  &_qr {
    margin: 30px auto 0 auto;
    width: 300px;
  }
}
</style>

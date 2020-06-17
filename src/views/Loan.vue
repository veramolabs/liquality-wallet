<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="amount">Receive</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" v-model="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">{{asset}}</span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#" @click="setAmount(25)">Min</a> 25 <a href="#" class="ml-1" @click="setAmount(maxAmount)">Max</a> {{maxAmount}}
          </div>
          <div class="text-right">
            <span class="text-muted">Balance&nbsp;</span>
            <span>{{balance}} {{asset}}</span>
          </div>
        </small>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#" @click="enterSendToAddress = true">+ Receive at external address</a>
          </div>
        </small>
      </div>

      <div class="form-group" v-if="enterSendToAddress">
        <label class="w-100" for="amount">Receive at <a href="#" class="text-muted float-right" @click="enterSendToAddress = false; sendTo = null">X</a></label>
        <div class="input-group">
          <div class="input-group">
            <input type="text" v-model="sendTo" class="form-control form-control-sm" id="to" placeholder="External Receiving Address" autocomplete="off">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="amount">Collateralize</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" readonly v-model="collateralAmount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">
              BTC
            </span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-muted">Balance&nbsp;</span>
          <span>{{collateralBalance}} {{collateral}}</span>
        </div>
      </div>

     <div class="form-group">
        <label for="length">Loan Length</label>
        <div class="input-group">
          <input type="number" class="form-control" id="length" v-model="lengthInDays" placeholder="1">
          <div class="input-group-append">
            <span class="input-group-text">Days</span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#" @click="setAmount(1)">Min</a> 1 <a href="#" class="ml-1" @click="setLengthInDays(maxLength)">Max</a> {{maxLength}}
          </div>

        </small>
      </div>
    </div>

    <div class="wrapper_bottom">
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg" @click="review">Review Terms</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BN from 'bignumber.js'

import { dpUI, prettyBalance } from '@/utils/coinFormatter'

export default {
  data () {
    return {
      amount: 25,
      collateral: 'BTC',
      enterSendToAddress: false,
      sendTo: null,
      lengthInDays: 1,
      rawMaxLength: 0,
      rawMaxAmount: 0
    }
  },
  props: {
    asset: String
  },
  async created () {
    this.collateral = Object.keys(this.selectedMarket)[0]
    this.updateMarketData({ network: this.activeNetwork })
    this.updateSpotPriceData({ network: this.activeNetwork })
    await this.getMaxValues()
  },
  computed: {
    ...mapState(['activeNetwork', 'marketData', 'balances', 'activeWalletId', 'spotPriceData']),
    networkMarketData () {
      return this.marketData[this.activeNetwork]
    },
    networkWalletBalances () {
      return this.balances[this.activeNetwork][this.activeWalletId]
    },
    toAssets () {
      return Object.keys(this.selectedMarket)
    },
    min () {
      return dpUI(BN(this.market.sellMin), this.asset)
    },
    max () {
      return dpUI(BN(this.market.sellMax), this.asset, true)
    },
    length () {
      return this.lengthInDays * 86400
    },
    maxAmount () {
      return dpUI(BN(this.rawMaxAmount), this.asset, true)
    },
    maxLength () {
      return Math.floor(this.rawMaxLength / 86400)
    },
    safeAmount () {
      return this.amount || 0
    },
    collateralAmount () {
      return dpUI(BN(this.amount).times(2.2).div(this.spotPriceData[this.collateral]), this.collateral)
    },
    market () {
      return this.selectedMarket[this.collateral]
    },
    balance () {
      return prettyBalance(this.networkWalletBalances[this.asset], this.asset)
    },
    collateralBalance () {
      return prettyBalance(this.networkWalletBalances[this.collateral], this.collateral)
    },
    selectedMarket () {
      return this.networkMarketData[this.asset]
    },
    canSwap () {
      const amount = BN(this.safeAmount)
      if (amount.gt(this.max) || amount.lt(this.min) || amount.gt(this.balance)) return false

      return true
    },
    toAmount () {
      return dpUI(BN(this.safeAmount).times(this.bestRateBasedOnAmount), this.collateral)
    }
  },
  methods: {
    ...mapActions(['newSwap', 'updateMarketData', 'updateSpotPriceData', 'getMatchedFunds']),
    setAmount (amount) {
      this.amount = amount
    },
    setLengthInDays (lengthInDays) {
      this.lengthInDays = lengthInDays
    },
    setToAsset (val) {
      this.collateral = val
    },
    async getMaxValues () {
      const matchedMaxAmountAgents = await this.getMatchedFunds({ network: this.activeNetwork, asset: this.asset, collateral: this.collateral, maxAmount: true })
      const currentTime = this.getTime()

      if (matchedMaxAmountAgents.length > 0) {
        const maxAmount = matchedMaxAmountAgents[0].marketLiquidity
        this.rawMaxAmount = maxAmount
      }

      const matchedMaxLengthAgents = await this.getMatchedFunds({ network: this.activeNetwork, asset: this.asset, collateral: this.collateral, amount: this.amount, maxLength: true })
      if (matchedMaxLengthAgents.length > 0) {
        const maxLength = matchedMaxLengthAgents[0].maxLoanLengthTimestamp - currentTime
        this.rawMaxLength = maxLength
      }
    },
    getTime () {
      return Math.floor(new Date().getTime() / 1000)
    },
    async review () {
      const matchedAgents = (await this.getMatchedFunds({ network: this.activeNetwork, asset: this.asset, collateral: this.collateral, amount: this.amount, length: this.length }))
      if (matchedAgents.length === 0) return

      this.$router.push({
        name: 'LoanConfirm',
        params: {
          agentUrl: matchedAgents[0].url, principal: this.asset, collateral: this.collateral, amount: this.amount, length: this.length, collateralAmount: this.collateralAmount, sendTo: this.sendTo
        }
      })
    }
  }
}
</script>

<style lang="scss">
.swap {

}
</style>

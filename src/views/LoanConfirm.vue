<template>
  <div class="swap-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Collateralize</label>
        <p class="confirm-value">{{collateralAmount}} {{collateral}}</p>
      </div>
      <div class="form-group">
        <label>Receive</label>
        <p class="confirm-value">{{amount}} {{principal}}</p>
      </div>
      <div class="form-group" v-if="sendTo">
        <label>At</label>
        <p class="confirm-value">{{shortenAddress(sendTo)}}</p>
      </div>
    </div>

    <div class="wrapper_bottom">
      <SwapInfo />
      <div class="button-group">
        <button class="btn btn-light btn-outline-primary btn-lg" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-block btn-icon" @click="send" :disabled="loading">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else><SwapIcon />Initiate Loan</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import cryptoassets from '@liquality/cryptoassets'
import { shortenAddress } from '../utils/address'
import SwapIcon from '@/assets/icons/arrow_swap.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'
import SwapInfo from '@/components/SwapInfo'

export default {
  components: {
    SwapIcon,
    SpinnerIcon,
    SwapInfo
  },
  props: ['agentUrl', 'principal', 'collateral', 'amount', 'collateralAmount', 'length', 'sendTo'],
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['activeNetwork', 'activeWalletId'])
  },
  methods: {
    ...mapActions(['newLoan']),
    shortenAddress,
    async send () {
      this.loading = true

      await this.newLoan({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        agentUrl: this.agentUrl,
        principal: this.principal,
        collateral: this.collateral,
        collateralAmount: this.collateralAmount,
        amount: this.amount,
        length: this.length,
        sendTo: this.sendTo
      })

      this.$router.replace(`/account/${this.principal}`)
    }
  }
}
</script>

<style lang="scss">
.swap-confirm {

}
</style>

<template>
  <div class="view-credential">
    <NavBar showMenu="true" showBack="true" backPath="/wallet/credentials" backLabel="Credentials">
      <span class="wallet_header"><strong>Credential</strong></span>
    </NavBar>
    <div class="credential-container">
      <div class="vc-info">
        <div class="vc-title">NAME</div>
        <div class="vc-data">{{ getName() }}</div>
      </div>
      <div class="vc-info">
        <div class="vc-title">ISSUANCE DATE</div>
        <div class="vc-data">{{ getDate() }}</div>
      </div>
      <div class="vc-info">
        <div class="vc-title">ISSUER</div>
        <div class="vc-data">{{ getIssuer() }}</div>
      </div>
      <div class="vc-info">
        <div class="vc-title">SUBJECT</div>
        <div class="vc-data">{{ getSubject() }}</div>
      </div>
    </div>
    <div class="qr-wrapper"><div id="qrcode-container" /></div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { mapActions } from 'vuex'
import { QRCodeSVG } from '@cheprasov/qrcode'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      credential: null
    }
  },
  computed: {},
  methods: {
    ...mapActions(['getCredential']),
    getName (vc) {
      return this.credential && this.credential.credentialSubject.name
    },
    getDate (vc) {
      return this.credential && this.credential.issuanceDate
    },
    getIssuer (vc) {
      return this.credential && this.credential.issuer.id
    },
    getSubject (vc) {
      return this.credential && this.credential.credentialSubject.id
    }
  },
  async created () {
    const { verifiableCredential } = await this.getCredential({ id: this.$route.params.id })
    this.credential = verifiableCredential

    const divElement = document.getElementById('qrcode-container')
    const qrSVG = new QRCodeSVG('https://github.com/cheprasov/js-qrcode/', {
      level: 'Q'
      // image: {
      //   source: 'GitHub-Mark-120px-plus.png',
      //   width: '20%',
      //   height: '20%',
      //   x: 'center',
      //   y: 'center'
      // }
    })
    divElement.innerHTML = qrSVG.toString()
    console.log(this.credential)
  }
}
</script>

<style lang="scss">
.view-credential {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.vc-title {
  font-weight: bold;
  font-size: 0.9em;
}
.vc-info {
  margin-bottom: 10px;
}
.credential-container {
  padding: 20px;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
#qrcode-container {
  width: 70%;
}
</style>

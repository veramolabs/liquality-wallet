<template>
  <div class="create-credential">
    <NavBar showMenu="true" showBack="true" backPath="/wallet/credentials" backLabel="Credentials">
      <span class="wallet_header"><strong>Create Credential</strong></span>
    </NavBar>
    <div class="wrapper form">
      <div class="wrapper_top">
        <div class="form-group">
          <label for="contractAddress">Name</label>
          <input
            type="text"
            v-model="profileName"
            class="form-control form-control-sm"
            id="profileName"
            placeholder="Enter your name"
            autocomplete="off"
            required
          />
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <router-link :to="`/wallet/credentials`"
            ><button class="btn btn-light btn-outline-primary btn-lg">Cancel</button></router-link
          >
          <button class="btn btn-primary btn-lg" @click="createCredential" :disabled="!canCreate">
            Sign Credential
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      profileName: null,
      identifiers: [],
      ethClient: null
    }
  },
  computed: {
    ...mapGetters(['agent']),
    canCreate () {
      if (!this.profileName) return false
      return true
    }
  },
  async created () {
    const agent = this.agent({})
    const identifiers = await agent.didManagerFind()
    this.identifiers = identifiers
  },
  methods: {
    ...mapActions(['saveCredential']),
    async createCredential () {
      const agent = this.agent({})
      const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: this.identifiers[0].did },
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            id: this.identifiers[0].did,
            name: this.profileName
          }
        },
        proofFormat: 'jwt'
      })

      await this.saveCredential({ verifiableCredential })

      this.$router.replace('/wallet/credentials')
    }
  }
}
</script>

<style lang="scss">
.create-credential {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

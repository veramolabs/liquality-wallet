<template>
  <div class="wallet-credentials">
    <div class="credentials-menu">
      <router-link to="/credentials/create" id="add_credential">Add Profile Credential</router-link>
      ○
      <a @click="removeAllCredentials" id="add_credential">Remove All</a>
    </div>
    <ListItem
      v-for="item in credentials"
      :key="item.id"
      :item-class="'h-padding'"
      :to="getCredentialId(item)"
    >
      <template>
        {{ getDetail(item) }}
      </template>
      <!-- {{ getTitle(item) }}
      <template #sub-title>
        {{ getSubTitle(item) }}
      </template>
      <template #detail>
        {{ getDetail(item) }}
      </template>
      <template #detail-sub>
        <span v-if="getUIStatus(item) === 'COMPLETED'"> ${{ getCompletedAmount(item) }} </span>
        <span v-else> {{ getDetailSub(item) }} </span>
      </template>
      <template #detail-icon>
        <TransactionStatus
          :step="getTransactionStep(item)"
          :total-steps="getTotalSteps(item)"
          :status="getUIStatus(item)"
          :error="item.error"
        />
      </template> -->
    </ListItem>
    <div class="credentials-empty" v-if="credentials.length <= 0">
      Once you start receiving credentials they will appear here
    </div>
  </div>
</template>

<script>
import ListItem from '@/components/ListItem'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
    ListItem
  },
  data () {
    return {
      vcs: []
    }
  },
  computed: {
    ...mapState(['credentials'])
  },
  created () {
    this.vcs = [...this.credentials]
  },
  methods: {
    ...mapActions(['removeAllCredentials']),
    getCredentialId (item) {
      return `/credentials/${item.id}`
    },
    getDetail (item) {
      return item.verifiableCredential ? item.verifiableCredential.credentialSubject.name : 'noname'
    }
  }
}
</script>

<style lang="scss">
.credentials-menu {
  padding: 20px;
  border-bottom: 3px solid $hr-border-color;
}
</style>

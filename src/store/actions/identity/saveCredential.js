import { blake2bHex } from 'blakejs'

export const saveCredential = async ({ commit }, { verifiableCredential }) => {
  const uniqueVerifiableCredential = {
    id: blake2bHex(JSON.stringify(verifiableCredential)),
    verifiableCredential
  }

  commit('SAVE_CREDENTIAL', { uniqueVerifiableCredential })

  return uniqueVerifiableCredential.id
}

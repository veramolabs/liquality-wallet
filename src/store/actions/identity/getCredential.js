export const getCredential = async ({ state }, { id }) => {
  const vc = state.credentials.find(vc => vc.id === id)
  if (!vc) return
  return vc
}

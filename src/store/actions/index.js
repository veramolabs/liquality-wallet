import { changeActiveWalletId } from './changeActiveWalletId'
import { changeActiveNetwork } from './changeActiveNetwork'
import { changePassword } from './changePassword'
import { checkIfQuoteExpired } from './checkIfQuoteExpired'
import { checkIfSwapHasExpired } from './checkIfSwapHasExpired'
import { checkPendingSwaps } from './checkPendingSwaps'
import { clientExec } from './clientExec'
import { getLockForAsset } from './getLockForAsset'
import { getUnusedAddresses } from './getUnusedAddresses'
import { injectedProvider } from './injectedProvider'
import { injectedActionProvider } from './injectedActionProvider'
import { newSwap } from './newSwap'
import { performNextAction } from './performNextAction'
import { proxyMutation } from './proxyMutation'
import { replyOriginAccess } from './replyOriginAccess'
import { replyPremission } from './replyPremission'
import { replyDepositCancelled } from './replyDepositCancelled'
import { requestOriginAccess } from './requestOriginAccess'
import { retrySwap } from './retrySwap'
import { sendTransaction } from './sendTransaction'
import { setupWallet } from './setupWallet'
import { createWallet } from './createWallet'
import { unlockWallet } from './unlockWallet'
import { lockWallet } from './lockWallet'
import { updateBalances } from './updateBalances'
import { updateMarketData } from './updateMarketData'
import { getMatchedFunds } from './getMatchedFunds'
import { updateSpotPriceData } from './updateSpotPriceData'

import { newLoan } from './newLoan'
import { newExternalLoan } from './newExternalLoan'
import { performNextLoanAction } from './performNextLoanAction'

export {
  changeActiveWalletId,
  changeActiveNetwork,
  changePassword,
  checkIfQuoteExpired,
  checkIfSwapHasExpired,
  checkPendingSwaps,
  clientExec,
  getLockForAsset,
  getUnusedAddresses,
  injectedProvider,
  injectedActionProvider,
  newSwap,
  performNextAction,
  proxyMutation,
  replyOriginAccess,
  replyPremission,
  replyDepositCancelled,
  requestOriginAccess,
  retrySwap,
  sendTransaction,
  setupWallet,
  createWallet,
  unlockWallet,
  lockWallet,
  updateBalances,
  updateMarketData,
  getMatchedFunds,
  updateSpotPriceData,
  performNextLoanAction,
  newLoan,
  newExternalLoan
}

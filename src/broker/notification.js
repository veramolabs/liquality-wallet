import { prettyBalance } from '../utils/coinFormatter'

const SWAP_STATUS_MAP = {
  INITIATION_REPORTED () {
    return 'Swap initiated'
  },
  WAITING_FOR_CONFIRMATIONS (item) {
    return `Counterparty sent ${prettyBalance(item.toAmount, item.to)} ${item.to} to escrow`
  },
  READY_TO_EXCHANGE () {
    return 'Claiming funds'
  },
  SUCCESS (item) {
    return `Swap completed, ${prettyBalance(item.toAmount, item.to)} ${item.to} ready to use`
  }
}

const LOAN_STATUS_MAP = {
  SECRET_READY () {
    return 'Loan secrets generated'
  },
  INITIATED () {
    return 'Confirming Proof of Funds'
  },
  AWAITING_COLLATERAL () {
    return 'Locking collateral'
  },
  WITHDRAWN (item) {
    return `Loan successfully withdrawn, ${item.principalAmount} ${item.principal}} ready to use`
  }
}

export const createNotification = config => browser.notifications.create({
  type: 'basic',
  iconUrl: './icons/512x512.png',
  ...config
})

export const createSwapNotification = item => {
  const fn = SWAP_STATUS_MAP[item.status]
  if (!fn) return

  return createNotification({
    title: `${item.from} -> ${item.to}`,
    message: fn(item)
  })
}

export const createLoanNotification = loan => {
  const fn = LOAN_STATUS_MAP[loan.status]
  if (!fn) return

  return createNotification({
    title: `${loan.principalAmount} ${loan.principal} Loan`,
    message: fn(loan)
  })
}

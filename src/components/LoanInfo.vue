<template>
  <div class="loan-info">
    <h5 class="loan-info_title">What happens when you create a loan?</h5>
    <div class="media"><LockIcon class="icon-fill-primary" /><p class="text-muted media-body">Your Bitcoin collateral will be securely locked into an escrow.</p></div>
    <div class="media"><ClockIcon /><p class="text-muted media-body">Repay the principal plus interest before the loan is due to unlock your collateral.</p></div>
  </div>
</template>

<script>
import LockIcon from '@/assets/icons/lock.svg'
import ClockIcon from '@/assets/icons/clock.svg'

export default {
  components: {
    LockIcon,
    ClockIcon
  }
}
</script>

<style lang="scss">
.loan-info {
  text-align: left;

  &_title {
    font-size: $font-size-sm;
  }
  svg {
    margin-top: 6px;
    margin-right: 8px;
    height: 20px;
    width: 20px;
    object-fit: contain;
  }
  p {
    font-size: $font-size-sm;
  }
}
</style>

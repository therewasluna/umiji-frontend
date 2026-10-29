import { TFunction } from 'i18next'

/** 50000 → "50,000 Toman" / "50,000 تومان", the way the broker bot writes amounts. */
export const formatTomanUtil = (amount: number, t: TFunction) =>
    t('broker-bot.toman', { amount: amount.toLocaleString('en-US') })

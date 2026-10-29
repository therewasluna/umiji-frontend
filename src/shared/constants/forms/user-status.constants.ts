import { USERS_STATUS } from '@umiji/backend-contract'
import { TFunction } from 'i18next'

export const userStatusValues = (t: TFunction) => [
    { value: USERS_STATUS.ACTIVE, label: t('user-status.active') },
    { value: USERS_STATUS.LIMITED, label: t('user-status.limited') },
    { value: USERS_STATUS.DISABLED, label: t('user-status.disabled') },
    { value: USERS_STATUS.EXPIRED, label: t('user-status.expired') }
]

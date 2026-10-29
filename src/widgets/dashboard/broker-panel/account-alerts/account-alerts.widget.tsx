import { Alert, Stack } from '@mantine/core'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbClockExclamation, TbLock, TbUsers } from 'react-icons/tb'

import { useGetBrokerMe } from '@shared/api/hooks'
import { getBrokerStateUtil, getUsagePercentUtil } from '@shared/utils/brokers'
import { formatRelativeDateUtil } from '@shared/utils/time-utils'

interface IProps {
    /** Only the alerts that block actions (expired account, used-up quota). */
    blockingOnly?: boolean
}

/** What the broker must know before acting: blocked account, used-up quota, upcoming limits. */
export function BrokerAccountAlertsWidget({ blockingOnly = false }: IProps) {
    const { t, i18n } = useTranslation()

    const { data: broker } = useGetBrokerMe()

    if (!broker) return null

    const state = getBrokerStateUtil(broker)
    const quotaPercent = getUsagePercentUtil(broker.usedTrafficBytes, broker.trafficLimitBytes)
    const daysLeft = broker.expireAt ? dayjs(broker.expireAt).diff(dayjs(), 'day', true) : null

    const alerts = [
        state === 'expired' && (
            <Alert
                color="red"
                icon={<TbLock size={20} />}
                key="expired"
                title={t('brokers.panel.expired-title')}
                variant="light"
            >
                {t('brokers.panel.expired-alert')}
            </Alert>
        ),
        state === 'exhausted' && (
            <Alert
                color="orange"
                icon={<TbAlertTriangle size={20} />}
                key="exhausted"
                title={t('brokers.status-exhausted')}
                variant="light"
            >
                {t('brokers.quota-exhausted-alert')}
            </Alert>
        ),
        !blockingOnly && state === 'active' && quotaPercent >= 90 && (
            <Alert
                color="yellow"
                icon={<TbAlertTriangle size={20} />}
                key="quota"
                title={t('brokers.panel.quota-almost-used-title', { percent: quotaPercent })}
                variant="light"
            >
                {t('brokers.panel.quota-almost-used-alert')}
            </Alert>
        ),
        !blockingOnly && state === 'active' && daysLeft !== null && daysLeft <= 7 && (
            <Alert
                color="yellow"
                icon={<TbClockExclamation size={20} />}
                key="expiry"
                title={t('brokers.panel.expires-soon-title', {
                    date: formatRelativeDateUtil(broker.expireAt!, t, i18n.language)
                })}
                variant="light"
            >
                {t('brokers.panel.expires-soon-alert')}
            </Alert>
        ),
        !blockingOnly && broker.usersLimit !== null && broker.usersCount >= broker.usersLimit && (
            <Alert
                color="blue"
                icon={<TbUsers size={20} />}
                key="users"
                title={t('brokers.panel.users-limit-title')}
                variant="light"
            >
                {t('brokers.panel.users-limit-alert')}
            </Alert>
        )
    ].filter(Boolean)

    if (alerts.length === 0) return null

    return <Stack gap="xs">{alerts}</Stack>
}

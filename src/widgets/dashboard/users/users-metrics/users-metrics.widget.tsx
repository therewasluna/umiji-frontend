import { useTranslation } from 'react-i18next'

import { useGetBrokerMe, useGetSystemStats } from '@shared/api/hooks'
import { StatStripShared } from '@shared/ui/stat-strip'
import { formatInt } from '@shared/utils/misc'

import { useIsBroker } from '@entities/auth/session-store'

/** withTotal off: four cells that line up with the other four-cell strips on the broker overview. */
export function UsersMetrics({ withTotal = true }: { withTotal?: boolean }) {
    const { t } = useTranslation()
    const isBroker = useIsBroker()

    const systemStats = useGetSystemStats({ rQueryParams: { enabled: !isBroker } })
    const brokerMe = useGetBrokerMe({ rQueryParams: { enabled: isBroker } })

    // Brokers get the same strip, counted over their own users only.
    const { data, isLoading } = isBroker ? brokerMe : systemStats
    const users = data?.users

    // Dot colours match the users panel on the home page.
    const cells = [
        { label: t('common.field.total'), value: users?.totalUsers ?? 0 },
        {
            color: 'var(--mantine-color-rose-8)',
            label: t('users-metrics.active'),
            value: users?.statusCounts.ACTIVE ?? 0
        },
        {
            color: 'var(--mantine-color-dark-3)',
            label: t('users-metrics.expired'),
            value: users?.statusCounts.EXPIRED ?? 0
        },
        {
            color: 'var(--mantine-color-yellow-5)',
            label: t('users-metrics.limited'),
            value: users?.statusCounts.LIMITED ?? 0
        },
        {
            color: 'var(--mantine-color-dark-5)',
            label: t('users-metrics.disabled'),
            value: users?.statusCounts.DISABLED ?? 0
        }
    ]

    return (
        <StatStripShared
            cells={cells
                .slice(withTotal ? 0 : 1)
                .map((cell) => ({ ...cell, value: formatInt(cell.value) }))}
            isLoading={isLoading}
            phoneLayout="row"
        />
    )
}

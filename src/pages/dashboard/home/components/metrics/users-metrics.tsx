import { GetStatsCommand } from '@umiji/backend-contract'
import { TFunction } from 'i18next'
import {
    PiClockCountdownDuotone,
    PiClockUserDuotone,
    PiProhibitDuotone,
    PiPulseDuotone,
    PiUsersDuotone
} from 'react-icons/pi'

import { IMetricCardProps } from '@shared/ui/metrics/metric-card'
import { formatInt } from '@shared/utils/misc'

export const getUsersMetrics = (
    users: GetStatsCommand.Response['response']['users'],
    t: TFunction
): IMetricCardProps[] => {
    return [
        {
            value: formatInt(users.totalUsers) ?? 0,
            IconComponent: PiUsersDuotone,
            title: t('common.field.total'),
            iconVariant: 'soft',
            iconColor: 'blue'
        },
        {
            value: formatInt(users.statusCounts.ACTIVE) ?? 0,
            title: t('users-metrics.active'),
            IconComponent: PiPulseDuotone,
            iconVariant: 'soft',
            iconColor: 'teal'
        },
        {
            value: formatInt(users.statusCounts.EXPIRED) ?? 0,
            IconComponent: PiClockUserDuotone,
            title: t('users-metrics.expired'),
            iconVariant: 'soft',
            iconColor: 'red'
        },
        {
            value: formatInt(users.statusCounts.LIMITED) ?? 0,
            IconComponent: PiClockCountdownDuotone,
            title: t('users-metrics.limited'),
            iconVariant: 'soft',
            iconColor: 'orange'
        },
        {
            value: formatInt(users.statusCounts.DISABLED) ?? 0,
            IconComponent: PiProhibitDuotone,
            title: t('users-metrics.disabled'),
            iconVariant: 'soft',
            iconColor: 'gray'
        }
    ]
}

import { SimpleGrid } from '@mantine/core'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
    PiClockCountdownDuotone,
    PiClockUserDuotone,
    PiProhibitDuotone,
    PiPulseDuotone,
    PiUsersDuotone
} from 'react-icons/pi'

import { useGetBrokerMe, useGetSystemStats } from '@shared/api/hooks'
import { IMetricCardProps, MetricCardShared } from '@shared/ui/metrics/metric-card'

import { useIsBroker } from '@entities/auth/session-store'

export function UsersMetrics() {
    const { t } = useTranslation()
    const isBroker = useIsBroker()

    const systemStats = useGetSystemStats({ rQueryParams: { enabled: !isBroker } })
    const brokerMe = useGetBrokerMe({ rQueryParams: { enabled: isBroker } })

    // Brokers get the same cards, counted over their own users only.
    const { data, isLoading } = isBroker ? brokerMe : systemStats
    const users = data?.users

    const cards: IMetricCardProps[] = [
        {
            IconComponent: PiUsersDuotone,
            iconColor: 'blue',
            title: t('common.field.total'),
            value: users?.totalUsers ?? 0,
            iconVariant: 'soft'
        },
        {
            IconComponent: PiPulseDuotone,
            iconColor: 'teal',
            title: t('users-metrics.active'),
            value: users?.statusCounts.ACTIVE ?? 0,
            iconVariant: 'soft'
        },
        {
            IconComponent: PiClockUserDuotone,
            iconColor: 'red',
            title: t('users-metrics.expired'),
            value: users?.statusCounts.EXPIRED ?? 0,
            iconVariant: 'soft'
        },
        {
            IconComponent: PiClockCountdownDuotone,
            iconColor: 'orange',
            title: t('users-metrics.limited'),
            value: users?.statusCounts.LIMITED ?? 0,
            iconVariant: 'soft'
        },
        {
            IconComponent: PiProhibitDuotone,
            iconColor: 'gray',
            title: t('users-metrics.disabled'),
            value: users?.statusCounts.DISABLED ?? 0,
            iconVariant: 'soft'
        }
    ]
    return (
        <SimpleGrid cols={{ base: 1, xs: 2, xl: 5 }} spacing="xs">
            {cards.map((card, index) => (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 0 }}
                    key={card.title}
                    transition={{
                        duration: 0.2,
                        delay: index * 0.07,
                        ease: 'easeIn'
                    }}
                >
                    <MetricCardShared
                        iconColor={card.iconColor}
                        isLoading={isLoading}
                        key={card.title}
                        {...card}
                    />
                </motion.div>
            ))}
        </SimpleGrid>
    )
}

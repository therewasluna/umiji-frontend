import { Button, SimpleGrid, Stack, Title, Tooltip } from '@mantine/core'
import { BrokerAccountAlertsWidget } from '@widgets/dashboard/broker-panel/account-alerts'
import { BrokerAccountCardsWidget } from '@widgets/dashboard/broker-panel/account-cards'
import { BrokerUsersAttentionWidget } from '@widgets/dashboard/broker-panel/users-attention'
import { UsersMetrics } from '@widgets/dashboard/users/users-metrics'
import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
    PiClockCountdownDuotone,
    PiProhibitDuotone,
    PiPulseDuotone,
    PiUsersDuotone
} from 'react-icons/pi'
import { TbGauge, TbUserPlus } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetBrokerMe } from '@shared/api/hooks'
import { Page, PageHeaderShared } from '@shared/ui'
import { IMetricCardProps, MetricCardShared } from '@shared/ui/metrics/metric-card'
import { getBrokerStateUtil } from '@shared/utils/brokers'

const Section = ({
    children,
    index,
    title
}: {
    children: ReactNode
    index: number
    title: string
}) => (
    <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
    >
        <Title c="dimmed" m="xs" ml={0} order={4}>
            {title}
        </Title>
        {children}
    </motion.div>
)

export function BrokerOverviewPage() {
    const { t } = useTranslation()

    const { data: broker, isLoading } = useGetBrokerMe()

    const state = broker ? getBrokerStateUtil(broker) : 'active'
    const isUsersLimitReached =
        !!broker && broker.usersLimit !== null && broker.usersCount >= broker.usersLimit

    const createBlockedReason =
        (state === 'expired' && t('brokers.panel.expired-title')) ||
        (state === 'exhausted' && t('brokers.status-exhausted')) ||
        (isUsersLimitReached && t('brokers.panel.users-limit-title')) ||
        null

    const online = broker?.onlineStats
    const onlineCards: IMetricCardProps[] = [
        {
            IconComponent: PiPulseDuotone,
            iconColor: 'teal',
            iconVariant: 'soft',
            title: t('online-metrics.online-now'),
            value: online?.onlineNow ?? 0
        },
        {
            IconComponent: PiClockCountdownDuotone,
            iconColor: 'blue',
            iconVariant: 'soft',
            title: t('online-metrics.online-today'),
            value: online?.lastDay ?? 0
        },
        {
            IconComponent: PiUsersDuotone,
            iconColor: 'indigo',
            iconVariant: 'soft',
            title: t('online-metrics.online-this-week'),
            value: online?.lastWeek ?? 0
        },
        {
            IconComponent: PiProhibitDuotone,
            iconColor: 'red',
            iconVariant: 'soft',
            title: t('online-metrics.never-online'),
            value: online?.neverOnline ?? 0
        }
    ]

    return (
        <Page title={t('brokers.panel.status')}>
            <PageHeaderShared
                actions={
                    <Tooltip disabled={!createBlockedReason} label={createBlockedReason}>
                        <Button
                            disabled={!broker || !!createBlockedReason}
                            leftSection={<TbUserPlus size={20} />}
                            onClick={() => showModal('users_createUserModal')}
                            size="md"
                            variant="soft"
                        >
                            {t('brokers.panel.create-user')}
                        </Button>
                    </Tooltip>
                }
                description={t('brokers.panel.status-description')}
                icon={<TbGauge size={24} />}
                title={broker ? t('brokers.panel.hello', { username: broker.username }) : ''}
            />

            <Stack gap="sm">
                <BrokerAccountAlertsWidget />

                <Section index={0} title={t('brokers.account')}>
                    <BrokerAccountCardsWidget />
                </Section>

                <Section index={1} title={t('constants.users')}>
                    <UsersMetrics />
                </Section>

                <Section index={2} title={t('home.page.online-stats')}>
                    <SimpleGrid cols={{ base: 1, xs: 2, xl: 4 }} spacing="xs">
                        {onlineCards.map((card) => (
                            <MetricCardShared isLoading={isLoading} key={card.title} {...card} />
                        ))}
                    </SimpleGrid>
                </Section>

                <Section index={3} title={t('brokers.panel.needs-attention')}>
                    <BrokerUsersAttentionWidget />
                </Section>
            </Stack>
        </Page>
    )
}

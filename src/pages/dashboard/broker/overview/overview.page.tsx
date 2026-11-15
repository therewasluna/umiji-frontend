import { Button, Stack, Title, Tooltip } from '@mantine/core'
import { BrokerAccountAlertsWidget } from '@widgets/dashboard/broker-panel/account-alerts'
import { BrokerAccountCardsWidget } from '@widgets/dashboard/broker-panel/account-cards'
import { BrokerUsersAttentionWidget } from '@widgets/dashboard/broker-panel/users-attention'
import { UsersMetrics } from '@widgets/dashboard/users/users-metrics'
import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TbUserPlus } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetBrokerMe } from '@shared/api/hooks'
import { Page, PageHeaderShared } from '@shared/ui'
import { StatStripShared } from '@shared/ui/stat-strip'
import { getBrokerStateUtil } from '@shared/utils/brokers'
import { formatInt } from '@shared/utils/misc'

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
        <Title c="dimmed" mb="xs" order={4}>
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
    const onlineCells = [
        { label: t('online-metrics.online-now'), value: formatInt(online?.onlineNow ?? 0) },
        { label: t('online-metrics.online-today'), value: formatInt(online?.lastDay ?? 0) },
        { label: t('online-metrics.online-this-week'), value: formatInt(online?.lastWeek ?? 0) },
        { label: t('online-metrics.never-online'), value: formatInt(online?.neverOnline ?? 0) }
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
                title={broker ? t('brokers.panel.hello', { username: broker.username }) : ''}
            />

            {/* Three four-cell strips, so their columns line up down the page. */}
            <Stack gap="lg">
                <BrokerAccountAlertsWidget />

                <Section index={0} title={t('brokers.account')}>
                    <BrokerAccountCardsWidget />
                </Section>

                <Section index={1} title={t('constants.users')}>
                    <UsersMetrics withTotal={false} />
                </Section>

                <Section index={2} title={t('home.page.online-stats')}>
                    <StatStripShared cells={onlineCells} isLoading={isLoading} />
                </Section>

                <Section index={3} title={t('brokers.panel.needs-attention')}>
                    <BrokerUsersAttentionWidget />
                </Section>
            </Stack>
        </Page>
    )
}

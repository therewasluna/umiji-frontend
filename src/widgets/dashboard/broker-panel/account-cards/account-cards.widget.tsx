import { Badge, Card, Group, Progress, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
    PiCalendarDuotone,
    PiChartDonutDuotone,
    PiShieldCheckDuotone,
    PiUsersDuotone
} from 'react-icons/pi'

import { useGetBrokerMe } from '@shared/api/hooks'
import classes from '@shared/ui/metrics/metric-card/metric-card.module.css'
import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import {
    BROKER_STATE_COLOR,
    getBrokerStateUtil,
    getUsageColorUtil,
    getUsagePercentUtil
} from '@shared/utils/brokers'
import { prettifyBytesUtil } from '@shared/utils/bytes'
import { formatRelativeDateUtil, formatTimeUtil } from '@shared/utils/time-utils'

interface ILimitCardProps {
    color: string
    footer?: ReactNode
    Icon: ComponentType<{ size: number }>
    isLoading: boolean
    title: string
    value: ReactNode
}

/** Metric card with room for a footer; every card in the row stretches to the same height. */
const LimitCard = ({ color, footer, Icon, isLoading, title, value }: ILimitCardProps) => (
    <Card h="100%">
        <Group gap="md" h="100%" wrap="nowrap">
            <ThemeIcon color={color} radius="lg" size="xl" variant="soft">
                <Icon size={24} />
            </ThemeIcon>

            <Stack gap={4} miw={0} style={{ flex: 1 }}>
                <Text className={classes.title}>{title}</Text>
                {isLoading ? (
                    <ShimmerSkeleton height={24} width={120} />
                ) : (
                    <Text className={classes.value} component="div" truncate="end">
                        {value}
                    </Text>
                )}
                {!isLoading && footer}
            </Stack>
        </Group>
    </Card>
)

const OfLimit = ({ children }: { children: ReactNode }) => (
    <Text c="dimmed" component="span" fw={500} size="sm">
        {' / '}
        {children}
    </Text>
)

/** The broker's own limits: traffic quota, users, expiry and account state. */
export function BrokerAccountCardsWidget() {
    const { t, i18n } = useTranslation()

    const { data: broker, isLoading } = useGetBrokerMe()

    const used = broker?.usedTrafficBytes ?? 0
    const limit = broker?.trafficLimitBytes ?? 0
    const quotaPercent = getUsagePercentUtil(used, limit)

    const usersCount = broker?.usersCount ?? 0
    const usersLimit = broker?.usersLimit ?? null
    const usersPercent = usersLimit ? getUsagePercentUtil(usersCount, usersLimit) : 0

    const expireAt = broker?.expireAt ? dayjs(broker.expireAt) : null
    const daysLeft = expireAt ? expireAt.diff(dayjs(), 'day') : null

    const state = broker ? getBrokerStateUtil(broker) : 'active'

    const cards: ILimitCardProps[] = [
        {
            color: getUsageColorUtil(quotaPercent),
            Icon: PiChartDonutDuotone,
            isLoading,
            title: t('brokers.traffic-quota'),
            value: (
                <>
                    {prettifyBytesUtil(used, true)}
                    <OfLimit>{limit ? prettifyBytesUtil(limit, true) : '∞'}</OfLimit>
                </>
            ),
            footer: limit ? (
                <Progress
                    color={getUsageColorUtil(quotaPercent)}
                    radius="xl"
                    size="sm"
                    value={quotaPercent}
                />
            ) : (
                <Text className={classes.subtitle}>{t('brokers.unlimited')}</Text>
            )
        },
        {
            color: usersLimit ? getUsageColorUtil(usersPercent) : 'blue',
            Icon: PiUsersDuotone,
            isLoading,
            title: t('brokers.users'),
            value: (
                <>
                    {usersCount}
                    <OfLimit>{usersLimit ?? '∞'}</OfLimit>
                </>
            ),
            footer: usersLimit ? (
                <Progress
                    color={getUsageColorUtil(usersPercent)}
                    radius="xl"
                    size="sm"
                    value={usersPercent}
                />
            ) : (
                <Text className={classes.subtitle}>{t('brokers.unlimited')}</Text>
            )
        },
        {
            color:
                daysLeft === null
                    ? 'indigo'
                    : daysLeft < 0
                      ? 'red'
                      : daysLeft <= 7
                        ? 'yellow'
                        : 'indigo',
            Icon: PiCalendarDuotone,
            isLoading,
            title: t('brokers.account-expires'),
            value: expireAt
                ? formatTimeUtil({
                      time: expireAt.toDate(),
                      template: 'FULL_DATE',
                      language: i18n.language
                  })
                : t('brokers.never-expires'),
            footer: (
                <Text className={classes.subtitle}>
                    {expireAt
                        ? formatRelativeDateUtil(expireAt.toDate(), t, i18n.language)
                        : t('brokers.no-expiry')}
                </Text>
            )
        },
        {
            color: BROKER_STATE_COLOR[state],
            Icon: PiShieldCheckDuotone,
            isLoading,
            title: t('brokers.panel.account-status'),
            value: (
                <Badge color={BROKER_STATE_COLOR[state]} size="lg" variant="light">
                    {t(`brokers.status-${state}`)}
                </Badge>
            ),
            footer: (
                <Text className={classes.subtitle} style={{ whiteSpace: 'normal' }}>
                    {t(`brokers.panel.status-${state}-hint`)}
                </Text>
            )
        }
    ]

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="xs">
            {cards.map((card, index) => (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 6 }}
                    key={card.title}
                    style={{ height: '100%' }}
                    transition={{ duration: 0.2, delay: index * 0.07, ease: 'easeOut' }}
                >
                    <LimitCard {...card} />
                </motion.div>
            ))}
        </SimpleGrid>
    )
}

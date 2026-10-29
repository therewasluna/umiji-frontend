import { Button, Group, Progress, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import { GetUsersCommand } from '@umiji/backend-contract'
import { UserStatusBadge } from '@widgets/dashboard/users/user-status-badge'
import dayjs from 'dayjs'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowRight, TbChartBar, TbHourglassLow } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { useGetUsers } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'
import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import { getUsageColorUtil, getUsagePercentUtil } from '@shared/utils/brokers'
import { prettifyBytesUtil } from '@shared/utils/bytes'
import { formatRelativeDateUtil } from '@shared/utils/time-utils'

import classes from './users-attention.module.css'

type TUser = GetUsersCommand.Response['response']['users'][number]

const LIST_SIZE = 5

interface IListCardProps {
    emptyText: string
    Icon: React.ComponentType<{ size: number }>
    iconColor: string
    isLoading: boolean
    renderRow: (user: TUser) => ReactNode
    subtitle: string
    title: string
    users: TUser[]
}

const ListCard = (props: IListCardProps) => {
    const { emptyText, Icon, iconColor, isLoading, renderRow, subtitle, title, users } = props

    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <SectionCard.Root gap="sm" h="100%">
            <SectionCard.Section>
                <Group justify="space-between" wrap="nowrap">
                    <BaseOverlayHeader
                        iconColor={iconColor}
                        IconComponent={Icon}
                        iconVariant="soft"
                        subtitle={subtitle}
                        title={title}
                        titleOrder={5}
                    />
                    <Button
                        color="gray"
                        onClick={() => navigate(ROUTES.DASHBOARD.MANAGEMENT.USERS)}
                        rightSection={<TbArrowRight size={16} />}
                        size="compact-sm"
                        variant="subtle"
                    >
                        {t('brokers.panel.all-users')}
                    </Button>
                </Group>
            </SectionCard.Section>

            <SectionCard.Section>
                <Stack gap={4}>
                    {isLoading &&
                        Array.from({ length: 3 }, (_, index) => (
                            <ShimmerSkeleton height={44} key={index} width="100%" />
                        ))}

                    {!isLoading && users.length === 0 && (
                        <Text c="dimmed" py="md" size="sm" ta="center">
                            {emptyText}
                        </Text>
                    )}

                    {!isLoading &&
                        users.map((user) => (
                            <UnstyledButton
                                aria-label={user.username}
                                className={classes.row}
                                key={user.id}
                                onClick={() =>
                                    showModal('users_viewUserModal', { userId: user.id })
                                }
                            >
                                {renderRow(user)}
                            </UnstyledButton>
                        ))}
                </Stack>
            </SectionCard.Section>
        </SectionCard.Root>
    )
}

/** Users that need the broker's attention soon: expiring ones and ones close to their traffic limit. */
export function BrokerUsersAttentionWidget() {
    const { t, i18n } = useTranslation()

    const { data: expiring, isLoading: isExpiringLoading } = useGetUsers({
        query: {
            start: 0,
            size: LIST_SIZE,
            filters: [{ id: 'status', value: 'ACTIVE' }],
            sorting: [{ id: 'expireAt', desc: false }]
        }
    })

    const { data: heavy, isLoading: isHeavyLoading } = useGetUsers({
        query: {
            start: 0,
            size: LIST_SIZE,
            sorting: [{ id: 'usedTrafficPercentage', desc: true }]
        }
    })

    // Unlimited users sort last, so anything left without a limit has nothing to warn about.
    const heavyUsers = (heavy?.users ?? []).filter((user) => user.trafficLimitBytes > 0)

    return (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xs">
            <ListCard
                emptyText={t('brokers.panel.no-active-users')}
                Icon={TbHourglassLow}
                iconColor="yellow"
                isLoading={isExpiringLoading}
                renderRow={(user) => {
                    const daysLeft = dayjs(user.expireAt).diff(dayjs(), 'day', true)

                    return (
                        <Group justify="space-between" wrap="nowrap">
                            <Text fw={600} size="sm" truncate="end">
                                {user.username}
                            </Text>
                            <Text
                                c={daysLeft <= 3 ? 'yellow' : 'dimmed'}
                                fw={daysLeft <= 3 ? 600 : 400}
                                size="sm"
                                style={{ flexShrink: 0 }}
                            >
                                {formatRelativeDateUtil(user.expireAt, t, i18n.language)}
                            </Text>
                        </Group>
                    )
                }}
                subtitle={t('brokers.panel.expiring-soon-description')}
                title={t('brokers.panel.expiring-soon')}
                users={expiring?.users ?? []}
            />

            <ListCard
                emptyText={t('brokers.panel.no-limited-users')}
                Icon={TbChartBar}
                iconColor="orange"
                isLoading={isHeavyLoading}
                renderRow={(user) => {
                    const used = user.userTraffic.usedTrafficBytes
                    const percent = getUsagePercentUtil(used, user.trafficLimitBytes)

                    return (
                        <Stack gap={6}>
                            <Group justify="space-between" wrap="nowrap">
                                <Group gap="xs" miw={0} wrap="nowrap">
                                    <Text fw={600} size="sm" truncate="end">
                                        {user.username}
                                    </Text>
                                    {user.status !== 'ACTIVE' && (
                                        <UserStatusBadge size="xs" status={user.status} />
                                    )}
                                </Group>
                                <Text c="dimmed" ff="monospace" size="xs" style={{ flexShrink: 0 }}>
                                    {prettifyBytesUtil(used, true)} /{' '}
                                    {prettifyBytesUtil(user.trafficLimitBytes, true)}
                                </Text>
                            </Group>
                            <Progress
                                color={getUsageColorUtil(percent)}
                                radius="xl"
                                size="xs"
                                value={percent}
                            />
                        </Stack>
                    )
                }}
                subtitle={t('brokers.panel.top-usage-description')}
                title={t('brokers.panel.top-usage')}
                users={heavyUsers}
            />
        </SimpleGrid>
    )
}

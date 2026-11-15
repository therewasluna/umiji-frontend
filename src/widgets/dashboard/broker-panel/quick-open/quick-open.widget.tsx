import {
    ActionIcon,
    Button,
    Card,
    Group,
    Loader,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    UnstyledButton
} from '@mantine/core'
import { useDebouncedValue, useLocalStorage } from '@mantine/hooks'
import { GetUsersCommand } from '@umiji/backend-contract'
import { UserStatusBadge } from '@widgets/dashboard/users/user-status-badge'
import { ComponentType, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiArrowsInCardinalFill, PiUsers } from 'react-icons/pi'
import {
    TbArrowRight,
    TbCirclesRelation,
    TbClockHour4,
    TbGauge,
    TbHash,
    TbSearch,
    TbUserPlus,
    TbWebhook
} from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { useGetUsers } from '@shared/api/hooks'
import { OPEN_ENTITY, ROUTES } from '@shared/constants'
import { logoutEvents } from '@shared/emitters'
import { CopyEntityLinkButton } from '@shared/ui'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'
import { getUsageColorUtil, getUsagePercentUtil } from '@shared/utils/brokers'
import { formatRelativeDateUtil } from '@shared/utils/time-utils'

import classes from './quick-open.module.css'

type TUser = GetUsersCommand.Response['response']['users'][number]
type TRecentUser = { id: number; username: string }

const RESULTS = 8
const RECENT = 8
const RECENT_KEY = 'umiji-broker-recent-users'

// Another broker may sign in to this browser next.
logoutEvents.subscribe(() => localStorage.removeItem(RECENT_KEY))

/** One search field: each runs as its own scoped list query, since list filters are AND-ed. */
const useUserSearch = (field: string, value: string, enabled: boolean) =>
    useGetUsers({
        query: { start: 0, size: RESULTS, filters: [{ id: field, value }] },
        rQueryParams: { enabled: enabled && value.length > 0, refetchInterval: false }
    })

const UserRow = ({ onOpen, user }: { onOpen: (user: TUser) => void; user: TUser }) => {
    const { t, i18n } = useTranslation()

    const used = user.userTraffic.usedTrafficBytes
    const percent = getUsagePercentUtil(used, user.trafficLimitBytes)

    return (
        <UnstyledButton
            aria-label={user.username}
            className={classes.row}
            onClick={() => onOpen(user)}
        >
            <Group gap="md" justify="space-between" wrap="nowrap">
                <Stack gap={2} miw={0}>
                    <Group gap="xs" miw={0} wrap="nowrap">
                        <Text fw={600} size="sm" truncate="end">
                            {user.username}
                        </Text>
                        <Text c="dimmed" ff="monospace" size="xs" style={{ flexShrink: 0 }}>
                            #{user.id}
                        </Text>
                    </Group>
                    <Text c="dimmed" size="xs" truncate="end">
                        {user.shortUuid} · {formatRelativeDateUtil(user.expireAt, t, i18n.language)}
                    </Text>
                </Stack>

                <Group gap="md" style={{ flexShrink: 0 }} wrap="nowrap">
                    {user.trafficLimitBytes > 0 && (
                        <Progress
                            color={getUsageColorUtil(percent)}
                            radius="xl"
                            size="sm"
                            value={percent}
                            visibleFrom="sm"
                            w={90}
                        />
                    )}
                    <UserStatusBadge size="sm" status={user.status} />
                </Group>
            </Group>
        </UnstyledButton>
    )
}

const Shortcut = (props: {
    description: string
    Icon: ComponentType<{ size: number }>
    onClick: () => void
    title: string
}) => (
    <UnstyledButton className={classes.tile} onClick={props.onClick}>
        <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="gray" radius="md" size="lg" variant="soft">
                <props.Icon size={20} />
            </ThemeIcon>
            <Stack gap={0} miw={0}>
                <Text fw={600} size="sm" truncate="end">
                    {props.title}
                </Text>
                <Text c="dimmed" size="xs" truncate="end">
                    {props.description}
                </Text>
            </Stack>
        </Group>
    </UnstyledButton>
)

const Section = ({
    children,
    ...header
}: {
    children: ReactNode
    Icon: typeof TbSearch
    subtitle: string
    title: string
}) => (
    <SectionCard.Root gap="sm" h="100%" p="lg">
        <SectionCard.Section>
            <BaseOverlayHeader IconComponent={header.Icon} title={header.title} titleOrder={5} />
            {/* Under the row, not beside the icon: the icon centres on the title alone. */}
            <Text c="dimmed" mt="xs" size="xs">
                {header.subtitle}
            </Text>
        </SectionCard.Section>
        <SectionCard.Section>{children}</SectionCard.Section>
    </SectionCard.Root>
)

/** Quick open for brokers: search their users, reopen recent ones, open by ID, jump to their pages. */
export function BrokerQuickOpenWidget() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [query, setQuery] = useState('')
    const [search] = useDebouncedValue(query.trim(), 250)
    const isNumeric = /^\d+$/.test(search)

    const searches = [
        useUserSearch('id', search, isNumeric),
        useUserSearch('username', search, true),
        useUserSearch('shortUuid', search, search.length >= 3),
        useUserSearch('email', search, search.includes('@')),
        useUserSearch('telegramId', search, isNumeric)
    ]
    // A disabled query still holds the previous search's data, and a running one shows it as
    // placeholder, so only count finished results for this search (Enter opens the first).
    const active = searches.filter(
        (result) => result.isEnabled && search.length > 0 && !result.isPlaceholderData
    )
    const isSearching = searches.some(
        (result) => result.isEnabled && search.length > 0 && result.isFetching
    )
    const results = Array.from(
        new Map(
            active
                .flatMap((result) => result.data?.users ?? [])
                .map((user) => [user.id, user] as const)
        ).values()
    ).slice(0, RESULTS)

    const [recent, setRecent] = useLocalStorage<TRecentUser[]>({
        key: RECENT_KEY,
        defaultValue: []
    })

    const openUser = (user: TRecentUser) => {
        setRecent((current) =>
            [
                { id: user.id, username: user.username },
                ...current.filter(({ id }) => id !== user.id)
            ].slice(0, RECENT)
        )
        showModal('users_viewUserModal', { userId: user.id })
    }

    const [userId, setUserId] = useState('')
    const isValidId = /^\d+$/.test(userId)

    const shortcuts = [
        {
            description: t('brokers.panel.quick.create-user-description'),
            Icon: TbUserPlus,
            onClick: () => showModal('users_createUserModal'),
            title: t('brokers.panel.create-user')
        },
        {
            description: t('brokers.panel.quick.status-description'),
            Icon: TbGauge,
            onClick: () => navigate(ROUTES.DASHBOARD.BROKER.OVERVIEW),
            title: t('brokers.panel.status')
        },
        {
            description: t('brokers.panel.quick.users-description'),
            Icon: PiUsers,
            onClick: () => navigate(ROUTES.DASHBOARD.MANAGEMENT.USERS),
            title: t('constants.users')
        },
        {
            description: t('brokers.panel.quick.squads-description'),
            Icon: TbCirclesRelation,
            onClick: () => navigate(ROUTES.DASHBOARD.BROKER.INTERNAL_SQUADS),
            title: t('constants.internal-squads')
        },
        {
            description: t('brokers.panel.quick.subpage-description'),
            Icon: PiArrowsInCardinalFill,
            onClick: () => navigate(ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_PAGE),
            title: t('constants.subscription-page')
        },
        {
            description: t('brokers.panel.quick.settings-description'),
            Icon: TbWebhook,
            onClick: () => navigate(ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_SETTINGS),
            title: t('brokers.panel.subscription-settings')
        }
    ]

    return (
        <Stack gap="md">
            <Section
                Icon={TbSearch}
                subtitle={t('brokers.panel.quick.search-description')}
                title={t('brokers.panel.quick.search')}
            >
                <Stack gap="sm">
                    <TextInput
                        aria-label={t('brokers.panel.quick.search')}
                        autoFocus
                        leftSection={<TbSearch size={18} />}
                        onChange={(event) => setQuery(event.currentTarget.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && results[0]) openUser(results[0])
                        }}
                        placeholder={t('brokers.panel.quick.search-placeholder')}
                        rightSection={isSearching ? <Loader size="xs" /> : null}
                        size="md"
                        value={query}
                    />

                    {search.length > 0 && !isSearching && results.length === 0 && (
                        <Text c="dimmed" py="sm" size="sm" ta="center">
                            {t('brokers.panel.quick.no-results')}
                        </Text>
                    )}

                    {results.length > 0 && (
                        <Stack gap={2}>
                            {results.map((user) => (
                                <UserRow key={user.id} onOpen={openUser} user={user} />
                            ))}
                        </Stack>
                    )}

                    {search.length === 0 && (
                        <Text c="dimmed" size="xs">
                            {t('brokers.panel.quick.search-hint')}
                        </Text>
                    )}
                </Stack>
            </Section>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                <Section
                    Icon={TbClockHour4}
                    subtitle={t('brokers.panel.quick.recent-description')}
                    title={t('brokers.panel.quick.recent')}
                >
                    {recent.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('brokers.panel.quick.no-recent')}
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            <Group gap="xs">
                                {recent.map((user) => (
                                    <Button
                                        color="gray"
                                        key={user.id}
                                        onClick={() => openUser(user)}
                                        rightSection={
                                            <Text c="dimmed" ff="monospace" size="xs">
                                                #{user.id}
                                            </Text>
                                        }
                                        size="xs"
                                        variant="light"
                                    >
                                        {user.username}
                                    </Button>
                                ))}
                            </Group>
                            <Button
                                color="gray"
                                onClick={() => setRecent([])}
                                size="compact-xs"
                                variant="subtle"
                                w="fit-content"
                            >
                                {t('brokers.panel.quick.clear-recent')}
                            </Button>
                        </Stack>
                    )}
                </Section>

                <Section
                    Icon={TbHash}
                    subtitle={t('brokers.panel.quick.open-by-id-description')}
                    title={t('brokers.panel.quick.open-by-id')}
                >
                    <Group gap="xs" wrap="nowrap">
                        <TextInput
                            aria-label={t('brokers.panel.quick.open-by-id')}
                            error={Boolean(userId) && !isValidId}
                            onChange={(event) => setUserId(event.currentTarget.value.trim())}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && isValidId) {
                                    showModal('users_viewUserModal', { userId: Number(userId) })
                                }
                            }}
                            placeholder="77"
                            style={{ flex: 1 }}
                            value={userId}
                        />
                        <CopyEntityLinkButton
                            disabled={!isValidId}
                            entity={OPEN_ENTITY.USER}
                            iconSize={18}
                            id={userId}
                            size="input-sm"
                            variant="default"
                        />
                        <ActionIcon
                            aria-label={t('brokers.panel.quick.open-by-id')}
                            color="teal"
                            disabled={!isValidId}
                            onClick={() =>
                                showModal('users_viewUserModal', { userId: Number(userId) })
                            }
                            size="input-sm"
                            variant="soft"
                        >
                            <TbArrowRight size={18} />
                        </ActionIcon>
                    </Group>
                </Section>
            </SimpleGrid>

            <Card className={classes.shortcuts} p="lg" radius="md">
                <Text c="dimmed" fw={700} mb="sm" size="xs">
                    {t('brokers.panel.quick.shortcuts')}
                </Text>
                <SimpleGrid cols={{ base: 1, xs: 2, md: 3, '2xl': 6 }} spacing="xs">
                    {shortcuts.map((shortcut) => (
                        <Shortcut key={shortcut.title} {...shortcut} />
                    ))}
                </SimpleGrid>
            </Card>
        </Stack>
    )
}

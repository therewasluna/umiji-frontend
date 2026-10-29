import { Badge, Group, SimpleGrid, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core'
import { GetBrokerMeCommand } from '@umiji/backend-contract'
import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PiUsers } from 'react-icons/pi'
import { TbCirclesRelation, TbList, TbPlugConnected, TbServer, TbWorld } from 'react-icons/tb'

import { useGetBrokerMe } from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { CountryFlag } from '@shared/ui/get-country-flag'
import { SectionCard } from '@shared/ui/section-card'

type TSquad = GetBrokerMeCommand.Response['response']['internalSquads'][number]

const HOSTS_PREVIEW = 6

const PROTOCOL_COLOR: Record<string, string> = {
    vless: 'teal',
    vmess: 'blue',
    trojan: 'violet',
    shadowsocks: 'orange',
    hysteria: 'pink'
}

const SectionTitle = ({ children, Icon }: { children: ReactNode; Icon: typeof TbWorld }) => (
    <Group gap={6} mb="xs">
        <Icon size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Text c="dimmed" fw={700} size="xs" tt="uppercase">
            {children}
        </Text>
    </Group>
)

const Empty = ({ children }: { children: ReactNode }) => (
    <Text c="dimmed" size="sm">
        {children}
    </Text>
)

const SquadCard = ({ squad, totalUsers }: { squad: TSquad; totalUsers: number }) => {
    const { t, i18n } = useTranslation()

    const regionNames = new Intl.DisplayNames([i18n.language, 'en'], { type: 'region' })
    const countryName = (code: string) => {
        try {
            return regionNames.of(code) ?? code
        } catch {
            return code
        }
    }

    const isActive = squad.membersCount > 0
    const share = totalUsers > 0 ? Math.round((squad.membersCount * 100) / totalUsers) : 0
    const hiddenHosts = squad.hosts.length - HOSTS_PREVIEW

    return (
        <SectionCard.Root gap="md" h="100%">
            <SectionCard.Section>
                <Group gap="sm" justify="space-between" wrap="nowrap">
                    <Group gap="sm" miw={0} wrap="nowrap">
                        <ThemeIcon
                            color={isActive ? 'teal' : 'gray'}
                            radius="md"
                            size="lg"
                            variant="soft"
                        >
                            <TbCirclesRelation size={20} />
                        </ThemeIcon>
                        <Stack gap={0} miw={0}>
                            <Text ff="monospace" fw={700} size="lg" truncate="end">
                                {squad.name}
                            </Text>
                            <Text c="dimmed" size="xs" truncate="end">
                                {t('brokers.panel.squad-share', {
                                    count: squad.membersCount,
                                    share
                                })}
                            </Text>
                        </Stack>
                    </Group>

                    <Tooltip label={t('brokers.panel.your-users')}>
                        <Badge
                            color={isActive ? 'teal' : 'gray'}
                            leftSection={<PiUsers size={12} />}
                            size="lg"
                            style={{ flexShrink: 0 }}
                            variant="soft"
                        >
                            {squad.membersCount}
                        </Badge>
                    </Tooltip>
                </Group>
            </SectionCard.Section>

            <SectionCard.Section>
                <SectionTitle Icon={TbWorld}>{t('brokers.panel.locations')}</SectionTitle>
                {squad.locations.length === 0 && <Empty>{t('brokers.panel.no-locations')}</Empty>}
                <Stack gap={6}>
                    {squad.locations.map((location) => {
                        const color =
                            location.onlineCount === location.nodesCount
                                ? 'teal'
                                : location.onlineCount > 0
                                  ? 'yellow'
                                  : 'red'

                        return (
                            <Group
                                gap="sm"
                                justify="space-between"
                                key={location.countryCode}
                                wrap="nowrap"
                            >
                                <Group gap="xs" miw={0} wrap="nowrap">
                                    <CountryFlag countryCode={location.countryCode} />
                                    <Text fw={500} size="sm" truncate="end">
                                        {countryName(location.countryCode)}
                                    </Text>
                                </Group>
                                <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
                                    <Tooltip label={t('brokers.panel.servers')}>
                                        <Badge
                                            color="gray"
                                            leftSection={<TbServer size={12} />}
                                            variant="light"
                                        >
                                            {location.nodesCount}
                                        </Badge>
                                    </Tooltip>
                                    <Badge color={color} variant="light">
                                        {t('brokers.panel.online-of', {
                                            online: location.onlineCount,
                                            total: location.nodesCount
                                        })}
                                    </Badge>
                                </Group>
                            </Group>
                        )
                    })}
                </Stack>
            </SectionCard.Section>

            <SectionCard.Section>
                <SectionTitle Icon={TbPlugConnected}>{t('brokers.panel.protocols')}</SectionTitle>
                {squad.inbounds.length === 0 && <Empty>{t('brokers.panel.no-protocols')}</Empty>}
                <Stack gap={6}>
                    {squad.inbounds.map((inbound) => (
                        <Group gap="sm" justify="space-between" key={inbound.uuid} wrap="nowrap">
                            <Group gap="xs" miw={0} wrap="nowrap">
                                <Badge
                                    color={PROTOCOL_COLOR[inbound.type] ?? 'gray'}
                                    miw={92}
                                    style={{ flexShrink: 0 }}
                                    variant="light"
                                >
                                    {inbound.type}
                                </Badge>
                                <Text c="dimmed" size="sm" truncate="end">
                                    {[inbound.network, inbound.security]
                                        .filter(Boolean)
                                        .join(' · ') || '—'}
                                </Text>
                            </Group>
                            {inbound.port !== null && (
                                <Text c="dimmed" ff="monospace" size="sm" style={{ flexShrink: 0 }}>
                                    :{inbound.port}
                                </Text>
                            )}
                        </Group>
                    ))}
                </Stack>
            </SectionCard.Section>

            <SectionCard.Section>
                <SectionTitle Icon={TbList}>{t('brokers.panel.users-see')}</SectionTitle>
                {squad.hosts.length === 0 && <Empty>{t('brokers.panel.no-hosts')}</Empty>}
                <Stack gap={4}>
                    {squad.hosts.slice(0, HOSTS_PREVIEW).map((host, index) => (
                        <Text key={`${host.remark}-${index}`} size="sm" truncate="end">
                            {host.remark}
                        </Text>
                    ))}
                    {hiddenHosts > 0 && (
                        <Text c="dimmed" size="xs">
                            {t('brokers.panel.more', { count: hiddenHosts })}
                        </Text>
                    )}
                </Stack>
            </SectionCard.Section>
        </SectionCard.Root>
    )
}

/** The internal squads the owner lets this broker use, and what each one gives its users. */
export function BrokerInternalSquadsPage() {
    const { t } = useTranslation()

    const { data: broker, isLoading } = useGetBrokerMe()

    if (isLoading || !broker) return <LoadingScreen />

    return (
        <Page title={t('constants.internal-squads')}>
            <PageHeaderShared
                description={t('brokers.panel.internal-squads-description')}
                icon={<TbCirclesRelation size={24} />}
                title={t('constants.internal-squads')}
            />

            {broker.internalSquads.length === 0 && (
                <Text c="dimmed" py="xl" ta="center">
                    {t('brokers.panel.no-internal-squads')}
                </Text>
            )}

            <SimpleGrid cols={{ base: 1, lg: 2, '2xl': 3 }} spacing="md">
                {broker.internalSquads.map((squad, index) => (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 8 }}
                        key={squad.uuid}
                        style={{ height: '100%' }}
                        transition={{ duration: 0.25, delay: index * 0.06, ease: 'easeOut' }}
                    >
                        <SquadCard squad={squad} totalUsers={broker.usersCount} />
                    </motion.div>
                ))}
            </SimpleGrid>
        </Page>
    )
}

import { SimpleGrid } from '@mantine/core'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbClockHour2, TbFileReport, TbServer, TbUsers } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetTorrentBlockerStats } from '@shared/api/hooks'
import { CountryFlag } from '@shared/ui/get-country-flag'
import { TopLeaderboardCardShared } from '@shared/ui/leaderboard-item-card'
import { IMetricCardProps, MetricCardShared } from '@shared/ui/metrics/metric-card'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { DataTableShared } from '@shared/ui/table'
import { formatInt } from '@shared/utils/misc'

export function TorrentBlockerStatsWidget() {
    const { t } = useTranslation()

    const { data: stats, isLoading: isStatsLoading } = useGetTorrentBlockerStats()

    const cards: IMetricCardProps[] = [
        {
            IconComponent: TbFileReport,
            title: t('torrent-blocker-stats.widget.total-reports'),
            value: stats?.stats.totalReports ?? 0,
            iconVariant: 'soft',
            iconColor: 'cyan'
        },
        {
            IconComponent: TbClockHour2,
            title: t('torrent-blocker-stats.widget.last-24-hours'),
            value: stats?.stats.reportsLast24Hours ?? 0,
            iconVariant: 'soft',
            iconColor: 'cyan'
        },
        {
            IconComponent: TbServer,
            title: t('torrent-blocker-stats.widget.distinct-nodes'),
            value: stats?.stats.distinctNodes ?? 0,
            iconVariant: 'soft',
            iconColor: 'teal'
        },
        {
            IconComponent: TbUsers,
            title: t('torrent-blocker-stats.widget.distinct-users'),
            value: stats?.stats.distinctUsers ?? 0,
            iconVariant: 'soft',
            iconColor: 'red'
        }
    ]
    return (
        <>
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, xl: 4 }} spacing="xs">
                {cards.map((card, index) => (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 0 }}
                        key={card.title}
                        transition={{
                            duration: 0.15,
                            delay: index * 0.03,
                            ease: 'easeIn'
                        }}
                    >
                        <MetricCardShared
                            iconColor={card.iconColor}
                            IconComponent={card.IconComponent}
                            iconVariant={card.iconVariant}
                            isLoading={isStatsLoading}
                            subtitle={card.subtitle}
                            title={card.title}
                            value={card.value}
                        />
                    </motion.div>
                ))}
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TopLeaderboardCardShared
                    emptyText={t('common.message.no-data-available')}
                    formatValue={(value) => formatInt(value)}
                    isLoading={isStatsLoading}
                    items={stats?.topUsers?.map((user) => ({
                        color: 'var(--mantine-color-rose-6)',
                        name: user.username,
                        total: user.total,
                        userId: user.userId
                    }))}
                    maxHeight={230}
                    onItemClick={(user) => {
                        showModal('users_viewUserModal', { userId: user.userId })
                    }}
                    wrapper={(children) => (
                        <DataTableShared.Container>
                            <DataTableShared.Title
                                description={t('torrent-blocker-stats.widget.by-report-count')}
                                title={t('torrent-blocker-stats.widget.top-users')}
                            />
                            <SettingsCardShared.Container h="100%">
                                {children}
                            </SettingsCardShared.Container>
                        </DataTableShared.Container>
                    )}
                />

                <TopLeaderboardCardShared
                    emptyText={t('common.message.no-data-available')}
                    formatValue={(value) => formatInt(value)}
                    isLoading={isStatsLoading}
                    items={stats?.topNodes?.map((node) => ({
                        color: 'var(--mantine-color-rose-6)',
                        countryCode: node.countryCode,
                        name: node.name,
                        total: node.total
                    }))}
                    maxHeight={230}
                    renderCountryFlag={(item) => <CountryFlag countryCode={item.countryCode} />}
                    wrapper={(children) => (
                        <DataTableShared.Container>
                            <DataTableShared.Title
                                description={t('torrent-blocker-stats.widget.by-report-count')}
                                title={t('statistic-nodes.component.top-nodes')}
                            />
                            <SettingsCardShared.Container h="100%">
                                {children}
                            </SettingsCardShared.Container>
                        </DataTableShared.Container>
                    )}
                />
            </SimpleGrid>
        </>
    )
}

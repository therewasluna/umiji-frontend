import { Center, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import {
    PiCalculatorDuotone,
    PiChartPieDuotone,
    PiDeviceMobileDuotone,
    PiDevicesDuotone
} from 'react-icons/pi'

import { useGetHwidDevicesStats } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { IMetricCardProps, MetricCardShared } from '@shared/ui/metrics/metric-card'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { DataTableShared } from '@shared/ui/table'

import { buildPlatformData } from './hwid-inspector-metrics.utils'
import { PlatformRow } from './platform-row'

export function HwidInspectorMetrics() {
    const { t } = useTranslation()

    const { data: stats, isLoading } = useGetHwidDevicesStats()
    const isMobile = useIsMobile()

    const platformData = stats?.byPlatform ? buildPlatformData(stats.byPlatform, t) : []
    const total = platformData.reduce((sum, item) => sum + item.value, 0)

    const metricCards: IMetricCardProps[] = [
        {
            IconComponent: PiDevicesDuotone,
            title: t('hwid-inspector-metrics.widget.total-unique-devices'),
            value: stats?.stats.totalUniqueDevices ?? 0,
            iconVariant: 'soft',
            iconColor: 'gray'
        },
        {
            IconComponent: PiDeviceMobileDuotone,
            title: t('hwid-inspector-metrics.widget.total-hwid-devices'),
            value: stats?.stats.totalHwidDevices ?? 0,
            iconVariant: 'soft',
            iconColor: 'gray'
        },
        {
            IconComponent: PiCalculatorDuotone,
            title: t('hwid-inspector-metrics.widget.avg-devices-per-user'),
            value: stats?.stats.averageHwidDevicesPerUser ?? 0,
            iconVariant: 'soft',
            iconColor: 'gray'
        }
    ]

    return (
        <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }}>
                {metricCards.map((card) => (
                    <MetricCardShared key={card.title} {...card} />
                ))}
            </SimpleGrid>

            <DataTableShared.Container>
                <DataTableShared.Title
                    description={t(
                        'hwid-inspector-metrics.widget.platform-distribution-description'
                    )}
                    title={t('hwid-inspector-metrics.widget.platform-distribution')}
                />

                <SettingsCardShared.Container>
                    {isLoading ? (
                        <Center mih={280}>
                            <Loader size="lg" />
                        </Center>
                    ) : platformData.length === 0 ? (
                        <Center mih={280}>
                            <Stack align="center" gap="sm">
                                <PiChartPieDuotone
                                    color="var(--mantine-color-gray-6)"
                                    size="48px"
                                />
                                <Text c="dimmed" size="sm">
                                    {t('hwid-inspector-metrics.widget.no-platform-data')}
                                </Text>
                            </Stack>
                        </Center>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="sm">
                            {platformData.map((platform) => (
                                <PlatformRow
                                    key={platform.name}
                                    platform={platform}
                                    total={total}
                                    isMobile={isMobile}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </SettingsCardShared.Container>
            </DataTableShared.Container>
        </Stack>
    )
}

import { Chart } from '@highcharts/react'
import { Box, Center, Loader, SimpleGrid, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PiChartBar } from 'react-icons/pi'

import { useGetSubscriptionRequestHistoryStats } from '@shared/api/hooks'
import { TopLeaderboardCardShared } from '@shared/ui/leaderboard-item-card'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { DataTableShared } from '@shared/ui/table'
import { formatInt } from '@shared/utils/misc'

export function SrhInspectorMetrics() {
    const { t } = useTranslation()

    const { data: stats, isLoading } = useGetSubscriptionRequestHistoryStats()

    const getBarChartConfig = () => {
        return {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 300,
                style: {
                    fontFamily: 'inherit'
                }
            },
            time: {
                useUTC: false
            },
            accessibility: {
                enabled: false
            },
            title: {
                text: undefined
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:00'
                },

                units: [['hour', [1, 2, 3, 4, 6, 8, 12]]],
                labels: {
                    style: {
                        color: 'var(--mantine-color-text)'
                    }
                },
                gridLineColor: 'var(--mantine-color-gray-6)',
                lineColor: 'var(--mantine-color-gray-6)'
            },
            yAxis: {
                title: {
                    text: t('srh-inspector-metrics.widget.requests'),
                    style: {
                        color: 'var(--mantine-color-text)'
                    }
                },
                labels: {
                    style: {
                        color: 'var(--mantine-color-text)'
                    }
                },
                gridLineColor: 'var(--mantine-color-gray-6)',
                lineColor: 'var(--mantine-color-gray-6)'
            },

            tooltip: {
                shared: true,
                backgroundColor: 'var(--mantine-color-body)',
                borderColor: 'var(--mantine-color-gray-4)',
                headerFormat: '',
                style: {
                    color: 'var(--mantine-color-text)'
                },
                pointFormatter(this: { x: number; y: number }): string {
                    return `<b>${dayjs(this.x).format('DD.MM.YYYY, HH:mm')}</b> </br> Requests: <b>${this.y}<b>`
                }
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    borderRadius: 4,
                    pointPadding: 0.1,
                    groupPadding: 0.1,
                    color: 'var(--mantine-color-rose-6)',
                    states: {
                        hover: {
                            color: 'var(--mantine-color-rose-4)'
                        }
                    },
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            }
        }
    }

    const hourlyChartOptions = useMemo(() => {
        if (!stats?.hourlyRequestStats || stats.hourlyRequestStats.length === 0) return {}

        const data = stats.hourlyRequestStats.map((item) => {
            const utcDate = new Date(item.dateTime)
            return [utcDate.getTime(), item.requestCount]
        })

        return {
            ...getBarChartConfig(),
            series: [
                {
                    type: 'column',
                    name: t('srh-inspector-metrics.widget.requests'),
                    data
                }
            ]
        }
    }, [stats?.hourlyRequestStats, t])

    const loaderCard = (
        <Center h={300}>
            <Loader size="lg" />
        </Center>
    )

    return (
        <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                <DataTableShared.Container>
                    <DataTableShared.Title
                        description={t('srh-inspector-metrics.widget.app-distribution-description')}
                        title={t('hwid-inspector-metrics.widget.app-distribution')}
                    />
                    <SettingsCardShared.Container h="100%">
                        <TopLeaderboardCardShared
                            emptyText={t('hwid-inspector-metrics.widget.no-app-data')}
                            formatValue={(value) => formatInt(value, { thousandSeparator: ' ' })}
                            isLoading={isLoading}
                            items={stats?.byParsedApp?.map((item) => ({
                                color: 'var(--mantine-color-rose-6)',
                                name: item.app || t('srh-inspector-metrics.unknown'),
                                total: item.count
                            }))}
                            maxHeight={300}
                            wrapper={(children) => children}
                        />
                    </SettingsCardShared.Container>
                </DataTableShared.Container>

                <DataTableShared.Container>
                    <DataTableShared.Title
                        description={t('srh-inspector-metrics.widget.hourly-description')}
                        title={t('srh-inspector-metrics.widget.hourly-request-statistics')}
                    />
                    <SettingsCardShared.Container h="100%">
                        {isLoading ? (
                            loaderCard
                        ) : stats?.hourlyRequestStats && stats.hourlyRequestStats.length > 0 ? (
                            <Box h={300}>
                                <Chart options={hourlyChartOptions} />
                            </Box>
                        ) : (
                            <Center h={300}>
                                <Stack align="center" gap="sm">
                                    <PiChartBar color="var(--mantine-color-gray-4)" size="48px" />
                                    <Text c="dimmed" size="sm">
                                        {t('srh-inspector-metrics.widget.no-hourly-data-available')}
                                    </Text>
                                </Stack>
                            </Center>
                        )}
                    </SettingsCardShared.Container>
                </DataTableShared.Container>
            </SimpleGrid>
        </Stack>
    )
}

import { BarChart } from '@mantine/charts'
import { Box, Card, Group, Skeleton, Stack, Text, useDirection } from '@mantine/core'
import { GetBandwidthStatsCommand } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useGetStatsNodesUsage } from '@shared/api/hooks'
import { prettifyBytesUtil } from '@shared/utils/bytes'

import classes from '../home.module.css'

interface IProps {
    bandwidthStats: GetBandwidthStatsCommand.Response['response']
}

const Trend = ({ difference }: { difference: string }) => {
    const isDown = difference.startsWith('-')
    return (
        <Text c={isDown ? 'red.5' : 'teal.5'} component="bdi" dir="ltr" fw={600} size="sm">
            {isDown ? difference : `+${difference}`}
        </Text>
    )
}

export const TrafficPanel = ({ bandwidthStats }: IProps) => {
    const { t, i18n } = useTranslation()
    const { dir } = useDirection()

    const { data, isLoading } = useGetStatsNodesUsage({
        query: {
            start: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
            end: dayjs().format('YYYY-MM-DD'),
            topNodesLimit: 1
        }
    })

    // Today gets its own series so its bar can be lighter; null keeps the other series out of the tooltip.
    const lastIndex = (data?.categories.length ?? 0) - 1
    const days =
        data?.categories.map((date, index) => ({
            date,
            past: index === lastIndex ? null : (data.sparklineData[index] ?? 0),
            today: index === lastIndex ? (data.sparklineData[index] ?? 0) : null
        })) ?? []
    const dayLabel = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })

    const periods = [
        { title: t('bandwidth-metrics.last-7-days'), stat: bandwidthStats.bandwidthLastSevenDays },
        { title: t('bandwidth-metrics.last-30-days'), stat: bandwidthStats.bandwidthLast30Days },
        {
            title: t('bandwidth-metrics.calendar-month'),
            stat: bandwidthStats.bandwidthCalendarMonth
        },
        { title: t('bandwidth-metrics.current-year'), stat: bandwidthStats.bandwidthCurrentYear }
    ]

    return (
        <Card className={classes.panel} p="xl" radius="lg">
            <div className={classes.traffic}>
                <Stack gap={4}>
                    <Text c="dimmed" size="sm">
                        {t('home.page.bandwidth')}
                    </Text>
                    <Text className={classes.big}>
                        <bdi dir="ltr">{bandwidthStats.bandwidthLastTwoDays.current}</bdi>
                    </Text>
                    <Group gap={6}>
                        <Trend difference={bandwidthStats.bandwidthLastTwoDays.difference} />
                        <Text c="dimmed" size="sm">
                            {t('bandwidth-metrics.from-yesterday')}
                        </Text>
                    </Group>

                    <Stack gap={0} mt="md">
                        {periods.map(({ title, stat }) => (
                            <Group className={classes.row} justify="space-between" key={title}>
                                <Text c="dimmed" size="sm">
                                    {title}
                                </Text>
                                <Group gap="xs">
                                    <Text fw={600} size="sm">
                                        <bdi dir="ltr">{stat.current}</bdi>
                                    </Text>
                                    <Trend difference={stat.difference} />
                                </Group>
                            </Group>
                        ))}
                    </Stack>
                </Stack>

                <Box className={classes.chart}>
                    {isLoading ? (
                        <Skeleton h={220} radius="md" />
                    ) : (
                        <BarChart
                            barProps={{ radius: 4 }}
                            data={days}
                            dataKey="date"
                            gridAxis="none"
                            h={220}
                            series={[
                                {
                                    name: 'past',
                                    color: 'color-mix(in srgb, var(--mantine-color-rose-9) 70%, transparent)',
                                    label: t('home.page.bandwidth')
                                },
                                {
                                    name: 'today',
                                    color: 'rose.4',
                                    label: t('common.field.today')
                                }
                            ]}
                            type="stacked"
                            valueFormatter={(value) => prettifyBytesUtil(value) || '0'}
                            withYAxis={false}
                            xAxisProps={{
                                reversed: dir === 'rtl',
                                minTickGap: 48,
                                tickFormatter: (date: string) =>
                                    dayLabel.format(dayjs(date).toDate())
                            }}
                        />
                    )}
                </Box>
            </div>
        </Card>
    )
}

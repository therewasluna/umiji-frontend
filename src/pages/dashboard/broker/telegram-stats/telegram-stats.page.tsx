import { BarChart } from '@mantine/charts'
import {
    Card,
    Group,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Title,
    useDirection
} from '@mantine/core'
import { GetBrokerBotStatsCommand } from '@umiji/backend-contract'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetBrokerBot, useGetBrokerBotStats } from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { StatStripShared } from '@shared/ui/stat-strip'
import { formatTomanUtil } from '@shared/utils/brokers'
import { formatInt } from '@shared/utils/misc'

type Report = GetBrokerBotStatsCommand.Response['response']
type Day = Report['daily'][number]
type WindowKey = 'month' | 'today' | 'week'

const Section = ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
        <Title c="dimmed" mb="xs" order={4}>
            {title}
        </Title>
        {children}
    </div>
)

/** One series over the last 30 days; today's bar is lighter, as on the home page. */
function DailyChart({
    days,
    format,
    label,
    pick
}: {
    days: Day[]
    format: (n: number) => string
    label: string
    pick: (d: Day) => number
}) {
    const { i18n } = useTranslation()
    const { dir } = useDirection()
    const dayLabel = new Intl.DateTimeFormat(i18n.language, {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC'
    })
    const last = days.length - 1
    // null keeps the other series out of the tooltip.
    const data = days.map((d, i) => ({
        date: d.date,
        past: i === last ? null : pick(d),
        today: i === last ? pick(d) : null
    }))

    return (
        <Card p="lg" radius="md" withBorder>
            <Text c="dimmed" mb="md" size="sm">
                {label}
            </Text>
            <BarChart
                barProps={{ radius: 4 }}
                data={data}
                dataKey="date"
                gridAxis="none"
                h={200}
                series={[
                    {
                        name: 'past',
                        color: 'color-mix(in srgb, var(--mantine-color-rose-9) 70%, transparent)',
                        label
                    },
                    { name: 'today', color: 'rose.4', label }
                ]}
                type="stacked"
                valueFormatter={format}
                withYAxis={false}
                xAxisProps={{
                    reversed: dir === 'rtl',
                    minTickGap: 48,
                    tickFormatter: (date: string) => dayLabel.format(new Date(date))
                }}
            />
        </Card>
    )
}

export function BrokerTelegramStatsPage() {
    const { t } = useTranslation()
    const [windowKey, setWindowKey] = useState<WindowKey>('today')

    const { data: bot } = useGetBrokerBot()
    const { data: report, isLoading } = useGetBrokerBotStats({
        rQueryParams: { enabled: !!bot?.isConnected }
    })

    if (!bot) return <LoadingScreen />

    const toman = (n: number) => formatTomanUtil(n, t)
    const w = report?.[windowKey]
    const totals = report?.totals

    const header = (
        <PageHeaderShared
            actions={
                bot.isConnected && (
                    <SegmentedControl
                        data={[
                            { value: 'today', label: t('common.field.today') },
                            { value: 'week', label: t('bandwidth-metrics.last-7-days') },
                            { value: 'month', label: t('bandwidth-metrics.last-30-days') }
                        ]}
                        onChange={(v) => setWindowKey(v as WindowKey)}
                        value={windowKey}
                    />
                )
            }
            description={t('broker-bot.stats.description')}
            title={t('broker-bot.stats.title')}
        />
    )

    if (!bot.isConnected) {
        return (
            <Page title={t('broker-bot.stats.title')}>
                {header}
                <Card p="lg" radius="md" withBorder>
                    <Text c="dimmed" size="sm" ta="center">
                        {t('broker-bot.connect-first')}
                    </Text>
                </Card>
            </Page>
        )
    }

    return (
        <Page title={t('broker-bot.stats.title')}>
            {header}

            {/* Four-cell strips, so their columns line up down the page. */}
            <Stack gap="lg">
                <Section title={t('broker-bot.stats.customers')}>
                    <StatStripShared
                        cells={[
                            {
                                label: t('broker-bot.stats.new'),
                                value: formatInt(w?.newCustomers ?? 0)
                            },
                            {
                                label: t('broker-bot.stats.active'),
                                value: formatInt(w?.activeCustomers ?? 0)
                            },
                            {
                                label: t('broker-bot.stats.referred'),
                                value: formatInt(w?.referrals ?? 0)
                            },
                            {
                                label: t('broker-bot.stats.trials'),
                                value: formatInt(w?.trials ?? 0)
                            }
                        ]}
                        isLoading={isLoading}
                    />
                </Section>

                <Section title={t('broker-bot.stats.money')}>
                    <StatStripShared
                        cells={[
                            {
                                label: t('broker-bot.stats.sales'),
                                value: toman(w?.salesAmount ?? 0),
                                footer: t('broker-bot.stats.plans-count', { count: w?.sales ?? 0 })
                            },
                            {
                                label: t('broker-bot.stats.topups'),
                                value: toman(w?.topupsAmount ?? 0),
                                footer: t('broker-bot.stats.approved-count', {
                                    count: w?.topups ?? 0
                                })
                            },
                            {
                                label: t('broker-bot.stats.rejected'),
                                value: formatInt(w?.rejectedTopups ?? 0)
                            },
                            { label: t('broker-bot.stats.rewards'), value: toman(w?.rewards ?? 0) }
                        ]}
                        isLoading={isLoading}
                    />
                </Section>

                {report && (
                    <Section title={t('broker-bot.stats.last-30-days')}>
                        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                            <DailyChart
                                days={report.daily}
                                format={toman}
                                label={t('broker-bot.stats.sales-per-day')}
                                pick={(d) => d.salesAmount}
                            />
                            <DailyChart
                                days={report.daily}
                                format={(n) => formatInt(n)}
                                label={t('broker-bot.stats.customers-per-day')}
                                pick={(d) => d.newCustomers}
                            />
                        </SimpleGrid>
                    </Section>
                )}

                <Section title={t('broker-bot.stats.all-time')}>
                    <Stack gap="md">
                        <StatStripShared
                            cells={[
                                {
                                    label: t('broker-bot.stats.customers'),
                                    value: formatInt(totals?.customers ?? 0),
                                    footer: t('broker-bot.stats.buyers-count', {
                                        count: totals?.buyers ?? 0
                                    })
                                },
                                {
                                    label: t('broker-bot.stats.sales'),
                                    value: toman(totals?.salesAmount ?? 0),
                                    footer: t('broker-bot.stats.plans-count', {
                                        count: totals?.sales ?? 0
                                    })
                                },
                                {
                                    label: t('broker-bot.stats.wallet-credit'),
                                    value: toman(totals?.walletTotal ?? 0)
                                },
                                {
                                    label: t('broker-bot.stats.pending'),
                                    value: formatInt(totals?.pendingReceipts ?? 0)
                                }
                            ]}
                            isLoading={isLoading}
                        />
                        <StatStripShared
                            cells={[
                                {
                                    label: t('broker-bot.stats.topups'),
                                    value: toman(totals?.topupsAmount ?? 0),
                                    footer: t('broker-bot.stats.approved-count', {
                                        count: totals?.topups ?? 0
                                    })
                                },
                                {
                                    label: t('broker-bot.stats.trials'),
                                    value: formatInt(totals?.trials ?? 0)
                                },
                                {
                                    label: t('broker-bot.stats.referred'),
                                    value: formatInt(totals?.referrals ?? 0)
                                },
                                {
                                    label: t('broker-bot.stats.rewards'),
                                    value: toman(totals?.rewards ?? 0)
                                }
                            ]}
                            isLoading={isLoading}
                        />
                        <Text c="dimmed" size="xs">
                            {t('broker-bot.stats.reset-note')}
                        </Text>
                    </Stack>
                </Section>

                <Section title={t('broker-bot.stats.top-plans')}>
                    <Card p="lg" radius="md" withBorder>
                        {!report?.topPlans.length ? (
                            <Text c="dimmed" size="sm" ta="center">
                                {t('broker-bot.stats.no-sales')}
                            </Text>
                        ) : (
                            <Stack gap="sm">
                                {report.topPlans.map((p, i) => (
                                    <Group
                                        gap="md"
                                        justify="space-between"
                                        key={p.planId}
                                        wrap="nowrap"
                                    >
                                        <Group gap="sm" miw={0} wrap="nowrap">
                                            <Text c="dimmed" fw={600} size="sm" w={20}>
                                                {i + 1}
                                            </Text>
                                            <Stack gap={0} miw={0}>
                                                <Text fw={600} size="sm" truncate="end">
                                                    {p.title}
                                                </Text>
                                                <Text c="dimmed" size="xs">
                                                    {t('broker-bot.stats.plans-count', {
                                                        count: p.sales
                                                    })}
                                                </Text>
                                            </Stack>
                                        </Group>
                                        <Text fw={600} size="sm" style={{ whiteSpace: 'nowrap' }}>
                                            <bdi>{toman(p.salesAmount)}</bdi>
                                        </Text>
                                    </Group>
                                ))}
                            </Stack>
                        )}
                    </Card>
                </Section>
            </Stack>
        </Page>
    )
}

import { Badge, Card, Grid, Group, Progress, Stack, Text, ThemeIcon } from '@mantine/core'
import { GetUmijiHealthCommand } from '@umiji/backend-contract'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { PiClockDuotone, PiCloudDuotone, PiGearSixDuotone, PiQueueDuotone } from 'react-icons/pi'

import { prettifyBytesUtil } from '@shared/utils/bytes'

import classes from './runtime-detail-card.module.css'

type RuntimeMetric = GetUmijiHealthCommand.Response['response']['runtimeMetrics'][number]

const getProcessConfig = (
    t: TFunction
): Record<
    string,
    {
        accentColor: string
        accentGlow: string
        color: string
        Icon: typeof PiGearSixDuotone
        name: string
    }
> => ({
    api: {
        accentColor: 'var(--mantine-color-blue-6)',
        accentGlow: 'rgba(59, 130, 246, 0.2)',
        color: 'blue',
        Icon: PiCloudDuotone,
        name: 'API'
    },
    scheduler: {
        accentColor: 'var(--mantine-color-violet-6)',
        accentGlow: 'rgba(139, 92, 246, 0.2)',
        color: 'violet',
        Icon: PiClockDuotone,
        name: t('runtime-detail-card.scheduler')
    },
    processor: {
        accentColor: 'var(--mantine-color-teal-6)',
        accentGlow: 'rgba(20, 184, 166, 0.2)',
        color: 'teal',
        Icon: PiQueueDuotone,
        name: t('runtime-detail-card.processor')
    }
})

const getDefaultProcess = (t: TFunction) => ({
    accentColor: 'var(--mantine-color-gray-6)',
    accentGlow: 'rgba(108, 117, 125, 0.2)',
    color: 'gray',
    Icon: PiGearSixDuotone,
    name: t('runtime-detail-card.unknown')
})

interface RuntimeDetailCardProps {
    metric: RuntimeMetric
}

export function RuntimeDetailCard({ metric }: RuntimeDetailCardProps) {
    const { t } = useTranslation()

    const config = getProcessConfig(t)[metric.instanceType] ?? getDefaultProcess(t)
    const heapPercent = metric.heapTotal > 0 ? (metric.heapUsed / metric.heapTotal) * 100 : 0

    return (
        <Card
            className={classes.card}
            padding="md"
            radius="md"
            style={
                {
                    '--accent-color': config.accentColor,
                    '--accent-glow': config.accentGlow
                } as React.CSSProperties
            }
        >
            <div className={classes.topAccent} />

            <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap">
                        <ThemeIcon color={config.color} radius="md" size="lg" variant="soft">
                            <config.Icon size={18} />
                        </ThemeIcon>
                        <Stack gap={2}>
                            <Text c="white" ff="monospace" fw={700} lh={1} size="sm">
                                {config.name}-{metric.instanceId}
                            </Text>
                            <Badge color={config.color} ff="monospace" size="xs" variant="soft">
                                PID: {metric.pid}
                            </Badge>
                        </Stack>
                    </Group>
                </Group>

                <Grid gap="sm">
                    <Grid.Col span={{ base: 12, sm: 7 }}>
                        <div className={classes.memorySection}>
                            <Stack gap={6}>
                                <Text c="dimmed" fw={600} lh={1} lts={1} size="10px" tt="uppercase">
                                    {t('runtime-detail-card.memory')}
                                </Text>

                                <div>
                                    <Group justify="space-between" mb={4}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.heap')}
                                        </Text>
                                        <Text className={classes.heapValues}>
                                            {prettifyBytesUtil(metric.heapUsed, true)} /{' '}
                                            {prettifyBytesUtil(metric.heapTotal, true)}{' '}
                                            <span className={classes.heapPercent}>
                                                ({heapPercent.toFixed(0)}%)
                                            </span>
                                        </Text>
                                    </Group>
                                    <Progress
                                        color={config.color}
                                        radius="xl"
                                        size="sm"
                                        value={heapPercent}
                                    />
                                </div>

                                <Group grow>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>RSS</Text>
                                        <Text className={classes.statValue}>
                                            {prettifyBytesUtil(metric.rss, true)}
                                        </Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.external')}
                                        </Text>
                                        <Text className={classes.statValue}>
                                            {prettifyBytesUtil(metric.external, true)}
                                        </Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.array-buffers')}
                                        </Text>
                                        <Text className={classes.statValue}>
                                            {prettifyBytesUtil(metric.arrayBuffers, true)}
                                        </Text>
                                    </Stack>
                                </Group>
                            </Stack>
                        </div>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 5 }}>
                        <div className={classes.perfSection}>
                            <Stack gap={6}>
                                <Text c="dimmed" fw={600} lh={1} lts={1} size="10px" tt="uppercase">
                                    {t('runtime-detail-card.event-loop')}
                                </Text>

                                <Group grow hiddenFrom="sm">
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.delay')}
                                        </Text>
                                        <Text className={classes.statValue}>
                                            {metric.eventLoopDelayMs.toFixed(2)} ms
                                        </Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>P99</Text>
                                        <Text className={classes.statValue}>
                                            {metric.eventLoopP99Ms.toFixed(2)} ms
                                        </Text>
                                    </Stack>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.handles')}
                                        </Text>
                                        <Text className={classes.statValue}>
                                            {metric.activeHandles}
                                        </Text>
                                    </Stack>
                                </Group>

                                <Stack gap={6} visibleFrom="sm">
                                    <Group grow>
                                        <Stack gap={0}>
                                            <Text className={classes.statLabel}>
                                                {t('runtime-detail-card.delay')}
                                            </Text>
                                            <Text className={classes.statValue}>
                                                {metric.eventLoopDelayMs.toFixed(2)} ms
                                            </Text>
                                        </Stack>
                                        <Stack gap={0}>
                                            <Text className={classes.statLabel}>P99</Text>
                                            <Text className={classes.statValue}>
                                                {metric.eventLoopP99Ms.toFixed(2)} ms
                                            </Text>
                                        </Stack>
                                    </Group>
                                    <Stack gap={0}>
                                        <Text className={classes.statLabel}>
                                            {t('runtime-detail-card.active-handles')}
                                        </Text>
                                        <Text className={classes.statValue}>
                                            {metric.activeHandles}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </div>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Card>
    )
}

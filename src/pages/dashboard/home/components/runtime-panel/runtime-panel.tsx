import { Progress, Table, Text } from '@mantine/core'
import { GetUmijiHealthCommand } from '@umiji/backend-contract'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useIsMobile } from '@shared/hooks'
import { prettifyBytesUtil } from '@shared/utils/bytes'

import classes from './runtime-panel.module.css'

type RuntimeMetric = GetUmijiHealthCommand.Response['response']['runtimeMetrics'][number]

interface IProps {
    metrics: RuntimeMetric[]
}

const bytes = (value: number) => prettifyBytesUtil(value, true)
const ms = (value: number) => `${value.toFixed(2)} ms`

// Summary strip over one row per process (one block per process on a phone).
export const RuntimePanel = forwardRef<HTMLDivElement, IProps>(({ metrics }, ref) => {
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const processName = (metric: RuntimeMetric) => {
        const names: Record<string, string> = {
            api: 'API',
            processor: t('runtime-detail-card.processor'),
            scheduler: t('runtime-detail-card.scheduler')
        }
        return `${names[metric.instanceType] ?? t('runtime-detail-card.unknown')}-${metric.instanceId}`
    }
    const heapPercent = (metric: RuntimeMetric) =>
        metric.heapTotal > 0 ? (metric.heapUsed / metric.heapTotal) * 100 : 0

    const totalRss = metrics.reduce((sum, metric) => sum + Number(metric.rss), 0)
    const totalHeapUsed = metrics.reduce((sum, metric) => sum + Number(metric.heapUsed), 0)
    const avgEventLoopDelay =
        metrics.reduce((sum, metric) => sum + Number(metric.eventLoopDelayMs), 0) / metrics.length

    const summary = [
        { label: t('pm2-metrics.total-processes'), value: metrics.length },
        { label: t('pm2-metrics.total-memory'), value: bytes(totalRss) },
        { label: t('runtime-metrics.heap-used'), value: bytes(totalHeapUsed) },
        { label: t('runtime-metrics.avg-event-loop'), value: ms(avgEventLoopDelay) }
    ]

    const heap = (metric: RuntimeMetric) => (
        <div className={classes.heap}>
            <Progress radius="xl" size={6} value={heapPercent(metric)} />
            <Text className={classes.heapText}>
                <bdi dir="ltr">
                    {bytes(metric.heapUsed)} / {bytes(metric.heapTotal)}
                    <span className={classes.dim}> · {heapPercent(metric).toFixed(0)}%</span>
                </bdi>
            </Text>
        </div>
    )

    return (
        <div className={classes.panel} ref={ref}>
            <div className={classes.strip}>
                {summary.map((cell) => (
                    <div className={classes.cell} key={cell.label}>
                        <span className={classes.label}>{cell.label}</span>
                        <Text className={classes.value}>
                            <bdi dir="ltr">{cell.value}</bdi>
                        </Text>
                    </div>
                ))}
            </div>

            {isMobile ? (
                metrics.map((metric) => (
                    <div className={classes.block} key={metric.pid}>
                        <div className={classes.name}>
                            <b>{processName(metric)}</b>
                            <span className={classes.pid}>PID {metric.pid}</span>
                        </div>
                        <div>
                            <span className={classes.label}>{t('runtime-detail-card.heap')}</span>
                            {heap(metric)}
                        </div>
                        <div className={classes.grid}>
                            {[
                                ['RSS', bytes(metric.rss)],
                                [t('runtime-detail-card.external'), bytes(metric.external)],
                                [
                                    t('runtime-detail-card.array-buffers'),
                                    bytes(metric.arrayBuffers)
                                ],
                                [t('runtime-detail-card.delay'), ms(metric.eventLoopDelayMs)],
                                ['P99', ms(metric.eventLoopP99Ms)],
                                [t('runtime-detail-card.active-handles'), metric.activeHandles]
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <span className={classes.label}>{label}</span>
                                    <b className={classes.num}>
                                        <bdi dir="ltr">{value}</bdi>
                                    </b>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <Table.ScrollContainer minWidth={900}>
                    <Table className={classes.table} verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{t('common.field.name')}</Table.Th>
                                <Table.Th>{t('runtime-detail-card.heap')}</Table.Th>
                                <Table.Th>RSS</Table.Th>
                                <Table.Th>{t('runtime-detail-card.external')}</Table.Th>
                                <Table.Th>{t('runtime-detail-card.array-buffers')}</Table.Th>
                                <Table.Th>{t('runtime-detail-card.delay')}</Table.Th>
                                <Table.Th>P99</Table.Th>
                                <Table.Th>{t('runtime-detail-card.active-handles')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {metrics.map((metric) => (
                                <Table.Tr key={metric.pid}>
                                    <Table.Td>
                                        <div className={classes.name}>
                                            <b>{processName(metric)}</b>
                                            <span className={classes.pid}>PID {metric.pid}</span>
                                        </div>
                                    </Table.Td>
                                    <Table.Td>{heap(metric)}</Table.Td>
                                    <Table.Td className={classes.num}>{bytes(metric.rss)}</Table.Td>
                                    <Table.Td className={classes.num}>
                                        {bytes(metric.external)}
                                    </Table.Td>
                                    <Table.Td className={classes.num}>
                                        {bytes(metric.arrayBuffers)}
                                    </Table.Td>
                                    <Table.Td className={classes.num}>
                                        {ms(metric.eventLoopDelayMs)}
                                    </Table.Td>
                                    <Table.Td className={classes.num}>
                                        {ms(metric.eventLoopP99Ms)}
                                    </Table.Td>
                                    <Table.Td className={classes.num}>
                                        {metric.activeHandles}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )}
        </div>
    )
})

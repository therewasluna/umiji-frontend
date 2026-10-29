import { GetUmijiHealthCommand } from '@umiji/backend-contract'
import { TFunction } from 'i18next'
import {
    PiClockDuotone,
    PiCloudDuotone,
    PiGearSixDuotone,
    PiMemoryDuotone,
    PiQueueDuotone,
    PiTimerDuotone,
    PiTreeStructureDuotone
} from 'react-icons/pi'

import { IMetricCardProps } from '@shared/ui/metrics/metric-card'
import { prettifyBytesUtil } from '@shared/utils/bytes'

const getProcessConfig = (
    t: TFunction
): Record<string, { Icon: typeof PiGearSixDuotone; name: string }> => ({
    api: { Icon: PiCloudDuotone, name: 'API' },
    scheduler: { Icon: PiClockDuotone, name: t('runtime-metrics.scheduler') },
    processor: { Icon: PiQueueDuotone, name: t('runtime-metrics.processor') }
})

const getDefaultProcess = (t: TFunction) => ({
    Icon: PiGearSixDuotone,
    name: t('runtime-metrics.unknown')
})

export const getRuntimeSummaryMetrics = (
    runtimeMetrics: GetUmijiHealthCommand.Response['response']['runtimeMetrics'],
    t: TFunction
): IMetricCardProps[] => {
    if (!runtimeMetrics || runtimeMetrics.length === 0) {
        return []
    }

    const totalRss = runtimeMetrics.reduce((sum, p) => sum + Number(p.rss), 0)
    const totalHeapUsed = runtimeMetrics.reduce((sum, p) => sum + Number(p.heapUsed), 0)
    const avgEventLoopDelay =
        runtimeMetrics.reduce((sum, p) => sum + Number(p.eventLoopDelayMs), 0) /
        runtimeMetrics.length

    return [
        {
            value: runtimeMetrics.length,
            IconComponent: PiGearSixDuotone,
            title: t('pm2-metrics.total-processes'),
            iconVariant: 'soft',
            iconColor: 'blue'
        },
        {
            value: prettifyBytesUtil(totalRss, true),
            IconComponent: PiMemoryDuotone,
            title: t('pm2-metrics.total-memory'),
            iconVariant: 'soft',
            iconColor: 'cyan'
        },
        {
            value: prettifyBytesUtil(totalHeapUsed, true),
            IconComponent: PiTreeStructureDuotone,
            title: t('runtime-metrics.heap-used'),
            iconVariant: 'soft',
            iconColor: 'green'
        },
        {
            value: `${avgEventLoopDelay.toFixed(2)} ms`,
            IconComponent: PiTimerDuotone,
            title: t('runtime-metrics.avg-event-loop'),
            iconVariant: 'soft',
            iconColor: 'orange'
        }
    ]
}

export const getRuntimeProcessMetrics = (
    runtimeMetrics: GetUmijiHealthCommand.Response['response']['runtimeMetrics'],
    t: TFunction
): IMetricCardProps[] => {
    if (!runtimeMetrics || runtimeMetrics.length === 0) {
        return []
    }

    return runtimeMetrics.map((process) => {
        const config = getProcessConfig(t)[process.instanceType] ?? getDefaultProcess(t)
        return {
            value: prettifyBytesUtil(process.rss, true),
            IconComponent: config.Icon,
            title: `${config.name}-${process.instanceId}`,
            iconVariant: 'soft',
            iconColor: 'teal'
        }
    })
}

export const getRuntimeMetrics = getRuntimeSummaryMetrics

import { GetNodesCommand } from '@umiji/backend-contract'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StatStripShared } from '@shared/ui/stat-strip'
import { prettySiRealtimeBytesUtil } from '@shared/utils/bytes'

interface IProps {
    isLoading: boolean
    nodes: GetNodesCommand.Response['response'] | undefined
}

export function NodesRealtimeUsageMetrics(props: IProps) {
    const { nodes, isLoading } = props

    const { t } = useTranslation()

    const aggregated = useMemo(() => {
        if (!nodes?.length) return null

        return nodes.reduce(
            (acc, curr) => ({
                rxSpeed: acc.rxSpeed + (curr.system?.stats.interface?.rxBytesPerSec ?? 0),
                txSpeed: acc.txSpeed + (curr.system?.stats.interface?.txBytesPerSec ?? 0)
            }),
            { rxSpeed: 0, txSpeed: 0 }
        )
    }, [nodes])

    const totalNodes = nodes?.length ?? 0
    const onlineNodes = nodes?.filter((node) => node.isConnected).length ?? 0

    return (
        <StatStripShared
            cells={[
                {
                    label: t('nodes-realtime-metrics.widget.download-speed'),
                    value: prettySiRealtimeBytesUtil(aggregated?.rxSpeed, true, true) || '0 B/s'
                },
                {
                    label: t('nodes-realtime-metrics.widget.upload-speed'),
                    value:
                        prettySiRealtimeBytesUtil(aggregated?.txSpeed ?? 0, true, true) || '0 B/s'
                },
                {
                    label: t('nodes-quick-stats.widget.users-online'),
                    value: nodes?.reduce((acc, curr) => acc + (curr.usersOnline ?? 0), 0) ?? 0
                },
                {
                    // Green while every node is up, red as soon as one is down.
                    color:
                        totalNodes > 0 && onlineNodes < totalNodes
                            ? 'var(--mantine-color-red-5)'
                            : 'var(--mantine-color-teal-5)',
                    label: t('nodes-quick-stats.widget.online-nodes'),
                    value: `${onlineNodes} / ${totalNodes}`
                }
            ]}
            isLoading={isLoading}
        />
    )
}

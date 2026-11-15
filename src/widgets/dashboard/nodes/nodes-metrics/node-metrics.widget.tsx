import {
    Box,
    Card,
    Center,
    Group,
    HoverCard,
    Indicator,
    Loader,
    Paper,
    px,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon
} from '@mantine/core'
import { GetNodesMetricsCommand } from '@umiji/backend-contract'
import { VirtuosoMasonry } from '@virtuoso.dev/masonry'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    PiGlobeSimple,
    PiInfo,
    PiProhibitDuotone,
    PiPulseDuotone,
    PiUsersDuotone
} from 'react-icons/pi'
import { TbServer } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetNodesMetrics } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { MetricCardShared } from '@shared/ui/metrics/metric-card'

import { NodeDetailsCard } from './node-details-card'
import styles from './NodeDetails.module.css'

export const NodeMetricsWidget = () => {
    const { t } = useTranslation()

    const { data: nodeMetrics, isLoading } = useGetNodesMetrics()
    const isMobile = useIsMobile()

    const handleNodeClick = useCallback((nodeUuid: string) => {
        showModal('nodes_editNodeModal', { nodeUuid })
    }, [])

    const overallStats = useMemo(() => {
        if (!nodeMetrics?.nodes) return null

        const totalNodes = nodeMetrics.nodes.length
        const totalUsersOnline = nodeMetrics.nodes.reduce((acc, node) => acc + node.usersOnline, 0)
        const activeNodes = nodeMetrics.nodes.filter((node) => node.usersOnline > 0).length
        const totalInbounds = nodeMetrics.nodes.reduce(
            (acc, node) => acc + node.inboundsStats.length,
            0
        )

        return {
            totalNodes,
            totalUsersOnline,
            activeNodes,
            totalInbounds
        }
    }, [nodeMetrics])

    if (isLoading) {
        return (
            <Center h={200}>
                <Loader size="lg" />
            </Center>
        )
    }

    if (!nodeMetrics?.nodes?.length) {
        return (
            <Card p="xl">
                <Center>
                    <Stack align="center" gap="md">
                        <ThemeIcon color="gray" size="xl" variant="light">
                            <PiProhibitDuotone size="32px" />
                        </ThemeIcon>
                        <Text c="gray.5" size="lg">
                            {t('node-metrics.no-nodes-metrics-available')}
                        </Text>
                    </Stack>
                </Center>
            </Card>
        )
    }

    const Item: React.FC<{
        context: unknown
        data: GetNodesMetricsCommand.Response['response']['nodes'][number]
        index: number
    }> = ({ data }) => {
        return (
            <div
                className={styles.itemFadeIn}
                key={data.nodeUuid}
                style={{
                    padding: 5,
                    margin: '0'
                }}
            >
                <NodeDetailsCard handleNodeClick={handleNodeClick} node={data} />
            </div>
        )
    }

    return (
        <Stack gap="md">
            <SimpleGrid cols={{ sm: 1, md: 2, lg: 4 }} spacing="xs">
                <MetricCardShared
                    iconColor="indigo"
                    IconComponent={TbServer}
                    iconVariant="soft"
                    isLoading={isLoading}
                    title={t('node-metrics.total-nodes')}
                    value={overallStats?.totalNodes || 0}
                />
                <MetricCardShared
                    iconColor="teal"
                    IconComponent={PiPulseDuotone}
                    iconVariant="soft"
                    isLoading={isLoading}
                    title={t('node-metrics.active-nodes')}
                    value={overallStats?.activeNodes || 0}
                />
                <MetricCardShared
                    iconColor="blue"
                    IconComponent={PiUsersDuotone}
                    iconVariant="soft"
                    isLoading={isLoading}
                    title={t('node-metrics.users-online')}
                    value={overallStats?.totalUsersOnline || 0}
                />
                <MetricCardShared
                    iconColor="violet"
                    IconComponent={PiGlobeSimple}
                    iconVariant="soft"
                    isLoading={isLoading}
                    title={t('node-metrics.total-inbounds')}
                    value={overallStats?.totalInbounds || 0}
                />
            </SimpleGrid>

            <Paper
                p="md"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)'
                }}
            >
                <Group align="center" gap="sm" wrap="wrap">
                    <Group align="center" gap="sm">
                        <HoverCard position="bottom" shadow="lg" width={320} withArrow>
                            <HoverCard.Target>
                                <ThemeIcon color="gray" size="md" variant="light">
                                    <PiInfo size={px('1.2rem')} />
                                </ThemeIcon>
                            </HoverCard.Target>
                            <HoverCard.Dropdown>
                                <Stack gap="sm">
                                    <Group gap="xs">
                                        <ThemeIcon color="blue" size="xs" variant="light">
                                            <PiInfo size="0.6rem" />
                                        </ThemeIcon>
                                        <Text fw={600} size="sm">
                                            {t('node-metrics.additional-information')}
                                        </Text>
                                    </Group>
                                    <Stack gap="xs">
                                        <Text c="dimmed" size="xs">
                                            {t(
                                                'node-metrics.updates-every-30-seconds-from-metrics-endpoint'
                                            )}
                                        </Text>
                                        <Text c="dimmed" size="xs">
                                            {t(
                                                'node-metrics.not-all-data-is-visualized-on-this-dashboard'
                                            )}
                                        </Text>
                                        <Text c="dimmed" size="xs">
                                            {t('node-metrics.traffic-description')}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </HoverCard.Dropdown>
                        </HoverCard>

                        <Text c="blue.4" fw={500} size="sm">
                            {t('node-metrics.metrics-from-prometheus')}
                        </Text>
                    </Group>
                    <Group align="center" gap="xs">
                        <Indicator
                            color="teal.5"
                            processing
                            size={8}
                            style={{
                                zIndex: 5
                            }}
                            visibleFrom="xs"
                        />
                        <Text c="gray.4" size="xs">
                            {t('node-metrics.live-updates-from-metrics-endpoint')}
                        </Text>
                    </Group>
                </Group>
            </Paper>

            <Box>
                <VirtuosoMasonry
                    columnCount={isMobile ? 1 : 2}
                    data={nodeMetrics?.nodes}
                    ItemContent={Item}
                    style={{
                        height: '100%'
                    }}
                    useWindowScroll={true}
                />
            </Box>
        </Stack>
    )
}

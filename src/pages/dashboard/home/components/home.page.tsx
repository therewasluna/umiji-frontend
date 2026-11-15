import { ActionIcon, Group, Progress, SimpleGrid, Stack, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCamera, TbInfoCircle } from 'react-icons/tb'

import { useIsMobile } from '@shared/hooks'
import { LoadingScreen, PageHeaderShared } from '@shared/ui'
import { DisclaimerOverlay } from '@shared/ui/disclaimer-overlay'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { Page } from '@shared/ui/page'
import { copyScreenshotToClipboard } from '@shared/utils/copy-screenshot.util'

import classes from './home.module.css'
import { IProps } from './interfaces'
import { getOnlineMetrics, getSimpleMetrics, getUsersMetrics } from './metrics'
import { RuntimeInfoModalContent } from './runtime-info-modal/runtime-info-modal'
import { RuntimePanel } from './runtime-panel/runtime-panel'
import { StatPanel, StatRow } from './stat-panel/stat-panel'
import { TrafficPanel } from './traffic-panel/traffic-panel'

// Same order as getUsersMetrics after the total: active, expired, limited, disabled.
const USER_STATUS_COLORS = [
    'var(--mantine-color-rose-8)',
    'var(--mantine-color-dark-3)',
    'var(--mantine-color-yellow-5)',
    'var(--mantine-color-dark-5)'
]

export const HomePage = (props: IProps) => {
    const { t } = useTranslation()

    const isMobile = useIsMobile()
    const runtimeRef = useRef<HTMLDivElement>(null)
    const [copying, setCopying] = useState(false)

    const { systemInfo, bandwidthStats, umijiHealth } = props

    const copyRuntimeScreenshot = async () => {
        if (!runtimeRef.current || copying) return
        setCopying(true)
        try {
            await copyScreenshotToClipboard(async () => {
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 100)
                })
                if (!runtimeRef.current) throw new Error('runtimeRef')
                return runtimeRef.current
            }, 'umiji-runtime.png')
        } catch (error) {
            notifications.show({
                color: 'red',
                message: `${error instanceof Error ? error.message : t('home.unknown-error')}`,
                title: t('common.message.error')
            })
        } finally {
            setCopying(false)
        }
    }

    if (!systemInfo || !bandwidthStats || !umijiHealth) {
        return <LoadingScreen />
    }

    const simpleMetrics = getSimpleMetrics(systemInfo, t)
    const usersMetrics = getUsersMetrics(systemInfo.users, t)
    const onlineMetrics = getOnlineMetrics(systemInfo.onlineStats, t)

    const [onlineNow, ...onlineRows] = onlineMetrics
    const [usersTotal, ...userRows] = usersMetrics
    const [onlineOnNodes, totalTraffic, ramUsage, totalRam] = simpleMetrics
    const { statusCounts, totalUsers } = systemInfo.users
    const userCounts = [
        statusCounts.ACTIVE,
        statusCounts.EXPIRED,
        statusCounts.LIMITED,
        statusCounts.DISABLED
    ]
    const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0)

    return (
        <Page title={t('constants.home')}>
            <PageHeaderShared
                description={t('page-descriptions.home')}
                title={t('constants.home')}
            />

            <Stack gap="lg">
                <TrafficPanel bandwidthStats={bandwidthStats} />

                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                    <StatPanel
                        caption={onlineNow.title}
                        title={t('home.page.online-stats')}
                        value={onlineNow.value}
                    >
                        {onlineRows.map((metric) => (
                            <StatRow key={metric.title} label={metric.title} value={metric.value} />
                        ))}
                    </StatPanel>

                    <StatPanel
                        caption={usersTotal.title}
                        title={t('user-table.widget.table-title')}
                        value={usersTotal.value}
                    >
                        <Progress.Root mb="xs" size={8}>
                            {userCounts.map((count, index) => (
                                <Progress.Section
                                    color={USER_STATUS_COLORS[index]}
                                    key={USER_STATUS_COLORS[index]}
                                    value={share(count, totalUsers)}
                                />
                            ))}
                        </Progress.Root>
                        {userRows.map((metric, index) => (
                            <StatRow
                                color={USER_STATUS_COLORS[index]}
                                key={metric.title}
                                label={metric.title}
                                value={metric.value}
                            />
                        ))}
                    </StatPanel>

                    <StatPanel
                        caption={ramUsage.title}
                        title={t('common.field.system')}
                        value={ramUsage.value}
                    >
                        <Progress
                            color="rose.8"
                            mb="xs"
                            size={8}
                            value={share(systemInfo.memory.used, systemInfo.memory.total)}
                        />
                        {[totalRam, onlineOnNodes, totalTraffic].map((metric) => (
                            <StatRow key={metric.title} label={metric.title} value={metric.value} />
                        ))}
                    </StatPanel>
                </SimpleGrid>

                {umijiHealth.runtimeMetrics && umijiHealth.runtimeMetrics.length > 0 && (
                    <div className={classes.section}>
                        <Group align="center" gap="xs" mb="sm">
                            <Title className={classes.title} fw={600} fz={18} me={4} order={2}>
                                {t('home.runtime')}
                            </Title>

                            <ActionIcon
                                color="gray"
                                loading={copying}
                                onClick={() => copyRuntimeScreenshot()}
                                radius="md"
                                size="lg"
                                variant="soft"
                            >
                                <TbCamera size={18} />
                            </ActionIcon>

                            <ActionIcon
                                color="gray"
                                onClick={() => {
                                    modals.open({
                                        title: (
                                            <BaseOverlayHeader
                                                IconComponent={TbInfoCircle}
                                                iconSize={20}
                                                subtitle={t('home.runtime-info.subtitle')}
                                                title={t('home.runtime-info.title')}
                                            />
                                        ),
                                        size: 'xl',
                                        centered: true,
                                        fullScreen: isMobile,
                                        children: <RuntimeInfoModalContent />
                                    })
                                }}
                                radius="md"
                                size="lg"
                                variant="soft"
                            >
                                <TbInfoCircle size={18} />
                            </ActionIcon>
                        </Group>
                        <RuntimePanel metrics={umijiHealth.runtimeMetrics} ref={runtimeRef} />
                    </div>
                )}
            </Stack>
            <DisclaimerOverlay />
        </Page>
    )
}

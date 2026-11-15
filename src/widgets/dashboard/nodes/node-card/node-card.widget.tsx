import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { useSortable } from '@dnd-kit/react/sortable'
import { Avatar, Badge, Box, Progress, Stack, Text, Tooltip } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import clsx from 'clsx'
import { CSSProperties, memo, useMemo } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { useTranslation } from 'react-i18next'
import {
    PiArrowDown,
    PiArrowsCounterClockwise,
    PiArrowUp,
    PiCpu,
    PiDotsSixVertical,
    PiMemory,
    PiUsers
} from 'react-icons/pi'
import { TbAlertCircle, TbPackage } from 'react-icons/tb'

import { Logo } from '@shared/ui/logo'
import { XrayLogo } from '@shared/ui/logos'
import { prettifyBytesUtil, prettySiRealtimeBytesUtil } from '@shared/utils/bytes'
import { faviconResolver } from '@shared/utils/misc'
import { getNodeResetDaysUtil, getXrayUptimeUtil } from '@shared/utils/time-utils'

import { IProps } from './interfaces'
import classes from './NodeCard.module.css'

// Rose while there is room, coral near the limit, red at it.
const getTrafficColor = (percentage: number) => {
    if (percentage > 95) return 'red'
    if (percentage > 80) return 'yellow'
    return 'rose'
}

const getLoadColor = (load: number, cpus: number) => {
    const ratio = load / cpus
    if (ratio > 1) return 'red'
    if (ratio > 0.7) return 'yellow'
    return undefined
}

export const NodeCardWidget = memo((props: IProps) => {
    const { t } = useTranslation()
    const {
        handleViewNode,
        node,
        index,
        isDragOverlay = false,
        disableReordering = false,
        pluginsName
    } = props

    const clipboard = useClipboard({ timeout: 500 })

    const sortable = useSortable({
        id: node.uuid,
        index,
        disabled: isDragOverlay || disableReordering,
        plugins: (defaults) => defaults.filter((plugin) => plugin !== OptimisticSortingPlugin)
    })

    const isDragging = !isDragOverlay && sortable.isDragging
    const { ref, handleRef } = sortable

    const style: CSSProperties = {
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 1000 : 'auto'
    }

    const isTracking = node.isTrafficTrackingActive && (node.trafficLimitBytes ?? 0) > 0
    const percentage = isTracking
        ? Math.floor(((node.trafficUsedBytes ?? 0) * 100) / (node.trafficLimitBytes ?? 1))
        : 0
    const prettyUsedData = prettifyBytesUtil(node.trafficUsedBytes || 0) || '0 B'
    const maxData = isTracking ? prettifyBytesUtil(node.trafficLimitBytes || 0) || '∞' : '∞'

    const isOnline = node.isConnected && node.xrayUptime !== 0 && !node.isDisabled
    const isConfigMissing =
        node.configProfile.activeConfigProfileUuid === null ||
        node.configProfile.activeInbounds.length === 0

    // One state, shown as a dot and a word: up, connecting, disabled or down.
    const state = useMemo(() => {
        if (node.isDisabled) {
            return {
                color: 'var(--mantine-color-dark-4)',
                label: t('node-status-badge.widget.disabled')
            }
        }
        if (node.isConnected) {
            return {
                color: 'var(--mantine-color-teal-5)',
                label: isOnline
                    ? getXrayUptimeUtil(node.xrayUptime)
                    : t('node-status-badge.widget.connected')
            }
        }
        if (node.isConnecting) {
            return {
                color: 'var(--mantine-color-yellow-5)',
                label: t('node-status-badge.widget.connecting')
            }
        }
        return { color: 'var(--mantine-color-red-5)', label: t('node-card.offline') }
    }, [node.isDisabled, node.isConnected, node.isConnecting, node.xrayUptime, isOnline, t])

    const { ramPercentage, rxSpeed, txSpeed, loadAvg, cpus } = useMemo(() => {
        if (!node.system) {
            return { ramPercentage: null, rxSpeed: null, txSpeed: null, loadAvg: null, cpus: 1 }
        }
        const { memoryTotal } = node.system.info
        const { memoryUsed, loadAvg, interface: iface } = node.system.stats
        const ramPercentage = Math.round((memoryUsed / memoryTotal) * 100)

        if (!iface) {
            return { ramPercentage, rxSpeed: null, txSpeed: null, loadAvg: null, cpus: 1 }
        }
        return {
            ramPercentage,
            rxSpeed: prettySiRealtimeBytesUtil(iface.rxBytesPerSec, true, true),
            txSpeed: prettySiRealtimeBytesUtil(iface.txBytesPerSec, true, true),
            loadAvg,
            cpus: node.system.info.cpus
        }
    }, [node.system])

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        clipboard.copy(node.address)
        notifications.show({
            message: node.address,
            title: t('common.message.copied'),
            color: 'teal'
        })
    }

    return (
        <Box
            className={clsx(classes.nodeRow, { [classes.nodeRowDragging]: isDragging })}
            data-drag-overlay={isDragOverlay}
            data-disabled={node.isDisabled || undefined}
            onClick={() => handleViewNode(node.uuid)}
            ref={isDragOverlay ? undefined : ref}
            style={style}
        >
            {!disableReordering && (
                <Box
                    className={clsx(classes.dragHandle, {
                        [classes.dragHandleActive]: isDragging
                    })}
                    ref={isDragOverlay ? undefined : handleRef}
                >
                    <PiDotsSixVertical size={20} />
                </Box>
            )}

            <div className={classes.main}>
                <div className={classes.identity}>
                    <span className={classes.dot} style={{ background: state.color }} />
                    {node.countryCode && node.countryCode !== 'XX' && (
                        <ReactCountryFlag
                            countryCode={node.countryCode}
                            style={{ fontSize: '1.35em', borderRadius: '2px', flexShrink: 0 }}
                        />
                    )}
                    <Text className={classes.nodeName}>{node.name}</Text>
                    {isConfigMissing && (
                        <Badge
                            color="red"
                            leftSection={<TbAlertCircle size={12} />}
                            variant="light"
                        >
                            {t('node-card.dangling')}
                        </Badge>
                    )}
                    {node.provider && (
                        <span className={classes.provider}>
                            <Avatar
                                alt={node.provider.name}
                                color="initials"
                                imageProps={{ decoding: 'async', loading: 'lazy' }}
                                name={node.provider.name}
                                onLoad={(event) => {
                                    const img = event.target as HTMLImageElement
                                    if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
                                        img.src = ''
                                    }
                                }}
                                radius="sm"
                                size={16}
                                src={faviconResolver(node.provider.faviconLink)}
                            />
                            <span className={classes.truncate}>{node.provider.name}</span>
                        </span>
                    )}
                </div>

                <Text className={classes.address} onClick={handleCopy}>
                    {node.address}
                </Text>

                <div className={classes.traffic}>
                    <div className={classes.trafficText}>
                        <bdi dir="ltr">
                            <b>{prettyUsedData}</b>
                            <span className={classes.dim}> / {maxData}</span>
                        </bdi>
                        {isTracking && <span className={classes.dim}>{percentage}%</span>}
                    </div>
                    <Progress
                        color={getTrafficColor(percentage)}
                        radius="xl"
                        size={4}
                        value={isTracking ? percentage : 0}
                    />
                </div>

                <Text className={classes.state} style={{ color: state.color }}>
                    {isOnline && <XrayLogo size={13} />}
                    {state.label}
                </Text>
            </div>

            <div className={classes.meta}>
                <span className={classes.metaItem} data-active={node.usersOnline! > 0 || undefined}>
                    <PiUsers size={14} />
                    {node.usersOnline ?? 0}
                </span>

                <span className={classes.metaItem}>
                    <PiMemory size={14} />
                    <Progress
                        className={classes.ramBar}
                        color={ramPercentage !== null && ramPercentage > 90 ? 'red' : 'gray'}
                        radius="xl"
                        size={4}
                        value={ramPercentage ?? 0}
                    />
                    {ramPercentage !== null ? `${ramPercentage}%` : '—'}
                </span>

                <Tooltip
                    label={
                        loadAvg ? (
                            <Stack gap={0}>
                                <Text fw={600} size="xs">
                                    {t('node-card.load-average', { count: cpus })}
                                </Text>
                                {[1, 5, 15].map((minutes, i) => (
                                    <Text key={minutes} size="xs">
                                        {t('node-card.load-average-minutes', {
                                            count: minutes,
                                            load: loadAvg[i].toFixed(2),
                                            percent: Math.round((loadAvg[i] / cpus) * 100)
                                        })}
                                    </Text>
                                ))}
                                <Text c="dimmed" mt={4} size="xs">
                                    {t('node-card.0-70-normal-70-100-high-100-overloaded')}
                                </Text>
                            </Stack>
                        ) : (
                            t('node-card.no-data')
                        )
                    }
                    multiline
                    w={250}
                >
                    <span className={classes.metaItem}>
                        <PiCpu size={14} />
                        {loadAvg
                            ? loadAvg.map((load, i) => (
                                  <Text
                                      c={getLoadColor(load, cpus)}
                                      component="span"
                                      key={i}
                                      size="xs"
                                  >
                                      {load.toFixed(2)}
                                  </Text>
                              ))
                            : '—'}
                    </span>
                </Tooltip>

                <span className={classes.metaItem}>
                    <PiArrowDown size={13} />
                    {rxSpeed ?? '—'}
                    <PiArrowUp size={13} />
                    {txSpeed ?? '—'}
                </span>

                {node.isTrafficTrackingActive && (
                    <span className={classes.metaItem}>
                        <PiArrowsCounterClockwise size={14} />
                        {getNodeResetDaysUtil(node.trafficResetDay ?? 1)}
                    </span>
                )}

                <span className={classes.metaEnd}>
                    {pluginsName && (
                        <span className={classes.metaItem}>
                            <TbPackage size={14} />
                            <span className={classes.truncate}>{pluginsName}</span>
                        </span>
                    )}
                    <span className={classes.metaItem}>
                        <XrayLogo color="currentColor" size={12} />
                        {node.versions ? node.versions.xray : '—'}
                    </span>
                    <span className={classes.metaItem}>
                        <Logo color="currentColor" size={12} />
                        {node.versions ? node.versions.node : '—'}
                    </span>
                </span>
            </div>
        </Box>
    )
})

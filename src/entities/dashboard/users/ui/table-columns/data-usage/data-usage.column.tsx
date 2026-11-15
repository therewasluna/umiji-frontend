import { Box, Group, Progress, Text } from '@mantine/core'

import { prettifyBytesUtil } from '@shared/utils/bytes'

import { IProps } from '@entities/dashboard/users/ui/table-columns/username/interface'

// The reset strategy and lifetime usage live in the row's details panel.
export function DataUsageColumnEntity(props: IProps) {
    const { user } = props

    const usedBytes = user.userTraffic.usedTrafficBytes
    const limitBytes = user.trafficLimitBytes
    const isUnlimited = limitBytes === 0
    const percentage = isUnlimited ? 0 : (usedBytes * 100) / limitBytes

    const prettyUsedData = prettifyBytesUtil(usedBytes) || '0 B'
    const maxData = isUnlimited ? '∞' : prettifyBytesUtil(limitBytes) || '∞'

    // Rose while there is room, coral near the cap, red at it.
    const getProgressColor = () => {
        if (percentage > 95) return 'red'
        if (percentage > 80) return 'yellow'
        return 'rose'
    }

    return (
        <Box ta="start">
            <Group gap={6} justify="space-between" wrap="nowrap">
                <Text fz="sm" truncate="end">
                    <bdi>
                        <b>{prettyUsedData}</b>
                        <Text c="dimmed" component="span" fz="sm">
                            {' '}
                            / {maxData}
                        </Text>
                    </bdi>
                </Text>
                {!isUnlimited && (
                    <Text c="dimmed" fz="xs" style={{ whiteSpace: 'nowrap' }}>
                        <bdi>{percentage.toFixed(1)}%</bdi>
                    </Text>
                )}
            </Group>
            <Progress
                color={getProgressColor()}
                mt={6}
                radius="xl"
                size={6}
                value={Math.min(percentage, 100)}
            />
        </Box>
    )
}

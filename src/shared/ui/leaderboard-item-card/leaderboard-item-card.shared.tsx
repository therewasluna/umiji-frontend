import { Box, Group, Text } from '@mantine/core'
import clsx from 'clsx'
import { ReactNode } from 'react'

import { prettifyBytesUtil } from '@shared/utils/bytes'

import styles from './leaderboard-item-card.module.css'

interface IProps {
    color: string
    countryFlag?: ReactNode
    formatValue?: (value: number) => string
    name: string
    onItemClick?: () => void
    total: number
    uuid?: string
    value: number
}

// A plain row with a thin share bar underneath, instead of a tinted block per row.
export const LeaderboardItemCardShared = (props: IProps) => {
    const { color, countryFlag, formatValue, value, name, total, uuid, onItemClick } = props

    const width = value > 0 ? (total / value) * 100 : 0

    return (
        <Box
            className={clsx(styles.item, { [styles.clickable]: onItemClick })}
            key={uuid ?? name}
            onClick={onItemClick}
        >
            <Group gap={10} justify="space-between" wrap="nowrap">
                <Group gap={10} style={{ minWidth: 0 }} wrap="nowrap">
                    <span className={styles.dot} style={{ background: color }} />
                    {countryFlag}
                    <Text fw={500} size="sm" style={{ minWidth: 0 }} truncate="end">
                        {name}
                    </Text>
                </Group>
                <Text
                    fw={600}
                    size="sm"
                    style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                    {formatValue ? formatValue(total) : prettifyBytesUtil(total)}
                </Text>
            </Group>
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${width}%`, background: color }} />
            </div>
        </Box>
    )
}

import { Card, Group, Text, ThemeIconProps } from '@mantine/core'
import { ReactNode } from 'react'

import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import { formatInt } from '@shared/utils/misc'

import classes from './metric-card.module.css'

// The icon* fields are still accepted from callers; the icon now renders as a small neutral glyph.
export interface IMetricCardProps {
    iconColor?: ThemeIconProps['color']
    IconComponent: React.ComponentType<{ size: number }>
    iconSize?: number
    iconVariant: ThemeIconProps['variant']
    isLoading?: boolean
    subtitle?: string
    themeIconProps?: ThemeIconProps
    title: string
    value: number | string
    rollingNumberComponent?: ReactNode
}

export function MetricCardShared(props: IMetricCardProps) {
    const { IconComponent, isLoading, title, value, subtitle, rollingNumberComponent } = props

    return (
        <Card className={classes.card} padding="lg">
            <Group className={classes.head} gap={8} wrap="nowrap">
                <IconComponent size={16} />
                <Text className={classes.title} truncate="end">
                    {title}
                </Text>
            </Group>
            {isLoading ? (
                <ShimmerSkeleton height={30} width={80} />
            ) : (
                (rollingNumberComponent ?? (
                    <Text className={classes.value} truncate="end">
                        {typeof value === 'number' ? formatInt(value) : value}
                    </Text>
                ))
            )}
            {subtitle && <Text className={classes.subtitle}>{subtitle}</Text>}
        </Card>
    )
}

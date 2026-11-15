import { Card, ColorSwatch, Group, Text } from '@mantine/core'

import classes from '../home.module.css'

interface IStatPanelProps {
    caption?: string
    children?: React.ReactNode
    title: string
    value: number | string
}

export const StatPanel = ({ caption, children, title, value }: IStatPanelProps) => (
    <Card className={classes.panel} p="xl" radius="lg">
        <Text c="dimmed" size="sm">
            {title}
        </Text>
        <Group align="baseline" gap="xs" mb="sm">
            <Text className={classes.big}>
                <bdi dir="ltr">{value}</bdi>
            </Text>
            {caption && (
                <Text c="dimmed" size="sm">
                    {caption}
                </Text>
            )}
        </Group>
        {children}
    </Card>
)

interface IStatRowProps {
    color?: string
    label: string
    value: number | string
}

export const StatRow = ({ color, label, value }: IStatRowProps) => (
    <Group className={classes.row} justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap">
            {color && <ColorSwatch color={color} size={8} withShadow={false} />}
            <Text c="dimmed" size="sm">
                {label}
            </Text>
        </Group>
        <Text fw={600} size="sm">
            <bdi dir="ltr">{value}</bdi>
        </Text>
    </Group>
)

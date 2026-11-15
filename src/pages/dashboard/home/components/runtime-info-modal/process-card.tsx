import { Box, Group, Text, ThemeIcon } from '@mantine/core'
import { ComponentType, ReactNode } from 'react'

import classes from './runtime-info-modal.module.css'

interface IProps {
    description: ReactNode
    Icon: ComponentType<{ size: number }>
    title: string
}

export const ProcessCard = (props: IProps) => {
    const { description, Icon, title } = props
    return (
        <Box className={classes.processCard}>
            <Group gap="xs" mb={6} wrap="nowrap">
                <ThemeIcon color="gray" radius="md" size="md" variant="soft">
                    <Icon size={16} />
                </ThemeIcon>
                <Text c="white" fw={700} size="sm">
                    {title}
                </Text>
            </Group>
            <Text c="dimmed" lh={1.55} size="sm">
                {description}
            </Text>
        </Box>
    )
}

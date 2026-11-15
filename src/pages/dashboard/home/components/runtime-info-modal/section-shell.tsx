import { Box, Divider, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { ComponentType, ReactNode } from 'react'

import classes from './runtime-info-modal.module.css'

interface IProps {
    children: ReactNode
    description: string
    Icon: ComponentType<{ size: number }>
    title: string
}

export const SectionShell = (props: IProps) => {
    const { children, description, Icon, title } = props
    return (
        <Box className={classes.section}>
            <Group align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon color="gray" radius="md" size="lg" variant="soft">
                    <Icon size={20} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1 }}>
                    <Title c="white" order={5}>
                        {title}
                    </Title>
                    <Text c="dimmed" size="xs">
                        {description}
                    </Text>
                </Stack>
            </Group>
            <Divider my="sm" />
            {children}
        </Box>
    )
}

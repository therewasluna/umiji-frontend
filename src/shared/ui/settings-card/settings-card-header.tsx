import { Box, Divider, Group, Text, Title } from '@mantine/core'
import { ReactNode } from 'react'

interface SettingsCardHeaderProps {
    actions?: ReactNode
    description: ReactNode | string
    title: string
}

export function SettingsCardHeader({ actions, description, title }: SettingsCardHeaderProps) {
    return (
        <Box>
            {/* Wraps so the actions drop under the description on a phone instead of squeezing it. */}
            <Group align="flex-start" gap="md" justify="space-between">
                <Box miw={0}>
                    <Title fw={600} fz={17} order={2}>
                        {title}
                    </Title>
                    <Text c="dimmed" size="sm">
                        {description}
                    </Text>
                </Box>
                {actions && (
                    <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
                        {actions}
                    </Group>
                )}
            </Group>

            <Divider color="rgba(255, 255, 255, 0.07)" mt="md" />
        </Box>
    )
}

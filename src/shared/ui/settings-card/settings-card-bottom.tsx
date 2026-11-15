import { Divider, Stack } from '@mantine/core'
import { ReactNode } from 'react'

interface SettingsCardBottomProps {
    children: ReactNode
}

export function SettingsCardBottom({ children }: SettingsCardBottomProps) {
    return (
        // mt=auto pins the footer to the bottom when the card is taller than its content.
        <Stack gap="xs" mt="auto">
            <Divider
                mt="lg"
                style={{
                    opacity: 0.3
                }}
            />
            {children}
        </Stack>
    )
}

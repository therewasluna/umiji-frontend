import { Avatar, Box, Group, Indicator, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { getConnectionStatusColorUtil, getTimeAgoUtil } from '@shared/utils/time-utils'

import { IProps } from '@entities/dashboard/users/ui/table-columns/username/interface'

// What getConnectionStatusColorUtil returns for someone seen within the last minute.
const ONLINE_COLOR = 'var(--mantine-color-teal-5)'

// Initials from the part after a broker prefix ("nova-seller_omid_r" -> "OR"), so a broker's users don't all read "NO".
const getInitials = (username: string) => {
    const name = username.slice(username.indexOf('_') + 1) || username
    const parts = name.split(/[_\-.\s]+/).filter(Boolean)
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
    return letters.toUpperCase()
}

export function UsernameColumnEntity(props: IProps) {
    const { t, i18n } = useTranslation()

    const { user } = props

    const color = getConnectionStatusColorUtil(user.userTraffic.onlineAt)
    const timeAgo = getTimeAgoUtil(user.userTraffic.onlineAt, t, i18n.language)

    // Initials avatar with the connection state as a dot on its corner; it pulses while the user is online.
    return (
        <Group align="center" gap="sm" wrap="nowrap">
            <Indicator
                color={color}
                offset={5}
                position="bottom-end"
                processing={color === ONLINE_COLOR}
                size={10}
                withBorder
                zIndex={1}
            >
                <Avatar color="gray" radius="xl" size={38} variant="light">
                    {getInitials(user.username)}
                </Avatar>
            </Indicator>
            <Box miw={0}>
                {/* Wraps, never truncates: a broker's users share a prefix, so the end is what tells them apart. */}
                <Text fw={600} size="sm" style={{ overflowWrap: 'anywhere' }}>
                    {user.username}
                </Text>
                <Text c="dimmed" size="xs" truncate="end">
                    {timeAgo} · <bdi>#{user.id}</bdi>
                </Text>
            </Box>
        </Group>
    )
}

import { Stack, Text } from '@mantine/core'
import { UserStatusBadge } from '@widgets/dashboard/users/user-status-badge'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { getExpirationTextUtil } from '@shared/utils/time-utils'

import { IProps } from './interface'

export function StatusColumnEntity(props: IProps) {
    const { t, i18n } = useTranslation()

    const { user, need } = props

    const expirationText = getExpirationTextUtil(user.expireAt, t, i18n)

    if (need === 'badge') {
        return <UserStatusBadge size="md" status={user.status} />
    }

    if (need === 'date') {
        // Same 3-day rule as the broker overview's "Expiring soon" list.
        const daysLeft = dayjs(user.expireAt).diff(dayjs(), 'day', true)
        const isClose = daysLeft >= 0 && daysLeft <= 3

        return (
            <Text c={isClose ? 'yellow' : 'dark.1'} fw={isClose ? 600 : 400} size="sm">
                {expirationText}
            </Text>
        )
    }

    return (
        <Stack gap="xs">
            <UserStatusBadge status={user.status} />
            <Text c="dimmed" size="xs">
                {expirationText}
            </Text>
        </Stack>
    )
}

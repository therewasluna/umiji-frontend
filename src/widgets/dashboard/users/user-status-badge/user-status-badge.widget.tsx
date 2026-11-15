import { Badge, BadgeProps } from '@mantine/core'
import { TUsersStatus, USERS_STATUS } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'

interface IProps extends Omit<BadgeProps, 'children' | 'color'> {
    status: TUsersStatus
}

// Outlined: green while active, coral when limited, quiet when expired or disabled.
const STATUS_COLORS: Record<TUsersStatus, BadgeProps['color']> = {
    [USERS_STATUS.ACTIVE]: 'teal',
    [USERS_STATUS.LIMITED]: 'orange',
    [USERS_STATUS.EXPIRED]: 'gray',
    [USERS_STATUS.DISABLED]: 'gray'
}

export function UserStatusBadge({ status, ...props }: IProps) {
    const { t } = useTranslation()
    const labels: Record<TUsersStatus, string> = {
        [USERS_STATUS.ACTIVE]: t('users-metrics.active'),
        [USERS_STATUS.LIMITED]: t('users-metrics.limited'),
        [USERS_STATUS.EXPIRED]: t('users-metrics.expired'),
        [USERS_STATUS.DISABLED]: t('users-metrics.disabled')
    }

    return (
        <Badge
            color={STATUS_COLORS[status] ?? 'gray'}
            size="lg"
            tt="none"
            variant="soft"
            {...props}
        >
            {labels[status] ?? status}
        </Badge>
    )
}

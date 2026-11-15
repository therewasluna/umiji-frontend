import { DataTableColumn } from '@kastov/mantine-datatable'
import { ActionIcon, Text } from '@mantine/core'
import { GetTopUsersByHwidDevicesCommand } from '@umiji/backend-contract'
import { TFunction } from 'i18next'
import { PiUserCircle } from 'react-icons/pi'
import { TbSum } from 'react-icons/tb'

export function getHwidInspectorLeaderboardColumns(
    t: TFunction,
    handleViewUser: (userId: number) => void
): DataTableColumn<GetTopUsersByHwidDevicesCommand.Response['response']['users'][number]>[] {
    return [
        {
            accessor: 'actions',
            draggable: false,
            title: '',
            width: 60,
            render: ({ id }) => (
                <ActionIcon
                    aria-label={t('common.action.view')}
                    color="gray"
                    onClick={() => handleViewUser(id)}
                    size="md"
                    variant="soft"
                >
                    <PiUserCircle size={20} />
                </ActionIcon>
            )
        },
        {
            accessor: 'username',
            title: t('common.field.username'),
            render: ({ username }) => username
        },
        {
            accessor: 'id',
            title: 'ID',
            width: 120,
            render: ({ id }) => (
                <Text c="dimmed" size="sm">
                    {id}
                </Text>
            )
        },
        {
            accessor: 'devicesCount',
            title: <TbSum size={18} />,
            width: 100,
            textAlign: 'right',
            render: ({ devicesCount }) => (
                <Text c="white" fw={600} size="sm">
                    {devicesCount}
                </Text>
            )
        }
    ]
}

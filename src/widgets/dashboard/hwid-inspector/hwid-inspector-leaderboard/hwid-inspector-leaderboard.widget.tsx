import { DataTable } from '@kastov/mantine-datatable'
import { ActionIcon, Tooltip } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbRefresh } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetTopUsersByHwidDevices } from '@shared/api/hooks'
import { DataTableShared } from '@shared/ui/table'
import { sToMs } from '@shared/utils/time-utils'

import { getHwidInspectorLeaderboardColumns } from './get-hwid-inspector-leaderboard-columns'

const PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]

export function HwidInspectorLeaderboardWidget() {
    const { t } = useTranslation()

    const [pageSize, setPageSize] = useState(PAGE_SIZE)
    const [page, setPage] = useState(1)
    const { copy } = useClipboard()

    const {
        data: usersResponse,
        isLoading,
        isFetching,
        refetch
    } = useGetTopUsersByHwidDevices({
        query: {
            start: (page - 1) * pageSize,
            size: pageSize
        },
        rQueryParams: {
            refetchInterval: sToMs(25)
        }
    })

    const handleChangePageSize = (pageSize: number) => {
        setPageSize(pageSize)
        setPage(1)
    }

    return (
        <DataTableShared.Container>
            <DataTableShared.Title
                description={t('hwid-inspector-leaderboard.top-users-description')}
                title={t('hwid-inspector-leaderboard.top-users')}
            />

            <DataTable
                borderRadius="sm"
                columns={getHwidInspectorLeaderboardColumns(t, async (userId) => {
                    showModal('users_viewUserModal', { userId })
                })}
                defaultColumnProps={{
                    noWrap: true,
                    textAlign: 'left',
                    ellipsis: true,
                    draggable: false
                }}
                fetching={isLoading}
                maxHeight={420}
                idAccessor="id"
                onCellClick={({ record, column }) => {
                    if (column.accessor === 'actions') {
                        return
                    }
                    copy(record[column.accessor as keyof typeof record])
                    notifications.show({
                        title: t('common.message.copied'),
                        message: record[column.accessor as keyof typeof record],
                        color: 'teal'
                    })
                }}
                onPageChange={setPage}
                onRecordsPerPageChange={handleChangePageSize}
                page={page}
                records={usersResponse?.users ?? []}
                recordsPerPage={pageSize}
                recordsPerPageLabel=""
                recordsPerPageOptions={PAGE_SIZE_OPTIONS}
                renderPagination={({ Controls }) => (
                    <>
                        <Controls.Text />
                        <Tooltip label={t('common.action.update')} withArrow>
                            <ActionIcon
                                color="gray"
                                loading={isFetching}
                                onClick={() => refetch()}
                                size="md"
                                variant="subtle"
                            >
                                <TbRefresh size="20px" />
                            </ActionIcon>
                        </Tooltip>
                        <Controls.PageSizeSelector />
                        <Controls.Pagination />
                    </>
                )}
                totalRecords={usersResponse?.total ?? 0}
                striped
                withRowBorders
                withTableBorder
            />
        </DataTableShared.Container>
    )
}

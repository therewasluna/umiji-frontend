import { UserActionGroupFeature } from '@features/dashboard/users/users-action-group'
import { useUserTableColumns } from '@features/dashboard/users/users-table/model/use-table-columns'
import { UsersTableSelectionFeature } from '@features/ui/dashboard/users/users-table-selection/users-table-selection.feature'
import {
    MRT_ColumnFilterFnsState,
    MRT_FilterTextInput,
    MRT_Header,
    MRT_Localization,
    MRT_TablePagination,
    useMantineReactTable
} from '@kastov/mantine-react-table-open'
import { MRT_Localization_EN } from '@kastov/mantine-react-table-open/locales/en/index.esm.mjs'
import { MRT_Localization_FA } from '@kastov/mantine-react-table-open/locales/fa/index.esm.mjs'
import { MRT_Localization_RU } from '@kastov/mantine-react-table-open/locales/ru/index.esm.mjs'
import { MRT_Localization_ZH_HANS } from '@kastov/mantine-react-table-open/locales/zh-Hans/index.esm.mjs'
import { Alert, Button, Stack, Text } from '@mantine/core'
import { GetUsersCommand } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
    useAssignableSquads,
    useGetBrokers,
    useGetNodes,
    useGetUsers,
    useGetUserTags
} from '@shared/api/hooks'
import { DEFAULT_PAGINATION_STATE, useMrtTableBinding } from '@shared/lib/mrt-table-store'
import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import { sToMs } from '@shared/utils/time-utils'

import { useIsBroker } from '@entities/auth/session-store'
import {
    useUsersTableSelectionStoreActions,
    useUsersTableSelectionStoreTableSelection
} from '@entities/dashboard/users/users-table-selection'
import { useUsersTableStore } from '@entities/dashboard/users/users-table-store'

import { UserRow } from './user-row'
import classes from './user-table.module.css'

type TUserRow = GetUsersCommand.Response['response']['users'][number]

const SKELETON_ROWS = 6

const MRT_LOCALES: Record<string, MRT_Localization> = {
    en: MRT_Localization_EN,
    fa: MRT_Localization_FA,
    ru: MRT_Localization_RU,
    zh: MRT_Localization_ZH_HANS
}

// MRT draws filters as underlined table-cell inputs; here they sit in the toolbar and a drawer.
const FILTER_INPUT_PROPS = { style: { borderBottom: 0 }, variant: 'default' } as const

export function UserTableWidget() {
    const { t, i18n } = useTranslation()

    const isBroker = useIsBroker()
    const { internalSquads, externalSquads } = useAssignableSquads()
    const { data: nodes } = useGetNodes({ rQueryParams: { enabled: !isBroker } })
    const { data: brokers } = useGetBrokers({ rQueryParams: { enabled: !isBroker } })
    const { data: tags } = useGetUserTags()

    const tableColumns = useUserTableColumns(internalSquads, externalSquads, nodes, brokers)
    const usersTableSelectionStoreActions = useUsersTableSelectionStoreActions()
    const tableSelection = useUsersTableSelectionStoreTableSelection()
    const { state: persistedTableState, handlers: persistedTableHandlers } =
        useMrtTableBinding(useUsersTableStore)

    const defaultFilterFns: Record<string, string> = {
        hwidDeviceLimit: 'equals',
        tag: 'equals',
        trafficLimitBytes: 'between'
    }

    const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(() =>
        Object.fromEntries(
            tableColumns.map(({ accessorKey }) => [
                accessorKey,
                defaultFilterFns[accessorKey!] ?? 'contains'
            ])
        )
    )

    const params = {
        start: persistedTableState.pagination.pageIndex * persistedTableState.pagination.pageSize,
        size: persistedTableState.pagination.pageSize,
        filters: persistedTableState.columnFilters.filter(
            ({ id, value }) =>
                // Saved filters can name a column this account doesn't have, e.g. the owner's
                // broker filter left in a browser a broker then signs in to; it would hide every row.
                tableColumns.some(({ accessorKey }) => accessorKey === id) &&
                (Array.isArray(value)
                    ? value.some((bound) => bound !== null && bound !== undefined && bound !== '')
                    : value !== null && value !== undefined && value !== '')
        ),
        filterModes: columnFilterFns,
        sorting: persistedTableState.sorting
    }

    const {
        data: usersResponse,
        isError,
        isLoading,
        refetch
    } = useGetUsers({
        query: params,
        rQueryParams: {
            // enabled: bulkUsersActionsStoreActions.getUuidLength() === 0,
            refetchInterval:
                usersTableSelectionStoreActions.getIdsLength() === 0 ? sToMs(25) : false
        }
    })

    // MRT stays the list's engine (filters, sorting, paging, selection, saved templates);
    // the list below replaces only its table markup.
    const table = useMantineReactTable({
        columns: tableColumns,
        data: usersResponse?.users ?? [],
        enableFacetedValues: true,
        getFacetedUniqueValues: (_table, columnId) => () => {
            if (columnId === 'tag') {
                return new Map<string, number>(tags?.tags.map((tag) => [tag, 0]) ?? [])
            }
            if (columnId === 'status') {
                return new Map<string, number>(
                    ['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED'].map((status) => [status, 0]) ?? []
                )
            }
            return new Map<string, number>()
        },
        mantineFilterSelectProps: ({ column }) => {
            const value = column.getFilterValue()
            return {
                ...FILTER_INPUT_PROPS,
                clearable: value !== undefined && value !== null && value !== ''
            }
        },
        mantineFilterMultiSelectProps: ({ column }) => {
            const value = column.getFilterValue()
            return {
                ...FILTER_INPUT_PROPS,
                clearable: Array.isArray(value) && value.length > 0
            }
        },
        mantineFilterTextInputProps: () => ({
            ...FILTER_INPUT_PROPS,
            placeholder: t('user-table.filter-by')
        }),
        localization: MRT_LOCALES[i18n.language.split('-')[0]] ?? MRT_Localization_EN,
        enableGlobalFilter: false,
        enableColumnFilterModes: true,
        columnFilterModeOptions: ['contains'],
        initialState: {
            pagination: DEFAULT_PAGINATION_STATE,
            sorting: [{ id: 'id', desc: true }]
        },
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        ...persistedTableHandlers,
        onColumnFilterFnsChange: setColumnFilterFns,
        rowCount: usersResponse?.total ?? 0,
        enableRowSelection: true,
        selectAllMode: 'page',
        state: {
            ...persistedTableState,
            // A saved column layout from the old table must not hide a field or a filter here.
            columnOrder: [],
            columnVisibility: {},
            columnFilterFns,
            isLoading,
            showColumnFilters: true,
            rowSelection: tableSelection
        },
        onRowSelectionChange: usersTableSelectionStoreActions.setTableSelection,
        getRowId: (originalRow) => originalRow.id?.toString() ?? 'unknown'
    })

    const rows = table.getRowModel().rows
    const hasFilters = persistedTableState.columnFilters.length > 0
    const searchHeader = table.getLeafHeaders().find(({ column }) => column.id === 'username')

    return (
        <div>
            <div className={classes.toolbar}>
                <div className={classes.search}>
                    {searchHeader && (
                        <MRT_FilterTextInput
                            header={searchHeader as MRT_Header<TUserRow>}
                            table={table}
                        />
                    )}
                </div>
                <UserActionGroupFeature refetch={refetch} table={table} />
            </div>

            <div className={classes.selection}>
                <UsersTableSelectionFeature
                    resetRowSelection={table.resetRowSelection}
                    toggleAllPageRowsSelected={table.toggleAllPageRowsSelected}
                />
            </div>

            {isError && (
                <Alert color="red" mb="sm" variant="light">
                    {t('user-table.widget.error-loading-data')}
                </Alert>
            )}

            <div className={classes.list}>
                {isLoading &&
                    Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <ShimmerSkeleton height={78} key={index} width="100%" />
                    ))}

                {!isLoading && rows.map((row) => <UserRow key={row.id} row={row} table={table} />)}

                {!isLoading && !isError && rows.length === 0 && (
                    <Stack align="center" className={classes.empty} gap="sm">
                        <Text c="dimmed" size="sm">
                            {t('user-table.nothing-to-show')}
                        </Text>
                        {hasFilters && (
                            <Button
                                color="gray"
                                onClick={() => table.resetColumnFilters(true)}
                                size="sm"
                                variant="soft"
                            >
                                {t('action-group.feature.clear-filters')}
                            </Button>
                        )}
                    </Stack>
                )}
            </div>

            <div className={classes.pagination}>
                <MRT_TablePagination table={table} />
            </div>
        </div>
    )
}

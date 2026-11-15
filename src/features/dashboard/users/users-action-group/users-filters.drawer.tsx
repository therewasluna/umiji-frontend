import {
    localizedFilterOption,
    MRT_Header,
    MRT_TableHeadCellFilterContainer,
    MRT_TableInstance
} from '@kastov/mantine-react-table-open'
import { Button, Drawer, Input, SegmentedControl, Select, Stack } from '@mantine/core'
import { GetUsersCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbAdjustmentsHorizontal } from 'react-icons/tb'

import { DrawerFooter } from '@shared/ui/drawer-footer'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

import { UsersTableTemplatesFeature } from '../users-table-templates/users-table-templates.feature'

type TUserRow = GetUsersCommand.Response['response']['users'][number]

interface IProps {
    onClear: () => void
    onClose: () => void
    opened: boolean
    table: MRT_TableInstance<TUserRow>
}

/** Everything that shapes the list and isn't the search box: sorting, every filter, saved templates. */
export const UsersFiltersDrawer = (props: IProps) => {
    const { onClear, onClose, opened, table } = props
    const { t } = useTranslation()

    const { columnFilterFns, sorting } = table.getState()
    const [sort] = sorting
    const usernameModes = table.getColumn('username').columnDef.columnFilterModeOptions ?? []

    return (
        <Drawer
            onClose={onClose}
            opened={opened}
            position="right"
            size="md"
            title={
                <BaseOverlayHeader
                    IconComponent={TbAdjustmentsHorizontal}
                    title={t('user-table.filters')}
                />
            }
        >
            <Stack gap="md">
                <Stack gap="xs">
                    <Select
                        allowDeselect={false}
                        data={table
                            .getAllLeafColumns()
                            .filter((column) => column.getCanSort())
                            .map((column) => ({
                                label: String(column.columnDef.header),
                                value: column.id
                            }))}
                        label={t('user-table.sort-by')}
                        onChange={(id) =>
                            id && table.setSorting([{ id, desc: sort?.desc ?? true }])
                        }
                        value={sort?.id ?? null}
                    />
                    <SegmentedControl
                        data={[
                            { label: t('user-table.descending'), value: 'desc' },
                            { label: t('user-table.ascending'), value: 'asc' }
                        ]}
                        disabled={!sort}
                        fullWidth
                        onChange={(direction) =>
                            sort && table.setSorting([{ id: sort.id, desc: direction === 'desc' }])
                        }
                        value={sort?.desc === false ? 'asc' : 'desc'}
                    />
                </Stack>

                <Select
                    allowDeselect={false}
                    data={usernameModes.map((mode) => ({
                        label: localizedFilterOption(table.options.localization, mode),
                        value: mode
                    }))}
                    label={t('user-table.username-match')}
                    onChange={(mode) =>
                        mode && table.setColumnFilterFns((prev) => ({ ...prev, username: mode }))
                    }
                    value={columnFilterFns.username as string}
                />

                {table
                    .getLeafHeaders()
                    .filter(({ column }) => column.getCanFilter() && column.id !== 'username')
                    .map((header) => (
                        <div key={header.id}>
                            <Input.Label labelElement="div">
                                {String(header.column.columnDef.header)}
                            </Input.Label>
                            <MRT_TableHeadCellFilterContainer
                                header={header as MRT_Header<TUserRow>}
                                table={table}
                            />
                        </div>
                    ))}
            </Stack>

            <DrawerFooter>
                <UsersTableTemplatesFeature table={table} />
                <Button color="gray" onClick={onClear} variant="soft">
                    {t('action-group.feature.clear-filters')}
                </Button>
                <Button onClick={onClose} variant="filled">
                    {t('common.action.close')}
                </Button>
            </DrawerFooter>
        </Drawer>
    )
}

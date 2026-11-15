import { ActionIcon, Button, Indicator, Menu, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'
import {
    TbAdjustmentsHorizontal,
    TbBolt,
    TbDotsVertical,
    TbEdit,
    TbPlus,
    TbRefresh,
    TbSelectAll
} from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'

import { useIsBroker } from '@entities/auth/session-store'
import { useUsersTableStoreActions } from '@entities/dashboard/users/users-table-store'

import { IProps } from './interfaces'
import { UsersFiltersDrawer } from './users-filters.drawer'

export const UserActionGroupFeature = (props: IProps) => {
    const { t } = useTranslation()

    const { refetch, table } = props
    const actions = useUsersTableStoreActions()
    const isBroker = useIsBroker()
    const [filtersOpened, { close: closeFilters, open: openFilters }] = useDisclosure(false)

    if (!table || !refetch) {
        return null
    }

    const handleClear = () => {
        refetch()
        actions.resetState()

        table.resetPageIndex(false)
        table.resetSorting(false)
        table.resetPagination(false)
        table.resetColumnFilters(true)
        table.resetGlobalFilter(true)
    }

    const filtersCount = table.getState().columnFilters.length

    return (
        <>
            <Tooltip label={t('user-table.filters')} withArrow>
                <Indicator disabled={filtersCount === 0} inline label={filtersCount} size={18}>
                    <ActionIcon
                        aria-label={t('user-table.filters')}
                        color="gray"
                        onClick={openFilters}
                        size="input-md"
                        variant="soft"
                    >
                        <TbAdjustmentsHorizontal size="24px" />
                    </ActionIcon>
                </Indicator>
            </Tooltip>

            <Menu position="bottom-end" shadow="md" trigger="click" width={220} withArrow>
                <Menu.Target>
                    <ActionIcon
                        aria-label={t('common.action.more-actions')}
                        color="gray"
                        size="input-md"
                        variant="soft"
                    >
                        <TbDotsVertical size="24px" />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item leftSection={<TbRefresh size={16} />} onClick={() => refetch()}>
                        {t('common.action.refresh')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<TbSelectAll size={16} />}
                        onClick={() => table.toggleAllPageRowsSelected(true)}
                    >
                        {t('common.action.select-all')}
                    </Menu.Item>

                    {!isBroker && (
                        <>
                            <Menu.Divider />
                            <Menu.Item
                                leftSection={<TbBolt size={16} />}
                                onClick={() => showModal('users_bulkAllUsersActionsModal')}
                            >
                                {t('common.action.bulk-actions')}
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<TbEdit size={16} />}
                                onClick={() => showModal('users_bulkAllUsersUpdateModal')}
                            >
                                {t('common.action.bulk-edit')}
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>
            </Menu>

            {/* Wide: the labelled primary button. Phone: the same action as an icon, so the search keeps its room. */}
            <Button
                leftSection={<TbPlus size={18} />}
                onClick={() => showModal('users_createUserModal')}
                size="md"
                variant="filled"
                visibleFrom="xs"
            >
                {t('common.action.create')}
            </Button>
            <ActionIcon
                aria-label={t('common.action.create')}
                color="rose"
                hiddenFrom="xs"
                onClick={() => showModal('users_createUserModal')}
                size="input-md"
                variant="filled"
            >
                <TbPlus size="24px" />
            </ActionIcon>

            <UsersFiltersDrawer
                onClear={handleClear}
                onClose={closeFilters}
                opened={filtersOpened}
                table={table}
            />
        </>
    )
}

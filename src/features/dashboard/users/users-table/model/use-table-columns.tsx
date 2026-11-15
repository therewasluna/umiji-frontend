import { MRT_ColumnDef } from '@kastov/mantine-react-table-open'
import { Badge, ComboboxItem, Group, SelectProps, Text } from '@mantine/core'
import { GetBrokersCommand, GetNodesCommand, GetUsersCommand } from '@umiji/backend-contract'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PiHandshake } from 'react-icons/pi'
import { TbSearch, TbTag } from 'react-icons/tb'

import { IAssignableExternalSquads, IAssignableInternalSquads } from '@shared/api/hooks'
import { resetDataStrategy } from '@shared/constants/forms/reset-data.constants'
import { prettifyBytesUtil } from '@shared/utils/bytes'
import { formatInt } from '@shared/utils/misc'
import { formatTimeUtil } from '@shared/utils/time-utils'

import { useIsBroker } from '@entities/auth/session-store'
import { DataUsageColumnEntity } from '@entities/dashboard/users/ui'
import { ConnectedNodeColumnEntity } from '@entities/dashboard/users/ui/table-columns/connected-node'
import { StatusColumnEntity } from '@entities/dashboard/users/ui/table-columns/status'
import { UsernameColumnEntity } from '@entities/dashboard/users/ui/table-columns/username'

import { NodeSelectItem, NodeSelectItemProps } from './node-select-item'
import { TrafficLimitRangeFilter } from './traffic-limit-range-filter'

const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
    const item = option as ComboboxItem & { membersCount?: number }
    return (
        <Group flex="1" gap="xs" w="100%" wrap="nowrap">
            <Text size="sm" truncate="end">
                {item.label}
            </Text>
            {item.membersCount !== undefined && (
                <Badge color="gray" ml="auto" size="sm" style={{ flexShrink: 0 }} variant="light">
                    {formatInt(item.membersCount)}
                </Badge>
            )}
        </Group>
    )
}

type TUserRow = GetUsersCommand.Response['response']['users'][number]

/**
 * Every field the users list knows about, in one place: how it renders, filters and sorts.
 * A field the row doesn't show lands in the row's details panel, so a new one can't get lost.
 */
export const useUserTableColumns = (
    internalSquads?: IAssignableInternalSquads,
    externalSquads?: IAssignableExternalSquads,
    nodes?: GetNodesCommand.Response['response'],
    brokers?: GetBrokersCommand.Response['response']
) => {
    const { t, i18n } = useTranslation()
    const isBroker = useIsBroker()

    const columns = useMemo<MRT_ColumnDef<TUserRow>[]>(
        () => [
            {
                accessorKey: 'username',
                header: t('common.field.username'),
                Cell: ({ cell }) => <UsernameColumnEntity user={cell.row.original} />,
                columnFilterModeOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
                enableColumnFilterModes: true,
                enableColumnFilter: true,
                // This filter is the list's search box.
                mantineFilterTextInputProps: {
                    leftSection: <TbSearch size={18} />,
                    placeholder: t('user-table.search'),
                    size: 'md'
                }
            },
            {
                accessorKey: 'id',
                header: t('use-table-columns.id'),
                enableColumnFilterModes: false,
                accessorFn: (originalRow) => originalRow.id
            },
            {
                accessorKey: 'status',
                header: t('common.field.status'),
                Cell: ({ cell }) => <StatusColumnEntity need="badge" user={cell.row.original} />,
                filterVariant: 'select',
                enableColumnFilterModes: false,
                enableSorting: false
            },
            {
                accessorKey: 'nodeName',
                header: t('use-table-columns.last-connected-node'),
                Cell: ({ cell }) => (
                    <ConnectedNodeColumnEntity
                        node={nodes?.find(
                            (node) =>
                                node.uuid === cell.row.original.userTraffic.lastConnectedNodeUuid
                        )}
                    />
                ),
                filterVariant: 'select',
                mantineFilterSelectProps: {
                    comboboxProps: {
                        transitionProps: { transition: 'fade', duration: 200 },
                        width: 'fit-content'
                    },
                    checkIconPosition: 'left',
                    clearSectionMode: 'clear',
                    data:
                        nodes?.map((node) => ({
                            label: node.name,
                            value: node.uuid,
                            countryCode: node.countryCode
                        })) ?? [],
                    renderOption: (item) => {
                        const option = item.option as NodeSelectItemProps
                        return <NodeSelectItem {...option} />
                    }
                },
                enableSorting: false,
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'expireAt',
                header: t('use-table-columns.expire-at'),
                Cell: ({ cell }) => <StatusColumnEntity need="date" user={cell.row.original} />,
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'usedTrafficBytes',
                header: t('use-table-columns.data-usage'),
                Cell: ({ cell }) => <DataUsageColumnEntity user={cell.row.original} />,
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            // The usage bar shows these two; the columns stay for sorting and the limit filter.
            {
                accessorKey: 'usedTrafficPercentage',
                header: t('use-table-columns.used-traffic'),
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'trafficLimitBytes',
                header: t('traffic-limits-card.traffic-limit'),
                filterVariant: 'range',
                Filter: ({ column, rangeFilterIndex }) =>
                    rangeFilterIndex === 0 ? <TrafficLimitRangeFilter column={column} /> : null,
                enableColumnFilterModes: false,
                enableColumnFilter: true
            },
            {
                accessorKey: 'tag',
                header: t('common.field.tag'),
                Cell: ({ cell }) =>
                    cell.row.original.tag ? (
                        <Badge
                            color="gray"
                            leftSection={<TbTag size={12} />}
                            tt="none"
                            variant="soft"
                        >
                            {cell.row.original.tag}
                        </Badge>
                    ) : null,
                columnFilterModeOptions: ['equals'],
                enableColumnFilterModes: false,
                enableColumnFilter: true,
                filterVariant: 'multi-select',
                mantineFilterSelectProps: {
                    comboboxProps: {
                        transitionProps: { transition: 'fade', duration: 200 },
                        width: 'fit-content'
                    },
                    checkIconPosition: 'left'
                }
            },
            {
                accessorKey: 'activeInternalSquads',
                header: t('use-table-columns.internal-squads'),
                filterVariant: 'select',
                enableColumnFilterModes: false,
                enableSorting: false,
                mantineFilterSelectProps: {
                    clearSectionMode: 'clear',
                    comboboxProps: {
                        width: 'fit-content'
                    },
                    data:
                        internalSquads?.internalSquads.map((squad) => ({
                            label: squad.name,
                            value: squad.uuid,
                            membersCount: squad.info?.membersCount
                        })) ?? [],
                    renderOption: renderSelectOption
                },
                Cell: ({ cell }) => {
                    const squads = cell.row.original.activeInternalSquads

                    if (squads.length === 0) {
                        return '–'
                    }

                    return (
                        <Group gap={4}>
                            {squads.map((squad) => (
                                <Badge color="gray" key={squad.uuid} tt="none" variant="soft">
                                    {squad.name}
                                </Badge>
                            ))}
                        </Group>
                    )
                }
            },
            {
                accessorKey: 'externalSquadUuid',
                header: t('constants.external-squads'),
                filterVariant: 'select',
                enableColumnFilterModes: false,
                enableSorting: false,
                mantineFilterSelectProps: {
                    limit: 100,
                    data:
                        externalSquads?.externalSquads.map((squad) => ({
                            label: squad.name,
                            value: squad.uuid
                        })) ?? []
                },
                Cell: ({ cell }) =>
                    externalSquads?.externalSquads.find(
                        (squad) => cell.row.original.externalSquadUuid === squad.uuid
                    )?.name || '–'
            },
            {
                accessorKey: 'trafficLimitStrategy',
                header: t('detailed-user-info-drawer.widget.traffic-limit-strategy'),
                Cell: ({ cell }) =>
                    resetDataStrategy(t).find(
                        ({ value }) => value === cell.row.original.trafficLimitStrategy
                    )?.label ?? cell.row.original.trafficLimitStrategy,
                enableColumnFilter: false,
                enableColumnFilterModes: false,
                enableSorting: false
            },
            {
                accessorKey: 'hwidDeviceLimit',
                header: t('use-table-columns.hwid-device-limit'),
                accessorFn: (originalRow) => originalRow.hwidDeviceLimit ?? '–',
                columnFilterModeOptions: [
                    'equals',
                    'greaterThan',
                    'greaterThanOrEqualTo',
                    'lessThan',
                    'lessThanOrEqualTo',
                    'between'
                ],
                enableColumnFilterModes: true,
                enableColumnFilter: true,
                mantineFilterInputProps: {
                    type: 'number',
                    min: 0,
                    max: 9_999
                }
            },
            {
                accessorKey: 'ipLimit',
                header: t('use-table-columns.ip-limit'),
                accessorFn: (originalRow) => originalRow.ipLimit ?? '–',
                enableColumnFilter: false,
                enableColumnFilterModes: false,
                enableSorting: false
            },
            {
                accessorKey: 'userTraffic.lifetimeUsedTrafficBytes',
                header: t('use-table-columns.lifetime-used'),
                accessorFn: (originalRow) =>
                    originalRow.userTraffic && originalRow.userTraffic.lifetimeUsedTrafficBytes
                        ? prettifyBytesUtil(originalRow.userTraffic.lifetimeUsedTrafficBytes)
                        : '–',
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'telegramId',
                header: t('use-table-columns.telegram-id'),
                accessorFn: (originalRow) => originalRow.telegramId || '–',
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'email',
                header: t('use-table-columns.email'),
                accessorFn: (originalRow) => originalRow.email || '–',
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'userTraffic.onlineAt',
                header: t('use-table-columns.online-at'),
                accessorFn: (originalRow) =>
                    originalRow.userTraffic && originalRow.userTraffic.onlineAt
                        ? formatTimeUtil({
                              time: originalRow.userTraffic.onlineAt,
                              template: 'TIME_FIRST_DATETIME',
                              language: i18n.language
                          })
                        : t('use-table-columns.never'),
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'userTraffic.firstConnectedAt',
                header: t('common.field.first-connected-at'),
                accessorFn: (originalRow) => {
                    if (originalRow.userTraffic && originalRow.userTraffic.firstConnectedAt) {
                        return formatTimeUtil({
                            time: originalRow.userTraffic.firstConnectedAt,
                            template: 'TIME_FIRST_DATETIME',
                            language: i18n.language
                        })
                    }
                    return '–'
                },
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'lastTrafficResetAt',
                header: t('use-table-columns.traffic-reset'),
                accessorFn: (originalRow) =>
                    originalRow.lastTrafficResetAt
                        ? formatTimeUtil({
                              time: originalRow.lastTrafficResetAt,
                              template: 'TIME_FIRST_DATETIME',
                              language: i18n.language
                          })
                        : t('use-table-columns.never'),
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'createdAt',
                header: t('use-table-columns.created-at'),
                accessorFn: (originalRow) =>
                    formatTimeUtil({
                        time: originalRow.createdAt,
                        template: 'TIME_FIRST_DATETIME',
                        language: i18n.language
                    }),
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'subRevokedAt',
                header: t('use-table-columns.sub-link-revoked-at'),
                accessorFn: (originalRow) =>
                    originalRow.subRevokedAt
                        ? formatTimeUtil({
                              time: originalRow.subRevokedAt,
                              template: 'TIME_FIRST_DATETIME',
                              language: i18n.language
                          })
                        : t('use-table-columns.never'),
                enableColumnFilterModes: false,
                enableColumnFilter: false
            },
            {
                accessorKey: 'shortUuid',
                header: t('use-table-columns.sub-link'),
                accessorFn: (originalRow) => originalRow.shortUuid,
                // Filters and sorts on the short ID, shows the whole link it stands for.
                Cell: ({ cell }) => cell.row.original.subscriptionUrl,
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'vlessUuid',
                header: t('use-table-columns.vless-uuid'),
                accessorFn: (originalRow) => originalRow.vlessUuid,
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'trojanPassword',
                header: t('use-table-columns.trojan-password'),
                accessorFn: (originalRow) => originalRow.trojanPassword,
                enableColumnFilterModes: false
            },
            {
                accessorKey: 'description',
                header: t('common.field.description'),
                accessorFn: (originalRow) => originalRow.description || '–',
                enableColumnFilterModes: false
            }
        ],
        [t, nodes, internalSquads, externalSquads, i18n.language]
    )

    return useMemo(() => {
        if (isBroker) {
            return columns.filter(({ accessorKey }) => accessorKey !== 'nodeName')
        }

        const brokerColumn: MRT_ColumnDef<TUserRow> = {
            accessorKey: 'brokerUuid',
            header: t('brokers.broker'),
            filterVariant: 'select',
            enableColumnFilterModes: false,
            enableSorting: false,
            mantineFilterSelectProps: {
                limit: 100,
                data:
                    brokers?.brokers.map((broker) => ({
                        label: broker.username,
                        value: broker.uuid
                    })) ?? []
            },
            Cell: ({ cell }) => {
                const broker = brokers?.brokers.find(
                    ({ uuid }) => uuid === cell.row.original.brokerUuid
                )

                return broker ? (
                    <Badge
                        color="gray"
                        leftSection={<PiHandshake size={12} />}
                        tt="none"
                        variant="soft"
                    >
                        {broker.username}
                    </Badge>
                ) : null
            }
        }

        return [...columns.slice(0, 3), brokerColumn, ...columns.slice(3)]
    }, [columns, brokers, isBroker, t])
}

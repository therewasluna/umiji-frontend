import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { ActionIcon, Group, NativeSelect, SimpleGrid, Stack } from '@mantine/core'
import { DatePickerInput, DatesRangeValue } from '@mantine/dates'
import { UserUsageBarchartWidget } from '@widgets/dashboard/users/user-usage-statistic/usage-barchart'
import { UserUsageSparklineCardWidget } from '@widgets/dashboard/users/user-usage-statistic/usage-sparkline-card'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCalendar, TbChartArcs, TbRefresh, TbServer2 } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useNiceMantineModal } from '@shared/_modals/use-nice-modal'
import { useGetStatsUserUsage } from '@shared/api/hooks'
import { CompoundDrawerShared } from '@shared/ui/compound-drawer/compound-drawer.shared'
import { CountryFlag } from '@shared/ui/get-country-flag'
import { TopLeaderboardCardShared } from '@shared/ui/leaderboard-item-card'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { getDefaultDateRange } from '@shared/utils/time-utils'

const getTopNodesLimitOptions = (t: TFunction) => [
    { value: '5', label: t('user-usage.top-limit', { count: 5 }) },
    { value: '10', label: t('user-usage.top-limit', { count: 10 }) },
    { value: '20', label: t('user-usage.top-limit', { count: 20 }) },
    { value: '30', label: t('user-usage.top-limit', { count: 30 }) },
    { value: '40', label: t('user-usage.top-limit', { count: 40 }) },
    { value: '50', label: t('user-usage.top-limit', { count: 50 }) },
    { value: '60', label: t('user-usage.top-limit', { count: 60 }) },
    { value: '70', label: t('user-usage.top-limit', { count: 70 }) },
    { value: '80', label: t('user-usage.top-limit', { count: 80 }) },
    { value: '90', label: t('user-usage.top-limit', { count: 90 }) },
    { value: '100', label: t('user-usage.top-limit', { count: 100 }) }
]

const DEFAULT_TOP_NODES_LIMIT = 20

interface IProps {
    userId: number
}

export const UserUsageModal = NiceModal.create((props: IProps) => {
    const { userId } = props
    const { t, i18n } = useTranslation()
    const defaultRange = getDefaultDateRange()

    const modal = useModal()
    const { modalProps } = useNiceMantineModal({
        modal,
        drawer: true
    })

    const [rawRange, setRawRange] = useState<[null | string, null | string]>([
        defaultRange.start,
        defaultRange.end
    ])

    const [queryRange, setQueryRange] = useState<{ end: string; start: string }>(defaultRange)
    const [topNodesLimit, setTopNodesLimit] = useState<string>(String(DEFAULT_TOP_NODES_LIMIT))

    const handleDateRangeChange = (value: DatesRangeValue<string>) => {
        if (value[0] === null && value[1] === null) {
            setRawRange([defaultRange.start, defaultRange.end])
            setQueryRange(defaultRange)
            return
        }

        setRawRange(value)
        if (!value[0] || !value[1]) return

        const startDate = value[0]
        const endDate = value[1]

        if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) return

        const startISO = dayjs(startDate).format('YYYY-MM-DD')
        const endISO = dayjs(endDate).format('YYYY-MM-DD')

        setQueryRange({ start: startISO, end: endISO })
    }

    const {
        data: userUsageStats,
        isLoading,
        refetch,
        isRefetching
    } = useGetStatsUserUsage({
        route: {
            userId: userId
        },
        query: {
            start: queryRange.start,
            end: queryRange.end,
            topNodesLimit: Number(topNodesLimit)
        },
        rQueryParams: {
            enabled: Boolean(queryRange.start && queryRange.end)
        }
    })

    const handleNodeClick = (nodeUuid: string) => {
        showModal('nodes_editNodeModal', { nodeUuid })
    }

    return (
        <CompoundDrawerShared
            drawerProps={{
                ...modalProps,
                position: 'right',
                size: '900px'
            }}
            buttons={
                <ActionIcon
                    onClick={() => refetch()}
                    size="lg"
                    variant="soft"
                    loading={isRefetching || isLoading}
                >
                    <TbRefresh size="20px" />
                </ActionIcon>
            }
            title={
                <BaseOverlayHeader
                    iconColor="teal"
                    IconComponent={TbChartArcs}
                    iconVariant="soft"
                    title={t('common.field.usage-stats')}
                />
            }
        >
            <Stack gap="md">
                <Group gap="xs" justify="space-between" wrap="nowrap">
                    <NativeSelect
                        data={getTopNodesLimitOptions(t)}
                        leftSection={<TbServer2 size="20px" />}
                        onChange={(value) => setTopNodesLimit(value.currentTarget.value)}
                        size="md"
                        value={topNodesLimit}
                        miw="fit-content"
                    />
                    <DatePickerInput
                        allowSingleDateInRange
                        dropdownType="modal"
                        headerControlsOrder={['previous', 'next', 'level']}
                        leftSection={<TbCalendar size="20px" />}
                        locale={i18n.language}
                        maxDate={new Date()}
                        onChange={handleDateRangeChange}
                        presets={[
                            {
                                label: t('statistic-nodes.component.current-month'),
                                value: [
                                    dayjs().startOf('month').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.3-days'),
                                value: [
                                    dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.7-days'),
                                value: [
                                    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.14-days'),
                                value: [
                                    dayjs().subtract(13, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.30-days'),
                                value: [
                                    dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.60-days'),
                                value: [
                                    dayjs().subtract(59, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.90-days'),
                                value: [
                                    dayjs().subtract(89, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            },
                            {
                                label: t('statistic-nodes.component.180-days'),
                                value: [
                                    dayjs().subtract(179, 'day').format('YYYY-MM-DD'),
                                    dayjs().format('YYYY-MM-DD')
                                ]
                            }
                        ]}
                        size="md"
                        miw={0}
                        styles={{
                            calendarHeaderLevel: {
                                justifyContent: 'flex-end'
                            },
                            presetsList: {
                                justifyContent: 'center'
                            },
                            input: {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }}
                        type="range"
                        value={rawRange}
                        valueFormat="DD MMM, YYYY"
                    />
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <UserUsageSparklineCardWidget
                        isLoading={isLoading}
                        sparklineData={userUsageStats?.sparklineData}
                    />

                    <TopLeaderboardCardShared
                        emptyText={t('common.message.no-data-available')}
                        isLoading={isLoading}
                        onItemClick={(node) => handleNodeClick(node.uuid)}
                        items={userUsageStats?.topNodes?.map((node) => ({
                            color: node.color,
                            countryCode: node.countryCode,
                            name: node.name,
                            total: node.total,
                            uuid: node.uuid
                        }))}
                        maxHeight={230}
                        renderCountryFlag={(item) => <CountryFlag countryCode={item.countryCode} />}
                    />
                </SimpleGrid>

                <UserUsageBarchartWidget
                    categories={userUsageStats?.categories}
                    isLoading={isLoading}
                    series={userUsageStats?.series}
                />
            </Stack>
        </CompoundDrawerShared>
    )
})

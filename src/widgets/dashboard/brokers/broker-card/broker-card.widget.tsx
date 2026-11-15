import { Badge, CopyButton, Group, Menu, Tooltip } from '@mantine/core'
import { GetBrokersCommand } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { PiCheck, PiCopy, PiHandshake, PiPencil, PiTrashDuotone, PiUsers } from 'react-icons/pi'
import { TbCalendar, TbChartDonut, TbRestore, TbUsers, TbWebhook } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { EntityCardShared } from '@shared/ui/entity-card'
import {
    BROKER_STATE_COLOR,
    getBrokerStateUtil,
    getUsageColorUtil,
    getUsagePercentUtil
} from '@shared/utils/brokers'
import { prettifyBytesUtil } from '@shared/utils/bytes'

interface IProps {
    broker: GetBrokersCommand.Response['response']['brokers'][number]
    handleDelete: (uuid: string, username: string) => void
    handleResetUsage: (uuid: string, username: string) => void
    handleViewUsers: (uuid: string) => void
}

export function BrokerCardWidget(props: IProps) {
    const { broker, handleDelete, handleResetUsage, handleViewUsers } = props

    const { t } = useTranslation()

    const state = getBrokerStateUtil(broker)
    const isUnlimited = broker.trafficLimitBytes === 0
    const percent = getUsagePercentUtil(broker.usedTrafficBytes, broker.trafficLimitBytes)

    const openEditor = () => showModal('brokers_brokerFormModal', { broker })

    return (
        <EntityCardShared.Root isActive={state === 'active'} onClick={openEditor}>
            <EntityCardShared.Header>
                <EntityCardShared.Icon highlight={state === 'active'}>
                    <PiHandshake size={20} />
                </EntityCardShared.Icon>
                <EntityCardShared.Content
                    badges={
                        <Group gap="xs" style={{ rowGap: 2 }}>
                            <Badge color={BROKER_STATE_COLOR[state]} size="lg" variant="soft">
                                {t(`brokers.status-${state}`)}
                            </Badge>

                            <Tooltip label={t('brokers.traffic-quota')}>
                                <Badge
                                    color={isUnlimited ? 'gray' : getUsageColorUtil(percent)}
                                    leftSection={<TbChartDonut size={12} />}
                                    size="lg"
                                    variant="soft"
                                >
                                    {prettifyBytesUtil(broker.usedTrafficBytes, true)} /{' '}
                                    {isUnlimited
                                        ? '∞'
                                        : prettifyBytesUtil(broker.trafficLimitBytes)}
                                </Badge>
                            </Tooltip>

                            <Tooltip label={t('brokers.users')}>
                                <Badge
                                    color="blue"
                                    leftSection={<PiUsers size={12} />}
                                    size="lg"
                                    variant="soft"
                                >
                                    {broker.usersLimit
                                        ? `${broker.usersCount} / ${broker.usersLimit}`
                                        : broker.usersCount}
                                </Badge>
                            </Tooltip>

                            <Tooltip label={t('brokers.expire-at')}>
                                <Badge
                                    color={state === 'expired' ? 'red' : 'gray'}
                                    leftSection={<TbCalendar size={12} />}
                                    size="lg"
                                    variant="soft"
                                    visibleFrom="sm"
                                >
                                    {broker.expireAt
                                        ? dayjs(broker.expireAt).format('DD.MM.YYYY')
                                        : t('brokers.never-expires')}
                                </Badge>
                            </Tooltip>
                        </Group>
                    }
                    title={broker.username}
                />
            </EntityCardShared.Header>

            <EntityCardShared.Actions>
                <EntityCardShared.Menu>
                    <Menu.Item leftSection={<PiPencil size={18} />} onClick={openEditor}>
                        {t('common.action.edit')}
                    </Menu.Item>

                    <Menu.Item
                        leftSection={<TbUsers size={18} />}
                        onClick={() => handleViewUsers(broker.uuid)}
                    >
                        {t('brokers.view-users')}
                    </Menu.Item>

                    <Menu.Item
                        disabled={!broker.externalSquad}
                        leftSection={<TbWebhook size={18} />}
                        onClick={() =>
                            broker.externalSquad &&
                            showModal('externalSquads_externalSquadsDrawer', {
                                uuid: broker.externalSquad.uuid
                            })
                        }
                    >
                        {t('brokers.external-squad')}
                    </Menu.Item>

                    <Menu.Item
                        color="orange"
                        disabled={broker.usedTrafficBytes === 0}
                        leftSection={<TbRestore size={18} />}
                        onClick={() => handleResetUsage(broker.uuid, broker.username)}
                    >
                        {t('brokers.reset-usage')}
                    </Menu.Item>

                    <CopyButton timeout={2000} value={broker.uuid}>
                        {({ copied, copy }) => (
                            <Menu.Item
                                color={copied ? 'teal' : undefined}
                                leftSection={copied ? <PiCheck size={18} /> : <PiCopy size={18} />}
                                onClick={copy}
                            >
                                {t('common.action.copy-uuid')}
                            </Menu.Item>
                        )}
                    </CopyButton>

                    <Menu.Divider />

                    <Menu.Item
                        color="red"
                        leftSection={<PiTrashDuotone size={18} />}
                        onClick={() => handleDelete(broker.uuid, broker.username)}
                    >
                        {t('common.action.delete')}
                    </Menu.Item>
                </EntityCardShared.Menu>
            </EntityCardShared.Actions>
        </EntityCardShared.Root>
    )
}

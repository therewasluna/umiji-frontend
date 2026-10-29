import { Button, Center, Stack, Text, ThemeIcon } from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetBrokersCommand } from '@umiji/backend-contract'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { PiHandshake } from 'react-icons/pi'
import { TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { QueryKeys, useDeleteBroker, useResetBrokerTraffic } from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'
import { ROUTES } from '@shared/constants'

import { useUsersTableStore } from '@entities/dashboard/users/users-table-store'

import { BrokerCardWidget } from '../broker-card/broker-card.widget'

interface IProps {
    brokers: GetBrokersCommand.Response['response']['brokers']
}

const refetchBrokers = () =>
    queryClient.refetchQueries({ queryKey: QueryKeys.brokers.getBrokers.queryKey })

export function BrokersListWidget(props: IProps) {
    const { brokers } = props

    const { t } = useTranslation()
    const navigate = useNavigate()

    const { mutate: deleteBroker } = useDeleteBroker({
        mutationFns: { onSuccess: refetchBrokers }
    })
    const { mutate: resetBrokerTraffic } = useResetBrokerTraffic({
        mutationFns: { onSuccess: refetchBrokers }
    })

    const handleDelete = (uuid: string, username: string) => {
        modals.openConfirmModal({
            title: t('common.action.confirm-action'),
            children: t('brokers.delete-description', { username }),
            labels: { confirm: t('common.action.delete'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm: () => deleteBroker({ route: { uuid } })
        })
    }

    const handleResetUsage = (uuid: string, username: string) => {
        modals.openConfirmModal({
            title: t('brokers.reset-usage'),
            children: t('brokers.reset-usage-description', { username }),
            labels: { confirm: t('common.action.reset'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'orange', variant: 'soft' },
            centered: true,
            onConfirm: () => resetBrokerTraffic({ route: { uuid } })
        })
    }

    const handleViewUsers = (uuid: string) => {
        const { actions } = useUsersTableStore.getState()
        actions.setColumnFilter([{ id: 'brokerUuid', value: uuid }])
        actions.setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
        navigate(ROUTES.DASHBOARD.MANAGEMENT.USERS)
    }

    if (brokers.length === 0) {
        return (
            <Center py={80}>
                <Stack align="center" gap="sm" maw={420}>
                    <ThemeIcon color="teal" radius="xl" size={64} variant="soft">
                        <PiHandshake size={32} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                        {t('brokers.no-brokers')}
                    </Text>
                    <Text c="dimmed" size="sm" ta="center">
                        {t('brokers.no-brokers-description')}
                    </Text>
                    <Button
                        color="teal"
                        leftSection={<TbPlus size={18} />}
                        mt="xs"
                        onClick={() => showModal('brokers_brokerFormModal', {})}
                        variant="soft"
                    >
                        {t('brokers.create-broker')}
                    </Button>
                </Stack>
            </Center>
        )
    }

    return (
        <Stack data-drag-handle="hidden" gap="xs">
            {brokers.map((broker, index) => (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 6 }}
                    key={broker.uuid}
                    transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.03 }}
                >
                    <BrokerCardWidget
                        broker={broker}
                        handleDelete={handleDelete}
                        handleResetUsage={handleResetUsage}
                        handleViewUsers={handleViewUsers}
                    />
                </motion.div>
            ))}
        </Stack>
    )
}

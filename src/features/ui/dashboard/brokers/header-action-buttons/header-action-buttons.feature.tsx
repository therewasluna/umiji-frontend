import { ActionIcon, ActionIconGroup, Button, Group, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbPlus, TbRefresh } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetBrokers } from '@shared/api/hooks'

export const BrokersHeaderActionButtonsFeature = () => {
    const { t } = useTranslation()

    const { isFetching, refetch } = useGetBrokers()

    return (
        <Group grow preventGrowOverflow={false} wrap="wrap">
            <ActionIconGroup>
                <Tooltip label={t('brokers.refresh-brokers')} withArrow>
                    <ActionIcon
                        aria-label={t('brokers.refresh-brokers')}
                        loading={isFetching}
                        onClick={() => refetch()}
                        size="input-md"
                        variant="soft"
                    >
                        <TbRefresh size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <Button
                leftSection={<TbPlus size={18} />}
                onClick={() => showModal('brokers_brokerFormModal', {})}
                size="md"
                variant="filled"
            >
                {t('brokers.create-broker')}
            </Button>
        </Group>
    )
}

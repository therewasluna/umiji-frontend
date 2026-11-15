import { ActionIcon, ActionIconGroup, Button, Group, Tooltip } from '@mantine/core'
import { TSubscriptionTemplateType } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbPlus, TbRefresh } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { queryClient } from '@shared/api'
import { QueryKeys, useGetSubscriptionTemplates } from '@shared/api/hooks'
import { UniversalSpotlightActionIconShared } from '@shared/ui/universal-spotlight'

interface IProps {
    templateType: TSubscriptionTemplateType
}

export const TemplatesHeaderActionButtonsFeature = (props: IProps) => {
    const { templateType } = props
    const { t } = useTranslation()

    const navigate = useNavigate()

    const { isFetching } = useGetSubscriptionTemplates()

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.subscriptionTemplate.getSubscriptionTemplates.queryKey
        })
    }

    return (
        <Group grow preventGrowOverflow={false} wrap="wrap">
            <UniversalSpotlightActionIconShared />

            <ActionIconGroup>
                <Tooltip label={t('header-action-buttons.feature.update-templates')} withArrow>
                    <ActionIcon
                        loading={isFetching}
                        onClick={handleUpdate}
                        size="input-md"
                        variant="soft"
                    >
                        <TbRefresh size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <Button
                onClick={() =>
                    showModal('createModal', {
                        createFrom: 'template',
                        contentOptions: { templateType, navigate }
                    })
                }
                leftSection={<TbPlus size={18} />}
                size="md"
                variant="filled"
            >
                {t('common.action.create')}
            </Button>
        </Group>
    )
}

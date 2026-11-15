import { ActionIcon, ActionIconGroup, Button, Group, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbBook, TbList, TbPlus, TbRefresh, TbTerminal } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { queryClient } from '@shared/api'
import { QueryKeys, useGetNodePlugins } from '@shared/api/hooks'
import { UniversalSpotlightActionIconShared } from '@shared/ui/universal-spotlight'

export const NodePluginsHeaderActionButtonsFeature = () => {
    const { t } = useTranslation()

    const { isFetching } = useGetNodePlugins()
    const navigate = useNavigate()

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.nodePlugins.getNodePlugins.queryKey
        })
    }

    return (
        <Group grow preventGrowOverflow={false} wrap="wrap">
            <ActionIcon
                color="lime"
                component="a"
                href="https://github.com/therewasluna/umiji"
                size="input-md"
                target="_blank"
                variant="soft"
            >
                <TbBook size={24} />
            </ActionIcon>

            <UniversalSpotlightActionIconShared />

            <ActionIconGroup>
                <Tooltip label={t('common.field.shared-lists')} withArrow>
                    <ActionIcon
                        color="indigo"
                        onClick={() => showModal('sharedLists_sharedListsModal')}
                        size="input-md"
                        variant="soft"
                    >
                        <TbList size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <ActionIconGroup>
                <Tooltip label={t('header-action-buttons.executor')} withArrow>
                    <ActionIcon
                        color="grape"
                        onClick={() => showModal('nodePlugins_nodePluginExecutorDrawer')}
                        size="input-md"
                        variant="soft"
                    >
                        <TbTerminal size="24px" />
                    </ActionIcon>
                </Tooltip>
            </ActionIconGroup>

            <ActionIconGroup>
                <Tooltip label={t('common.action.refresh')} withArrow>
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
                leftSection={<TbPlus size={18} />}
                onClick={() =>
                    showModal('createModal', {
                        createFrom: 'nodePlugin',
                        contentOptions: {
                            navigate
                        }
                    })
                }
                size="md"
                variant="filled"
            >
                {t('common.action.create')}
            </Button>
        </Group>
    )
}

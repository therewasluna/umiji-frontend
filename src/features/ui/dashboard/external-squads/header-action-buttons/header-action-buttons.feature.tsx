import { ActionIcon, ActionIconGroup, Button, Group, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbPlus, TbRefresh } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { HelpActionIconShared } from '@shared/_modals/universal'
import { useGetExternalSquads } from '@shared/api/hooks'
import { UniversalSpotlightActionIconShared } from '@shared/ui/universal-spotlight'

interface IProps {
    externalSquadCount: number
}

export const ExternalSquadsHeaderActionButtonsFeature = (props: IProps) => {
    const { externalSquadCount } = props

    const { isFetching, refetch: refetchExternalSquads } = useGetExternalSquads()
    const { t } = useTranslation()

    const handleUpdate = async () => {
        await refetchExternalSquads()
    }

    return (
        <Group grow preventGrowOverflow={false} wrap="wrap">
            <HelpActionIconShared hidden={false} screen="PAGE_EXTERNAL_SQUADS" />

            {externalSquadCount > 0 && <UniversalSpotlightActionIconShared />}

            <ActionIconGroup>
                <Tooltip
                    label={t('header-action-buttons.feature.update-external-squads')}
                    withArrow
                >
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
                        createFrom: 'externalSquad',
                        contentOptions: {}
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

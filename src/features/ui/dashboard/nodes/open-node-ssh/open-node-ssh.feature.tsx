import { ActionIcon, Tooltip } from '@mantine/core'
import { GetNodeCommand } from '@umiji/backend-contract'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbTerminal2 } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'

interface IProps {
    node: GetNodeCommand.Response['response']
}

const OpenNodeSshFeatureComponent = (props: IProps) => {
    const { node } = props
    const { t } = useTranslation()

    return (
        <Tooltip label={t('node-ssh.title')}>
            <ActionIcon
                aria-label={t('node-ssh.title')}
                color="cyan"
                onClick={() => {
                    showModal('nodes_nodeSshTerminal', { node })
                }}
                size="lg"
                variant="soft"
            >
                <TbTerminal2 size="22px" />
            </ActionIcon>
        </Tooltip>
    )
}

export const OpenNodeSshFeature = memo(OpenNodeSshFeatureComponent)

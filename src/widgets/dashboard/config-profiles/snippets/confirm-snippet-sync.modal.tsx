import { TbCode } from 'react-icons/tb'

import { openApplyToNodesModal } from '@shared/_modals/universal'

export const openConfirmSnippetSyncModal = (onConfirm: () => void) => {
    openApplyToNodesModal({
        IconComponent: TbCode,
        delay: 250,
        onApply: onConfirm
    })
}

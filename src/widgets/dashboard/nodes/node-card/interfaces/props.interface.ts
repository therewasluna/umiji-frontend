import { GetNodesCommand } from '@umiji/backend-contract'

export interface IProps {
    disableReordering?: boolean
    handleViewNode: (nodeUuid: string) => void
    index: number
    isDragOverlay?: boolean
    node: GetNodesCommand.Response['response'][number]
    pluginsName: string | undefined
}

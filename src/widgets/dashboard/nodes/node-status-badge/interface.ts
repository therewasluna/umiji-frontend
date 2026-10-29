import { GetNodesCommand } from '@umiji/backend-contract'

export interface IProps {
    fetchedNode?: GetNodesCommand.Response['response'][number] | undefined
    node: GetNodesCommand.Response['response'][number]
    style?: React.CSSProperties
    withText?: boolean
}

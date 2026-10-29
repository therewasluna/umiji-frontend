import { GetNodesCommand } from '@umiji/backend-contract'

export interface IProps {
    node: GetNodesCommand.Response['response'][number] | undefined
}

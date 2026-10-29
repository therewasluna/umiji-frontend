import { GetNodeCommand } from '@umiji/backend-contract'

export interface IProps {
    node: GetNodeCommand.Response['response']
}

import { GetNodeCommand } from '@umiji/backend-contract'

export interface IProps {
    handleClose: () => void
    node: GetNodeCommand.Response['response']
}

import { GetInternalSquadsCommand } from '@umiji/backend-contract'

export interface IProps {
    internalSquads: GetInternalSquadsCommand.Response['response']['internalSquads']
}

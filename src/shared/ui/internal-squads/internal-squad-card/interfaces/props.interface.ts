import { GetInternalSquadsCommand } from '@umiji/backend-contract'

export interface IProps {
    internalSquad: GetInternalSquadsCommand.Response['response']['internalSquads'][number] | null
}

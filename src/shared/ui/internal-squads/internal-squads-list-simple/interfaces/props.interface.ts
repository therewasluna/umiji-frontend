import { GetInternalSquadsCommand } from '@umiji/backend-contract'

export interface IProps {
    filteredInternalSquads: GetInternalSquadsCommand.Response['response']['internalSquads']
}

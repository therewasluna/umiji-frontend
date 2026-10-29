import { GetInternalSquadsCommand } from '@umiji/backend-contract'

export interface Props {
    internalSquads: GetInternalSquadsCommand.Response['response']['internalSquads']
}

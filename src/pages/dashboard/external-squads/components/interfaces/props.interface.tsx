import { GetExternalSquadsCommand } from '@umiji/backend-contract'

export interface Props {
    externalSquads: GetExternalSquadsCommand.Response['response']['externalSquads']
}

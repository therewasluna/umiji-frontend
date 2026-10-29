import { GetExternalSquadsCommand } from '@umiji/backend-contract'

export interface IProps {
    externalSquads: GetExternalSquadsCommand.Response['response']['externalSquads']
}

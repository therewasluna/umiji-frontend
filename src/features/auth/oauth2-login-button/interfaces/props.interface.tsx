import { GetStatusCommand } from '@umiji/backend-contract'

export interface IProps {
    authentication: NonNullable<GetStatusCommand.Response['response']['authentication']>
}

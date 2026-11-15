import { MRT_TableInstance } from '@kastov/mantine-react-table-open'
/* eslint-disable camelcase */
import { GetUsersCommand } from '@umiji/backend-contract'

export interface IProps {
    refetch: () => void

    table: MRT_TableInstance<GetUsersCommand.Response['response']['users'][0]>
}

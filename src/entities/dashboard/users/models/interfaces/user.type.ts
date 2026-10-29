import { GetUsersCommand } from '@umiji/backend-contract'

export type User = GetUsersCommand.Response['response']['users'][number]

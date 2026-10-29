import { GetSnippetsCommand } from '@umiji/backend-contract'

export type TSnippet = GetSnippetsCommand.Response['response']['snippets'][number]

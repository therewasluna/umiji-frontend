import { GetConfigProfileByUuidCommand, GetSnippetsCommand } from '@umiji/backend-contract'

export interface IProps {
    configProfile: GetConfigProfileByUuidCommand.Response['response']
    isWasmCrashed: boolean
    isWasmRestarting: boolean
    onRestartWasm: () => void
    snippets: GetSnippetsCommand.Response['response']
}

import { GetSubpageConfigsCommand } from '@umiji/backend-contract'

export interface IProps {
    configs: GetSubpageConfigsCommand.Response['response']['configs']
}

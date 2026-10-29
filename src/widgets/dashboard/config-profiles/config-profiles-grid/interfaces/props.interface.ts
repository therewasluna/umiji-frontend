import { GetConfigProfilesCommand } from '@umiji/backend-contract'

export interface IProps {
    configProfiles: GetConfigProfilesCommand.Response['response']['configProfiles']
}

import { GetConfigProfilesCommand } from '@umiji/backend-contract'

export interface Props {
    configProfiles: GetConfigProfilesCommand.Response['response']['configProfiles']
}

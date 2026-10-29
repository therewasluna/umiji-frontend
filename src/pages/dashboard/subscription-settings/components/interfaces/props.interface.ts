import { GetSubscriptionSettingsCommand } from '@umiji/backend-contract'

export interface IProps {
    subscriptionSettings: GetSubscriptionSettingsCommand.Response['response']
}

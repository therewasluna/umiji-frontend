import {
    GetSubscriptionTemplatesCommand,
    TSubscriptionTemplateType
} from '@umiji/backend-contract'

export interface IProps {
    templates: GetSubscriptionTemplatesCommand.Response['response']['templates']
    type: TSubscriptionTemplateType
}

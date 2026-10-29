import { SUBSCRIPTION_TEMPLATE_TYPE, TSubscriptionTemplateType } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useGetSubscriptionTemplates } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { LoadingScreen } from '@shared/ui'

import { TemplateBasePageComponent } from '../components/template-base-page.component'

export function TemplateBasePageConnector() {
    const { t } = useTranslation()

    const { type } = useParams()
    const navigate = useNavigate()

    const { data: templates, isLoading: isTemplatesLoading } = useGetSubscriptionTemplates({})

    if (isTemplatesLoading || !templates) {
        return <LoadingScreen text={t('template-base-page.loading-templates')} />
    }

    let title: string

    switch (type as TSubscriptionTemplateType) {
        case SUBSCRIPTION_TEMPLATE_TYPE.CLASH:
            title = 'Clash'
            break
        case SUBSCRIPTION_TEMPLATE_TYPE.MIHOMO:
            title = 'Mihomo'
            break
        case SUBSCRIPTION_TEMPLATE_TYPE.SINGBOX:
            title = 'Singbox'
            break
        case SUBSCRIPTION_TEMPLATE_TYPE.STASH:
            title = 'Stash'
            break
        case SUBSCRIPTION_TEMPLATE_TYPE.XRAY_JSON:
            title = 'Xray JSON'
            break
        default:
            navigate(ROUTES.DASHBOARD.HOME, { replace: true })
            return null
    }

    if (!type) {
        navigate(ROUTES.DASHBOARD.HOME, { replace: true })
        return null
    }

    return (
        <TemplateBasePageComponent
            templates={templates.templates.filter((template) => template.templateType === type)}
            title={title}
            type={type as TSubscriptionTemplateType}
        />
    )
}

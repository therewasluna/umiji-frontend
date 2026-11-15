import { Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useGetBrokerMe, useGetSubscriptionPageConfig } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

import { useIsBroker } from '@entities/auth/session-store'

import { SubpageConfigEditorPageComponent } from '../components/subpage-config-editor-page.component'

export function SubpageConfigEditorPageConnector() {
    const { t } = useTranslation()
    const params = useParams()
    const navigate = useNavigate()

    // A broker edits the page of its own external squad, so its route carries no uuid.
    const isBroker = useIsBroker()
    const { data: broker } = useGetBrokerMe({ rQueryParams: { enabled: isBroker } })
    const uuid = isBroker ? broker?.subpageConfigUuid : params.uuid

    const { data: config, isLoading: isConfigLoading } = useGetSubscriptionPageConfig({
        route: {
            uuid: uuid ?? ''
        },
        rQueryParams: {
            enabled: !!uuid
        }
    })

    if (isBroker && broker && !uuid) {
        return (
            <Page title={t('constants.subscription-page')}>
                <PageHeaderShared title={t('constants.subscription-page')} />
                <Text c="dimmed" py="xl" ta="center">
                    {t('brokers.panel.no-subscription-page')}
                </Text>
            </Page>
        )
    }

    if (isConfigLoading || !config) {
        return <LoadingScreen text={t('subpage-config-editor-page.loading-config')} />
    }

    if (!uuid) {
        navigate(ROUTES.DASHBOARD.HOME, { replace: true })
        return null
    }

    return <SubpageConfigEditorPageComponent config={config} />
}

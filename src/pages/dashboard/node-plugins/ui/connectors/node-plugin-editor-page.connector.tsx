import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useGetNodePlugin } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { LoadingScreen } from '@shared/ui'

import { NodePluginEditorPageComponent } from '../components/node-plugin-editor-page.component'

export function NodePluginEditorPageConnector() {
    const { t } = useTranslation()

    const { uuid } = useParams()
    const navigate = useNavigate()

    const { data: plugin, isLoading: isPluginLoading } = useGetNodePlugin({
        route: {
            uuid: uuid as string
        },
        rQueryParams: {
            enabled: !!uuid
        }
    })

    if (!uuid) {
        navigate(ROUTES.DASHBOARD.HOME, { replace: true })
        return null
    }

    if (isPluginLoading || !plugin) {
        return <LoadingScreen text={t('node-plugin-editor-page.loading-plugin')} />
    }

    return <NodePluginEditorPageComponent plugin={plugin} />
}

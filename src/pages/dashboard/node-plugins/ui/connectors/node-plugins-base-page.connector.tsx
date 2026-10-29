import { useTranslation } from 'react-i18next'

import { useGetNodePlugins, useGetNodes } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui'

import { NodePluginsBasePageComponent } from '../components/node-plugins-base-page.component'

export function NodePluginsBasePageConnector() {
    const { t } = useTranslation()

    const { data: plugins, isLoading: isPluginsLoading } = useGetNodePlugins({})
    const { data: nodes, isLoading: isNodesLoading } = useGetNodes()

    if (isPluginsLoading || isNodesLoading || !plugins || !nodes) {
        return <LoadingScreen text={t('node-plugins-base-page.loading-node-plugins')} />
    }

    return <NodePluginsBasePageComponent nodes={nodes} plugins={plugins.nodePlugins} />
}

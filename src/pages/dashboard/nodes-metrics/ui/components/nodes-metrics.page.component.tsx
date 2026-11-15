import { NodeMetricsWidget } from '@widgets/dashboard/nodes/nodes-metrics'
import { useTranslation } from 'react-i18next'

import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

import { IProps } from './interfaces'

export default function NodesMetricsPageComponent(props: IProps) {
    const { t } = useTranslation()
    const { isLoading } = props

    return (
        <Page title={t('constants.nodes-metrics')}>
            <PageHeaderShared
                description={t('page-descriptions.nodes-metrics')}
                title={t('nodes-metrics.metrics-overview')}
            />

            {isLoading ? <LoadingScreen height="80vh" /> : <NodeMetricsWidget />}
        </Page>
    )
}

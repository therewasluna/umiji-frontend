import { useTranslation } from 'react-i18next'

import { useGetSubpageConfigs } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui'

import { SubpageConfigBasePageComponent } from '../components/subpage-config-base-page.component'

export function SubpageConfigBasePageConnector() {
    const { t } = useTranslation()

    const { data: subpageConfigs, isLoading: isSubpageConfigsLoading } = useGetSubpageConfigs({})

    if (isSubpageConfigsLoading || !subpageConfigs) {
        return <LoadingScreen text={t('subpage-config-base-page.loading-subpage-configs')} />
    }

    return <SubpageConfigBasePageComponent configs={subpageConfigs.configs} />
}

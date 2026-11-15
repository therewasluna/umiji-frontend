import { InternalSquadsHeaderActionButtonsFeature } from '@features/ui/dashboard/internal-squads/header-action-buttons'
import { InternalSquadsGridWidget } from '@widgets/dashboard/internal-squads/internal-squads-grid/internal-squads-grid.widget'
import { InternalSquadsSpotlightWidget } from '@widgets/dashboard/internal-squads/internal-squads-spotlight/internal-squads-spotlight'
import { useTranslation } from 'react-i18next'

import { Page } from '@shared/ui/page'
import { PageHeaderShared } from '@shared/ui/page-header/page-header.shared'

import { Props } from './interfaces'

export const InternalSquadsPageComponent = (props: Props) => {
    const { t } = useTranslation()
    const { internalSquads } = props

    return (
        <Page title={t('constants.internal-squads')}>
            <PageHeaderShared
                actions={
                    <InternalSquadsHeaderActionButtonsFeature
                        internalSquadCount={internalSquads.length}
                    />
                }
                description={t('page-descriptions.internal-squads')}
                title={t('constants.internal-squads')}
            />

            <InternalSquadsGridWidget internalSquads={internalSquads} />

            {internalSquads.length > 0 && (
                <InternalSquadsSpotlightWidget internalSquads={internalSquads} />
            )}
        </Page>
    )
}

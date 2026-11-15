import { Container } from '@mantine/core'
import { SubscriptionSettingsTabsWidget } from '@widgets/dashboard/subscription-settings/settings/subscription-tabs.widget'
import { useTranslation } from 'react-i18next'

import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

import { IProps } from './interfaces'

export const SubscriptionSettingsPageComponent = (props: IProps) => {
    const { t } = useTranslation()

    const { subscriptionSettings } = props

    if (!subscriptionSettings) {
        return <LoadingScreen />
    }

    return (
        <Page title={t('constants.subscription-settings')}>
            <PageHeaderShared
                description={t('page-descriptions.subscription-settings')}
                title={t('page-titles.subscription-settings')}
            />

            <Container fluid p={0} size="xl">
                <SubscriptionSettingsTabsWidget subscriptionSettings={subscriptionSettings} />
            </Container>
        </Page>
    )
}

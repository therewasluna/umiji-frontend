import { Container } from '@mantine/core'
import { GetApiTokensCommand, GetUmijiSettingsCommand } from '@umiji/backend-contract'
import { ApiTokensCardWidget } from '@widgets/umiji-settings/api-tokens-card/api-tokens-card.widget'
import { AuthentificationSettingsCardWidget } from '@widgets/umiji-settings/authentification-settings-card/authentification-settings-card.widget'
import { BackendToolsCardWidget } from '@widgets/umiji-settings/backend-tools-card/backend-tools-card.widget'
import { BrandingSettingsCardWidget } from '@widgets/umiji-settings/branding-settings-card/branding-settings-card.widget'
import { ExperimentalSettingsCardWidget } from '@widgets/umiji-settings/experimental-settings-card/experimental-settings-card.widget'
import { useTranslation } from 'react-i18next'
import Masonry from 'react-layout-masonry'

import { LoadingScreen, Logo, Page, PageHeaderShared } from '@shared/ui'

interface IProps {
    apiTokensData: GetApiTokensCommand.Response['response']
    umijiSettings: GetUmijiSettingsCommand.Response['response']
}

export const UmijiSettingsPageComponent = (props: IProps) => {
    const { umijiSettings, apiTokensData } = props

    const { t } = useTranslation()

    if (!umijiSettings || !apiTokensData) {
        return <LoadingScreen />
    }

    if (
        !umijiSettings.oauth2Settings ||
        !umijiSettings.passkeySettings ||
        !umijiSettings.passwordSettings ||
        !umijiSettings.brandingSettings
    ) {
        return <LoadingScreen />
    }

    return (
        <Page title={t('constants.umiji-settings')}>
            <PageHeaderShared icon={<Logo size={24} />} title={t('constants.umiji-settings')} />
            <Container fluid p={0} size="xl">
                <Masonry columns={{ 300: 1, 1400: 2, 2000: 3, 3000: 4 }} gap={16}>
                    <AuthentificationSettingsCardWidget
                        oauth2Settings={umijiSettings.oauth2Settings}
                        passkeySettings={umijiSettings.passkeySettings}
                        passwordSettings={umijiSettings.passwordSettings}
                    />
                    <ApiTokensCardWidget apiTokensData={apiTokensData} />
                    <BackendToolsCardWidget />
                    <BrandingSettingsCardWidget
                        brandingSettings={umijiSettings.brandingSettings}
                    />
                    <ExperimentalSettingsCardWidget />
                </Masonry>
            </Container>
        </Page>
    )
}

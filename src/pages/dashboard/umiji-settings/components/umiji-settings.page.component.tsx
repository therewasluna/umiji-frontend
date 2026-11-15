import { SimpleGrid, Stack } from '@mantine/core'
import { GetApiTokensCommand, GetUmijiSettingsCommand } from '@umiji/backend-contract'
import { ApiTokensCardWidget } from '@widgets/umiji-settings/api-tokens-card/api-tokens-card.widget'
import { AuthentificationSettingsCardWidget } from '@widgets/umiji-settings/authentification-settings-card/authentification-settings-card.widget'
import { BackendToolsCardWidget } from '@widgets/umiji-settings/backend-tools-card/backend-tools-card.widget'
import { BrandingSettingsCardWidget } from '@widgets/umiji-settings/branding-settings-card/branding-settings-card.widget'
import { useTranslation } from 'react-i18next'

import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

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
            <PageHeaderShared
                description={t('page-descriptions.umiji-settings')}
                title={t('constants.umiji-settings')}
            />
            {/* Sign-in on one side (methods and the login page's branding), developer and advanced
                settings on the other: two balanced columns instead of masonry's round-robin. */}
            <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
                <Stack gap="md">
                    <AuthentificationSettingsCardWidget
                        oauth2Settings={umijiSettings.oauth2Settings}
                        passkeySettings={umijiSettings.passkeySettings}
                        passwordSettings={umijiSettings.passwordSettings}
                    />
                    <BrandingSettingsCardWidget brandingSettings={umijiSettings.brandingSettings} />
                </Stack>
                <Stack gap="md">
                    <ApiTokensCardWidget apiTokensData={apiTokensData} />
                    <BackendToolsCardWidget />
                </Stack>
            </SimpleGrid>
        </Page>
    )
}

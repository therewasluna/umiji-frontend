import { useGetApiTokens, useGetUmijiSettings, useGetScopes } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui/loading-screen'

import { UmijiSettingsPageComponent } from '../components'

export const UmijiSettingsConnector = () => {
    const { data: umijiSettings, isLoading: isUmijiSettingsLoading } = useGetUmijiSettings()
    const { data: apiTokensData, isLoading: isApiTokensLoading } = useGetApiTokens()
    const { data: scopes, isLoading: isScopesLoading } = useGetScopes()

    if (
        isUmijiSettingsLoading ||
        isApiTokensLoading ||
        isScopesLoading ||
        !umijiSettings ||
        !apiTokensData ||
        !scopes
    ) {
        return <LoadingScreen />
    }

    return (
        <UmijiSettingsPageComponent apiTokensData={apiTokensData} umijiSettings={umijiSettings} />
    )
}

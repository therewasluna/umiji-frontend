import { HomePage } from '@pages/dashboard/home/components'

import { useGetBandwidthStats, useGetUmijiHealth, useGetSystemStats } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui/loading-screen'

export const HomePageConnector = () => {
    const { data: systemInfo } = useGetSystemStats()
    const { data: bandwidthStats } = useGetBandwidthStats()
    const { data: umijiHealth } = useGetUmijiHealth()

    if (!systemInfo || !bandwidthStats || !umijiHealth) {
        return <LoadingScreen />
    }

    return (
        <HomePage
            bandwidthStats={bandwidthStats}
            umijiHealth={umijiHealth}
            systemInfo={systemInfo}
        />
    )
}

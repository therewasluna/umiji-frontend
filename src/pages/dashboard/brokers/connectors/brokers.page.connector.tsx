import { useGetBrokers } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui'

import { BrokersPageComponent } from '../components/brokers.page.component'

export function BrokersPageConnector() {
    const { data, isLoading } = useGetBrokers()

    if (isLoading || !data) {
        return <LoadingScreen />
    }

    return <BrokersPageComponent brokers={data.brokers} />
}

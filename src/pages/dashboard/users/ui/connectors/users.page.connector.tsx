import { useAssignableSquads, useGetNodes, useGetUserTags } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui'

import { useIsBroker } from '@entities/auth/session-store'

import UsersPageComponent from '../components/users.page.component'

export function UsersPageConnector() {
    const isBroker = useIsBroker()
    const { isLoading: isSquadsLoading } = useAssignableSquads()
    const { isLoading: isNodesLoading } = useGetNodes({ rQueryParams: { enabled: !isBroker } })
    const { isLoading: isTagsLoading } = useGetUserTags()

    if (isSquadsLoading || isNodesLoading || isTagsLoading) {
        return <LoadingScreen />
    }

    return <UsersPageComponent />
}

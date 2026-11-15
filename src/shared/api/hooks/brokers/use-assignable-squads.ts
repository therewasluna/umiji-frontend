import { useMemo } from 'react'

import { useIsBroker } from '@entities/auth/session-store'

import { useGetExternalSquads } from '../external-squads/external-squads.query.hooks'
import { useGetInternalSquads } from '../internal-squads/internal-squads.query.hooks'
import { useGetBrokerMe } from './brokers.query.hooks'

export interface IAssignableInternalSquads {
    internalSquads: {
        inbounds?: { type: string }[]
        info?: { inboundsCount: number; membersCount: number }
        name: string
        uuid: string
    }[]
}

export interface IAssignableExternalSquads {
    externalSquads: { name: string; uuid: string }[]
}

/** Squads the current account may assign to users: all of them for admins, the allowlist for brokers. */
export const useAssignableSquads = () => {
    const isBroker = useIsBroker()

    const internal = useGetInternalSquads({ rQueryParams: { enabled: !isBroker } })
    const external = useGetExternalSquads({ rQueryParams: { enabled: !isBroker } })
    const brokerMe = useGetBrokerMe({ rQueryParams: { enabled: isBroker } })

    // Stable references: consumers initialise forms in effects keyed on these objects.
    const brokerSquads = useMemo(
        () =>
            brokerMe.data && {
                internalSquads: { internalSquads: brokerMe.data.internalSquads },
                // Broker users always get the broker's own squad, so there is nothing to pick.
                externalSquads: { externalSquads: [] }
            },
        [brokerMe.data]
    )

    if (isBroker) {
        return {
            internalSquads: brokerSquads?.internalSquads,
            externalSquads: brokerSquads?.externalSquads,
            isLoading: brokerMe.isLoading
        }
    }

    return {
        internalSquads: internal.data as IAssignableInternalSquads | undefined,
        externalSquads: external.data as IAssignableExternalSquads | undefined,
        isLoading: internal.isLoading || external.isLoading
    }
}

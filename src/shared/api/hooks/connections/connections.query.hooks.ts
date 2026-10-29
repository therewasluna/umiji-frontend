import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
    ConnectionsByUserResultCommand,
    ConnectionsByNodeResultCommand,
    GeocheckByNodeResultCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const connectionsQueryKeys = createQueryKeys('connections', {
    connectionsByUserResult: (route: ConnectionsByUserResultCommand.RequestParam) => ({
        queryKey: [route]
    }),
    connectionsByNodeResult: (route: ConnectionsByNodeResultCommand.RequestParam) => ({
        queryKey: [route]
    }),
    geocheckByNodeResult: (route: GeocheckByNodeResultCommand.RequestParam) => ({
        queryKey: [route]
    })
})

export const useConnectionsByUserResult = createGetQueryHook({
    endpoint: ConnectionsByUserResultCommand.TSQ_url,
    responseSchema: ConnectionsByUserResultCommand.ResponseSchema,
    routeParamsSchema: ConnectionsByUserResultCommand.RequestParamSchema,
    getQueryKey: ({ route, query }) =>
        connectionsQueryKeys.connectionsByUserResult({ ...route!, ...query! }).queryKey,
    rQueryParams: {
        staleTime: sToMs(60)
    },
    errorHandler: (error) => errorHandler(error, t('connections.connections-by-user-result'))
})

export const useConnectionsByNodeResult = createGetQueryHook({
    endpoint: ConnectionsByNodeResultCommand.TSQ_url,
    responseSchema: ConnectionsByNodeResultCommand.ResponseSchema,
    routeParamsSchema: ConnectionsByNodeResultCommand.RequestParamSchema,
    getQueryKey: ({ route, query }) =>
        connectionsQueryKeys.connectionsByNodeResult({ ...route!, ...query! }).queryKey,
    rQueryParams: {
        staleTime: sToMs(60)
    },
    errorHandler: (error) => errorHandler(error, t('connections.connections-by-node-result'))
})

export const useGeocheckByNodeResult = createGetQueryHook({
    endpoint: GeocheckByNodeResultCommand.TSQ_url,
    responseSchema: GeocheckByNodeResultCommand.ResponseSchema,
    routeParamsSchema: GeocheckByNodeResultCommand.RequestParamSchema,
    getQueryKey: ({ route, query }) =>
        connectionsQueryKeys.geocheckByNodeResult({ ...route!, ...query! }).queryKey,
    rQueryParams: {
        staleTime: sToMs(60)
    },
    errorHandler: (error) => errorHandler(error, t('connections.geocheck-by-node-result'))
})

import { createQueryKeys } from '@lukemorales/query-key-factory'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import {
    GetInfraBillingRecordsCommand,
    GetInfraBillingNodesCommand,
    GetInfraProviderCommand,
    GetInfraProvidersCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { instance } from '../../axios'
import { createUrl } from '../../helpers'
import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const infraBillingQueryKeys = createQueryKeys('infraBilling', {
    getInfraProviders: {
        queryKey: null
    },
    getInfraProvider: (route: GetInfraProviderCommand.RequestParam) => ({
        queryKey: [route]
    }),
    getInfraBillingHistoryRecords: (filters: GetInfraBillingRecordsCommand.RequestQuery) => ({
        queryKey: [filters]
    }),
    getInfraBillingNodes: {
        queryKey: null
    }
})

export const useGetInfraProviders = createGetQueryHook({
    endpoint: GetInfraProvidersCommand.TSQ_url,
    responseSchema: GetInfraProvidersCommand.ResponseSchema,
    getQueryKey: () => infraBillingQueryKeys.getInfraProviders.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('infra-billing.get-all-infra-providers'))
})

export const useGetInfraProvider = createGetQueryHook({
    endpoint: GetInfraProviderCommand.TSQ_url,
    responseSchema: GetInfraProviderCommand.ResponseSchema,
    routeParamsSchema: GetInfraProviderCommand.RequestParamSchema,
    getQueryKey: ({ route }) => infraBillingQueryKeys.getInfraProvider(route!).queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30),
        placeholderData: keepPreviousData
    },
    errorHandler: (error) => errorHandler(error, t('infra-billing.get-infra-provider'))
})

export const useGetInfraBillingHistoryRecords = createGetQueryHook({
    endpoint: GetInfraBillingRecordsCommand.TSQ_url,
    responseSchema: GetInfraBillingRecordsCommand.ResponseSchema,
    requestQuerySchema: GetInfraBillingRecordsCommand.RequestQuerySchema,
    getQueryKey: ({ query }) =>
        infraBillingQueryKeys.getInfraBillingHistoryRecords(query!).queryKey,
    rQueryParams: {
        staleTime: sToMs(20),
        refetchInterval: sToMs(60),
        placeholderData: keepPreviousData,
        refetchOnMount: true
    },
    errorHandler: (error) =>
        errorHandler(error, t('infra-billing.get-infra-billing-history-records'))
})

const HISTORY_RECORDS_PAGE_SIZE = 100

export const useGetInfraBillingHistoryRecordsInfinite = (size = HISTORY_RECORDS_PAGE_SIZE) =>
    useInfiniteQuery({
        queryKey: [...infraBillingQueryKeys.getInfraBillingHistoryRecords._def, 'infinite', size],
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            const url = createUrl(GetInfraBillingRecordsCommand.TSQ_url, {
                start: pageParam,
                size
            })

            try {
                const response = await instance.get(url)
                const result = await GetInfraBillingRecordsCommand.ResponseSchema.safeParseAsync(
                    response.data
                )
                if (!result.success) {
                    throw result.error
                }
                return result.data.response
            } catch (error) {
                errorHandler(error, t('infra-billing.get-infra-billing-history-records-infinite'))
                throw error
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.records.length, 0)
            return loaded < lastPage.total ? loaded : undefined
        },
        staleTime: sToMs(20),
        refetchOnMount: true
    })

export const useGetInfraBillingNodes = createGetQueryHook({
    endpoint: GetInfraBillingNodesCommand.TSQ_url,
    responseSchema: GetInfraBillingNodesCommand.ResponseSchema,
    getQueryKey: () => infraBillingQueryKeys.getInfraBillingNodes.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30),
        placeholderData: keepPreviousData
    },
    errorHandler: (error) => errorHandler(error, t('infra-billing.get-all-infra-billing-nodes'))
})

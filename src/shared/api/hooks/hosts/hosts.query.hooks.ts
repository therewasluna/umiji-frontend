import { createQueryKeys } from '@lukemorales/query-key-factory'
import { GetHostCommand, GetHostsCommand, GetHostsTagsCommand } from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const hostsQueryKeys = createQueryKeys('hosts', {
    getAllHosts: {
        queryKey: null
    },
    getAllTags: {
        queryKey: null
    },
    getHost: (route: GetHostCommand.RequestParam) => ({
        queryKey: [route]
    })
})

export const useGetHosts = createGetQueryHook({
    endpoint: GetHostsCommand.TSQ_url,
    responseSchema: GetHostsCommand.ResponseSchema,
    getQueryKey: () => hostsQueryKeys.getAllHosts.queryKey,
    rQueryParams: {
        refetchOnMount: true
    },
    errorHandler: (error) => errorHandler(error, t('hosts.get-all-hosts'))
})

export const useGetHostTags = createGetQueryHook({
    endpoint: GetHostsTagsCommand.TSQ_url,
    responseSchema: GetHostsTagsCommand.ResponseSchema,
    getQueryKey: () => hostsQueryKeys.getAllTags.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(60),
        refetchInterval: sToMs(60),
        placeholderData: false
    },
    errorHandler: (error) => errorHandler(error, t('hosts.get-all-host-tags'))
})

export const useGetHost = createGetQueryHook({
    endpoint: GetHostCommand.TSQ_url,
    responseSchema: GetHostCommand.ResponseSchema,
    routeParamsSchema: GetHostCommand.RequestParamSchema,
    getQueryKey: ({ route }) => hostsQueryKeys.getHost(route!).queryKey,
    rQueryParams: {},
    errorHandler: (error) => errorHandler(error, t('hosts.get-host'))
})

import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
    GetBandwidthStatsCommand,
    GetHttpStatsCommand,
    GetMetadataCommand,
    GetNodesMetricsCommand,
    GetNodesStatisticsCommand,
    GetRecapCommand,
    GetUmijiHealthCommand,
    GetStatsCommand
} from '@umiji/backend-contract'
import { keepPreviousData } from '@tanstack/react-query'
import { t } from 'i18next'

import { getUserTimezoneUtil, sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

const STALE_TIME = 5_000
const REFETCH_INTERVAL = 5_100

export const systemQueryKeys = createQueryKeys('system', {
    getSystemStats: {
        queryKey: null
    },
    getBandwidthStats: {
        queryKey: null
    },
    getNodesStatistics: {
        queryKey: null
    },
    getUmijiHealth: {
        queryKey: null
    },
    getNodesMetrics: {
        queryKey: null
    },
    getUmijiMetadata: {
        queryKey: null
    },
    getRecap: {
        queryKey: null
    },
    getHttpStats: {
        queryKey: null
    }
})

export const useGetSystemStats = createGetQueryHook({
    endpoint: GetStatsCommand.TSQ_url,
    responseSchema: GetStatsCommand.ResponseSchema,
    requestQuerySchema: GetStatsCommand.RequestQuerySchema,
    getQueryKey: () => systemQueryKeys.getSystemStats.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
        refetchInterval: REFETCH_INTERVAL
    },
    queryParams: {
        tz: getUserTimezoneUtil()
    },
    errorHandler: (error) => errorHandler(error, t('system.get-system-stats'))
})

export const useGetBandwidthStats = createGetQueryHook({
    endpoint: GetBandwidthStatsCommand.TSQ_url,
    responseSchema: GetBandwidthStatsCommand.ResponseSchema,
    requestQuerySchema: GetBandwidthStatsCommand.RequestQuerySchema,
    getQueryKey: () => systemQueryKeys.getBandwidthStats.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
        refetchInterval: REFETCH_INTERVAL
    },
    queryParams: {
        tz: getUserTimezoneUtil()
    },
    errorHandler: (error) => errorHandler(error, t('system.get-bandwidth-stats'))
})

export const useGetNodesStatisticsCommand = createGetQueryHook({
    endpoint: GetNodesStatisticsCommand.TSQ_url,
    responseSchema: GetNodesStatisticsCommand.ResponseSchema,
    requestQuerySchema: GetNodesStatisticsCommand.RequestQuerySchema,
    getQueryKey: () => systemQueryKeys.getNodesStatistics.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        staleTime: sToMs(30),
        refetchInterval: sToMs(30)
    },
    queryParams: {
        tz: getUserTimezoneUtil()
    },
    errorHandler: (error) => errorHandler(error, t('system.get-nodes-statistics'))
})

export const useGetUmijiHealth = createGetQueryHook({
    endpoint: GetUmijiHealthCommand.TSQ_url,
    responseSchema: GetUmijiHealthCommand.ResponseSchema,
    getQueryKey: () => systemQueryKeys.getUmijiHealth.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        staleTime: sToMs(10),
        refetchInterval: sToMs(10)
    },
    errorHandler: (error) => errorHandler(error, t('system.get-umiji-health'))
})

export const useGetNodesMetrics = createGetQueryHook({
    endpoint: GetNodesMetricsCommand.TSQ_url,
    responseSchema: GetNodesMetricsCommand.ResponseSchema,
    getQueryKey: () => systemQueryKeys.getNodesMetrics.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        staleTime: sToMs(30),
        refetchInterval: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('system.get-nodes-metrics'))
})

export const useGetUmijiMetadata = createGetQueryHook({
    endpoint: GetMetadataCommand.TSQ_url,
    responseSchema: GetMetadataCommand.ResponseSchema,
    getQueryKey: () => systemQueryKeys.getUmijiMetadata.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: false,
        staleTime: sToMs(3_600)
    },
    errorHandler: (error) => errorHandler(error, t('system.get-umiji-metadata'))
})

export const useGetRecap = createGetQueryHook({
    endpoint: GetRecapCommand.TSQ_url,
    responseSchema: GetRecapCommand.ResponseSchema,
    getQueryKey: () => systemQueryKeys.getRecap.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true,
        staleTime: sToMs(60)
    },
    errorHandler: (error) => errorHandler(error, t('system.get-recap'))
})

export const useGetHttpStats = createGetQueryHook({
    endpoint: GetHttpStatsCommand.TSQ_url,
    responseSchema: GetHttpStatsCommand.ResponseSchema,
    getQueryKey: () => systemQueryKeys.getHttpStats.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true
    },
    errorHandler: (error) => errorHandler(error, t('system.get-http-stats'))
})

import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
    GetBrokerBotBroadcastsCommand,
    GetBrokerBotCommand,
    GetBrokerBotOrdersCommand,
    GetBrokerBotReceiptCommand
} from '@umiji/backend-contract'
import { keepPreviousData } from '@tanstack/react-query'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const brokerBotQueryKeys = createQueryKeys('brokerBot', {
    getBrokerBot: {
        queryKey: null
    },
    getBrokerBotBroadcasts: {
        queryKey: null
    },
    getBrokerBotOrders: (query: GetBrokerBotOrdersCommand.RequestQuery) => ({
        queryKey: [query]
    }),
    getBrokerBotReceipt: (route: GetBrokerBotReceiptCommand.RequestParam) => ({
        queryKey: [route]
    })
})

export const useGetBrokerBot = createGetQueryHook({
    endpoint: GetBrokerBotCommand.TSQ_url,
    responseSchema: GetBrokerBotCommand.ResponseSchema,
    getQueryKey: () => brokerBotQueryKeys.getBrokerBot.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        refetchInterval: sToMs(15),
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('broker-bot.get-telegram-bot'))
})

export const useGetBrokerBotOrders = createGetQueryHook({
    endpoint: GetBrokerBotOrdersCommand.TSQ_url,
    responseSchema: GetBrokerBotOrdersCommand.ResponseSchema,
    requestQuerySchema: GetBrokerBotOrdersCommand.RequestQuerySchema,
    getQueryKey: ({ query }) => brokerBotQueryKeys.getBrokerBotOrders(query!).queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true,
        refetchInterval: sToMs(15),
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('broker-bot.get-telegram-orders'))
})

export const useGetBrokerBotReceipt = createGetQueryHook({
    endpoint: GetBrokerBotReceiptCommand.TSQ_url,
    responseSchema: GetBrokerBotReceiptCommand.ResponseSchema,
    routeParamsSchema: GetBrokerBotReceiptCommand.RequestParamSchema,
    getQueryKey: ({ route }) => brokerBotQueryKeys.getBrokerBotReceipt(route!).queryKey,
    rQueryParams: {
        retry: false,
        staleTime: Infinity
    },
    // The page shows its own message for a missing image, no toast.
    errorHandler: (error) => {
        throw error
    }
})

export const useGetBrokerBotBroadcasts = createGetQueryHook({
    endpoint: GetBrokerBotBroadcastsCommand.TSQ_url,
    responseSchema: GetBrokerBotBroadcastsCommand.ResponseSchema,
    getQueryKey: () => brokerBotQueryKeys.getBrokerBotBroadcasts.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(2)
    },
    errorHandler: (error) => errorHandler(error, t('broker-bot.get-broadcasts'))
})

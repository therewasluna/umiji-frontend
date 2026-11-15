import { createQueryKeys } from '@lukemorales/query-key-factory'
import { keepPreviousData } from '@tanstack/react-query'
import { GetBrokerMeCommand, GetBrokersCommand } from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const brokersQueryKeys = createQueryKeys('brokers', {
    getBrokers: {
        queryKey: null
    },
    getBrokerMe: {
        queryKey: null
    }
})

export const useGetBrokers = createGetQueryHook({
    endpoint: GetBrokersCommand.TSQ_url,
    responseSchema: GetBrokersCommand.ResponseSchema,
    getQueryKey: () => brokersQueryKeys.getBrokers.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true,
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('brokers.get-all-brokers'))
})

export const useGetBrokerMe = createGetQueryHook({
    endpoint: GetBrokerMeCommand.TSQ_url,
    responseSchema: GetBrokerMeCommand.ResponseSchema,
    getQueryKey: () => brokersQueryKeys.getBrokerMe.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        refetchInterval: sToMs(30),
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('brokers.get-broker-account'))
})

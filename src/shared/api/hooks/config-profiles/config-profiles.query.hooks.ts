import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
    GetComputedConfigProfileByUuidCommand,
    GetConfigProfileByUuidCommand,
    GetConfigProfilesCommand,
    GetConfigProfilesTagsCommand,
    GetInboundsByProfileUuidCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const configProfilesQueryKeys = createQueryKeys('configProfiles', {
    getConfigProfilesTags: {
        queryKey: null
    },
    getConfigProfiles: {
        queryKey: null
    },
    getConfigProfile: (route: GetConfigProfileByUuidCommand.RequestParam) => ({
        queryKey: [route]
    }),
    getComputedConfigProfile: (route: GetComputedConfigProfileByUuidCommand.RequestParam) => ({
        queryKey: [route]
    }),
    getConfigProfileInbounds: (route: GetConfigProfileByUuidCommand.RequestParam) => ({
        queryKey: [route]
    })
})

export const useGetConfigProfiles = createGetQueryHook({
    endpoint: GetConfigProfilesCommand.TSQ_url,
    responseSchema: GetConfigProfilesCommand.ResponseSchema,
    getQueryKey: () => configProfilesQueryKeys.getConfigProfiles.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('config-profiles.get-all-config-profiles'))
})

export const useGetConfigProfile = createGetQueryHook({
    endpoint: GetConfigProfileByUuidCommand.TSQ_url,
    responseSchema: GetConfigProfileByUuidCommand.ResponseSchema,
    routeParamsSchema: GetConfigProfileByUuidCommand.RequestParamSchema,
    getQueryKey: ({ route }) => configProfilesQueryKeys.getConfigProfile(route!).queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('config-profiles.get-config-profile'))
})

export const useGetConfigProfileInbounds = createGetQueryHook({
    endpoint: GetInboundsByProfileUuidCommand.TSQ_url,
    responseSchema: GetInboundsByProfileUuidCommand.ResponseSchema,
    routeParamsSchema: GetInboundsByProfileUuidCommand.RequestParamSchema,
    getQueryKey: ({ route }) => configProfilesQueryKeys.getConfigProfileInbounds(route!).queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('config-profiles.get-config-profile-inbounds'))
})

export const useGetComputedConfigProfile = createGetQueryHook({
    endpoint: GetComputedConfigProfileByUuidCommand.TSQ_url,
    responseSchema: GetComputedConfigProfileByUuidCommand.ResponseSchema,
    routeParamsSchema: GetComputedConfigProfileByUuidCommand.RequestParamSchema,
    getQueryKey: ({ route }) => configProfilesQueryKeys.getComputedConfigProfile(route!).queryKey,
    rQueryParams: {
        enabled: false
    },
    errorHandler: (error) => errorHandler(error, t('config-profiles.get-computed-config-profile'))
})

export const useGetConfigProfilesTags = createGetQueryHook({
    endpoint: GetConfigProfilesTagsCommand.TSQ_url,
    responseSchema: GetConfigProfilesTagsCommand.ResponseSchema,
    getQueryKey: () => configProfilesQueryKeys.getConfigProfilesTags.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('config-profiles.get-configprofiles-tags'))
})

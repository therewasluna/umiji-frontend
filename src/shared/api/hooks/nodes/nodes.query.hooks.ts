import { createQueryKeys } from '@lukemorales/query-key-factory'
import { keepPreviousData } from '@tanstack/react-query'
import {
    GetNodeMetadataCommand,
    GetNodeCommand,
    GetNodeSecretKeyCommand,
    GetNodesTagsCommand,
    GetNodesCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const nodesQueryKeys = createQueryKeys('nodes', {
    getAllNodes: {
        queryKey: null
    },
    getNode: (route: GetNodeCommand.RequestParam) => ({
        queryKey: [route]
    }),
    getNodeSecretKey: {
        queryKey: null
    },
    getAllTags: {
        queryKey: null
    },
    getNodeMetadata: (route: GetNodeMetadataCommand.RequestParams) => ({
        queryKey: [route]
    })
})

export const useGetNodes = createGetQueryHook({
    endpoint: GetNodesCommand.TSQ_url,
    responseSchema: GetNodesCommand.ResponseSchema,
    getQueryKey: () => nodesQueryKeys.getAllNodes.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('nodes.get-all-nodes'))
})

export const useGetNode = createGetQueryHook({
    endpoint: GetNodeCommand.TSQ_url,
    responseSchema: GetNodeCommand.ResponseSchema,
    routeParamsSchema: GetNodeCommand.RequestParamSchema,
    getQueryKey: ({ route }) => nodesQueryKeys.getNode(route!).queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(5),
        refetchInterval: sToMs(5)
    },
    errorHandler: (error) => errorHandler(error, t('nodes.get-node'))
})
export const useGetNodeSecretKey = createGetQueryHook({
    endpoint: GetNodeSecretKeyCommand.TSQ_url,
    responseSchema: GetNodeSecretKeyCommand.ResponseSchema,
    getQueryKey: () => nodesQueryKeys.getNodeSecretKey.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true,
        staleTime: sToMs(5),
        refetchInterval: sToMs(5)
    },

    errorHandler: (error) => errorHandler(error, t('nodes.get-pubkey'))
})

export const useGetNodesTags = createGetQueryHook({
    endpoint: GetNodesTagsCommand.TSQ_url,
    responseSchema: GetNodesTagsCommand.ResponseSchema,
    getQueryKey: () => nodesQueryKeys.getAllTags.queryKey,
    rQueryParams: {
        staleTime: 0
    },
    errorHandler: (error) => errorHandler(error, t('nodes.get-all-nodes-tags'))
})

export const useGetNodeMetadata = createGetQueryHook({
    endpoint: GetNodeMetadataCommand.TSQ_url,
    responseSchema: GetNodeMetadataCommand.ResponseSchema,
    routeParamsSchema: GetNodeMetadataCommand.RequestParamsSchema,
    getQueryKey: ({ route }) => nodesQueryKeys.getNodeMetadata(route!).queryKey,
    rQueryParams: {
        staleTime: sToMs(60)
    }
})

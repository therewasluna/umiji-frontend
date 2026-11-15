import { notifications } from '@mantine/notifications'
import {
    ConnectBrokerBotCommand,
    CreateBrokerBotBroadcastCommand,
    CreateBrokerBotCategoryCommand,
    CreateBrokerBotPlanCommand,
    DecideBrokerBotOrderCommand,
    DeleteBrokerBotCategoryCommand,
    DeleteBrokerBotPlanCommand,
    DisconnectBrokerBotCommand,
    GetBrokerBotCommand,
    TopUpBrokerBotWalletCommand,
    UpdateBrokerBotPlanCommand,
    UpdateBrokerBotSettingsCommand,
    UpdateBrokerBotTextsCommand
} from '@umiji/backend-contract'
import { type ParseKeys, t } from 'i18next'

import { queryClient } from '../../query-client'
import { createMutationHook } from '../../tsq-helpers'
import { brokerBotQueryKeys } from './broker-bot.query.hooks'

/** Every bot mutation answers with the whole bot view, so the page updates without a refetch. */
const setBotView = (data: GetBrokerBotCommand.Response['response']) =>
    queryClient.setQueryData(brokerBotQueryKeys.getBrokerBot.queryKey, data)

// Not the receipt queries: a decided receipt is deleted, refetching it would 404.
const refreshBotAndOrders = () =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: brokerBotQueryKeys.getBrokerBot.queryKey }),
        queryClient.invalidateQueries({ queryKey: brokerBotQueryKeys.getBrokerBotOrders._def })
    ])

// Titles are translation keys: brokers may use the panel in Persian.
const showError = (titleKey: ParseKeys) => (error: unknown) =>
    notifications.show({
        title: t(titleKey),
        message:
            error instanceof Error
                ? error.message
                : t('broker-bot.request-failed-with-unknown-error'),
        color: 'red'
    })

export const useConnectBrokerBot = createMutationHook({
    endpoint: ConnectBrokerBotCommand.TSQ_url,
    bodySchema: ConnectBrokerBotCommand.RequestBodySchema,
    responseSchema: ConnectBrokerBotCommand.ResponseSchema,
    requestMethod: ConnectBrokerBotCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.connection.title') }
})

export const useDisconnectBrokerBot = createMutationHook({
    endpoint: DisconnectBrokerBotCommand.TSQ_url,
    responseSchema: DisconnectBrokerBotCommand.ResponseSchema,
    requestMethod: DisconnectBrokerBotCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: setBotView,
        onError: showError('broker-bot.connection.disconnect')
    }
})

export const useUpdateBrokerBotSettings = createMutationHook({
    endpoint: UpdateBrokerBotSettingsCommand.TSQ_url,
    bodySchema: UpdateBrokerBotSettingsCommand.RequestBodySchema,
    responseSchema: UpdateBrokerBotSettingsCommand.ResponseSchema,
    requestMethod: UpdateBrokerBotSettingsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.title') }
})

export const useCreateBrokerBotPlan = createMutationHook({
    endpoint: CreateBrokerBotPlanCommand.TSQ_url,
    bodySchema: CreateBrokerBotPlanCommand.RequestBodySchema,
    responseSchema: CreateBrokerBotPlanCommand.ResponseSchema,
    requestMethod: CreateBrokerBotPlanCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.plans.add') }
})

export const useUpdateBrokerBotPlan = createMutationHook({
    endpoint: UpdateBrokerBotPlanCommand.TSQ_url,
    bodySchema: UpdateBrokerBotPlanCommand.RequestBodySchema,
    responseSchema: UpdateBrokerBotPlanCommand.ResponseSchema,
    requestMethod: UpdateBrokerBotPlanCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.plans.edit') }
})

export const useDeleteBrokerBotPlan = createMutationHook({
    endpoint: DeleteBrokerBotPlanCommand.TSQ_url,
    routeParamsSchema: DeleteBrokerBotPlanCommand.RequestParamSchema,
    responseSchema: DeleteBrokerBotPlanCommand.ResponseSchema,
    requestMethod: DeleteBrokerBotPlanCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.plans.title') }
})

export const useCreateBrokerBotCategory = createMutationHook({
    endpoint: CreateBrokerBotCategoryCommand.TSQ_url,
    bodySchema: CreateBrokerBotCategoryCommand.RequestBodySchema,
    responseSchema: CreateBrokerBotCategoryCommand.ResponseSchema,
    requestMethod: CreateBrokerBotCategoryCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.categories.add') }
})

export const useDeleteBrokerBotCategory = createMutationHook({
    endpoint: DeleteBrokerBotCategoryCommand.TSQ_url,
    routeParamsSchema: DeleteBrokerBotCategoryCommand.RequestParamSchema,
    responseSchema: DeleteBrokerBotCategoryCommand.ResponseSchema,
    requestMethod: DeleteBrokerBotCategoryCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: { onSuccess: setBotView, onError: showError('broker-bot.categories.delete') }
})

export const useDecideBrokerBotOrder = createMutationHook({
    endpoint: DecideBrokerBotOrderCommand.TSQ_url,
    routeParamsSchema: DecideBrokerBotOrderCommand.RequestParamSchema,
    bodySchema: DecideBrokerBotOrderCommand.RequestBodySchema,
    responseSchema: DecideBrokerBotOrderCommand.ResponseSchema,
    requestMethod: DecideBrokerBotOrderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: refreshBotAndOrders,
        onError: showError('broker-bot.orders.title')
    }
})

export const useTopUpBrokerBotWallet = createMutationHook({
    endpoint: TopUpBrokerBotWalletCommand.TSQ_url,
    bodySchema: TopUpBrokerBotWalletCommand.RequestBodySchema,
    responseSchema: TopUpBrokerBotWalletCommand.ResponseSchema,
    requestMethod: TopUpBrokerBotWalletCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: refreshBotAndOrders,
        onError: showError('broker-bot.topup.title')
    }
})

export const useCreateBrokerBotBroadcast = createMutationHook({
    endpoint: CreateBrokerBotBroadcastCommand.TSQ_url,
    bodySchema: CreateBrokerBotBroadcastCommand.RequestBodySchema,
    responseSchema: CreateBrokerBotBroadcastCommand.ResponseSchema,
    requestMethod: CreateBrokerBotBroadcastCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: brokerBotQueryKeys.getBrokerBotBroadcasts.queryKey
            }),
        onError: showError('broker-bot.broadcast.title')
    }
})

export const useUpdateBrokerBotTexts = createMutationHook({
    endpoint: UpdateBrokerBotTextsCommand.TSQ_url,
    bodySchema: UpdateBrokerBotTextsCommand.RequestBodySchema,
    responseSchema: UpdateBrokerBotTextsCommand.ResponseSchema,
    requestMethod: UpdateBrokerBotTextsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: (data) =>
            queryClient.setQueryData(brokerBotQueryKeys.getBrokerBotTexts.queryKey, data),
        onError: showError('broker-bot-texts.title')
    }
})

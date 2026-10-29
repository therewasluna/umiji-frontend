import { notifications } from '@mantine/notifications'
import {
    CreateBrokerCommand,
    DeleteBrokerCommand,
    ResetBrokerTrafficCommand,
    UpdateBrokerCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateBroker = createMutationHook({
    endpoint: CreateBrokerCommand.TSQ_url,
    bodySchema: CreateBrokerCommand.RequestBodySchema,
    responseSchema: CreateBrokerCommand.ResponseSchema,
    requestMethod: CreateBrokerCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('brokers.broker-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('brokers.create-broker-label'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('brokers.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateBroker = createMutationHook({
    endpoint: UpdateBrokerCommand.TSQ_url,
    bodySchema: UpdateBrokerCommand.RequestBodySchema,
    responseSchema: UpdateBrokerCommand.ResponseSchema,
    requestMethod: UpdateBrokerCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('brokers.broker-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('brokers.update-broker'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('brokers.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteBroker = createMutationHook({
    endpoint: DeleteBrokerCommand.TSQ_url,
    routeParamsSchema: DeleteBrokerCommand.RequestParamSchema,
    requestMethod: DeleteBrokerCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('brokers.broker-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('brokers.delete-broker'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('brokers.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useResetBrokerTraffic = createMutationHook({
    endpoint: ResetBrokerTrafficCommand.TSQ_url,
    routeParamsSchema: ResetBrokerTrafficCommand.RequestParamSchema,
    responseSchema: ResetBrokerTrafficCommand.ResponseSchema,
    requestMethod: ResetBrokerTrafficCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('brokers.broker-usage-reset-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('brokers.reset-broker-usage'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('brokers.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

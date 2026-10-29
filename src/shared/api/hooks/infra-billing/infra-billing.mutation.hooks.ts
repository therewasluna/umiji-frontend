import { notifications } from '@mantine/notifications'
import {
    CreateInfraBillingRecordCommand,
    CreateInfraBillingNodeCommand,
    CreateInfraProviderCommand,
    DeleteInfraBillingRecordCommand,
    DeleteInfraBillingNodeCommand,
    DeleteInfraProviderCommand,
    UpdateInfraBillingNodeCommand,
    UpdateInfraProviderCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateInfraProvider = createMutationHook({
    endpoint: UpdateInfraProviderCommand.TSQ_url,
    bodySchema: UpdateInfraProviderCommand.RequestBodySchema,
    responseSchema: UpdateInfraProviderCommand.ResponseSchema,
    requestMethod: UpdateInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-provider-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.update-infra-provider'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteInfraProvider = createMutationHook({
    endpoint: DeleteInfraProviderCommand.TSQ_url,
    routeParamsSchema: DeleteInfraProviderCommand.RequestParamSchema,
    requestMethod: DeleteInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-provider-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.delete-infra-provider'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateInfraProvider = createMutationHook({
    endpoint: CreateInfraProviderCommand.TSQ_url,
    responseSchema: CreateInfraProviderCommand.ResponseSchema,
    bodySchema: CreateInfraProviderCommand.RequestBodySchema,
    requestMethod: CreateInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-provider-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.create-infra-provider'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteInfraBillingHistoryRecord = createMutationHook({
    endpoint: DeleteInfraBillingRecordCommand.TSQ_url,
    routeParamsSchema: DeleteInfraBillingRecordCommand.RequestParamSchema,
    requestMethod: DeleteInfraBillingRecordCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-billing-history-record-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.delete-infra-billing-history-record'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateInfraBillingHistoryRecord = createMutationHook({
    endpoint: CreateInfraBillingRecordCommand.TSQ_url,
    responseSchema: CreateInfraBillingRecordCommand.ResponseSchema,
    bodySchema: CreateInfraBillingRecordCommand.RequestBodySchema,
    requestMethod: CreateInfraBillingRecordCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-billing-history-record-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.create-infra-billing-history-record'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateInfraBillingNode = createMutationHook({
    endpoint: CreateInfraBillingNodeCommand.TSQ_url,
    responseSchema: CreateInfraBillingNodeCommand.ResponseSchema,
    bodySchema: CreateInfraBillingNodeCommand.RequestBodySchema,
    requestMethod: CreateInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-billing-node-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.create-infra-billing-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteInfraBillingNode = createMutationHook({
    endpoint: DeleteInfraBillingNodeCommand.TSQ_url,
    routeParamsSchema: DeleteInfraBillingNodeCommand.RequestParamSchema,
    requestMethod: DeleteInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-billing-node-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.delete-infra-billing-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateInfraBillingNode = createMutationHook({
    endpoint: UpdateInfraBillingNodeCommand.TSQ_url,
    bodySchema: UpdateInfraBillingNodeCommand.RequestBodySchema,
    responseSchema: UpdateInfraBillingNodeCommand.ResponseSchema,
    requestMethod: UpdateInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('infra-billing.infra-billing-node-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('infra-billing.update-infra-billing-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('infra-billing.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

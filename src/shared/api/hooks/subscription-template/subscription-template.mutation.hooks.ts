import { notifications } from '@mantine/notifications'
import {
    CreateSubscriptionTemplateCommand,
    DeleteSubscriptionTemplateCommand,
    ReorderSubscriptionTemplateCommand,
    SetSubscriptionTemplateTagsCommand,
    UpdateSubscriptionTemplateCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSubscriptionTemplate = createMutationHook({
    endpoint: UpdateSubscriptionTemplateCommand.TSQ_url,
    bodySchema: UpdateSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: UpdateSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: UpdateSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subscription-template.subscription-template-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subscription-template.update-subscription-template'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subscription-template.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateSubscriptionTemplate = createMutationHook({
    endpoint: CreateSubscriptionTemplateCommand.TSQ_url,
    bodySchema: CreateSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: CreateSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: CreateSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subscription-template.subscription-template-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subscription-template.create-subscription-template'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subscription-template.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteSubscriptionTemplate = createMutationHook({
    endpoint: DeleteSubscriptionTemplateCommand.TSQ_url,
    routeParamsSchema: DeleteSubscriptionTemplateCommand.RequestParamSchema,
    requestMethod: DeleteSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subscription-template.subscription-template-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subscription-template.delete-subscription-template'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subscription-template.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderSubscriptionTemplates = createMutationHook({
    endpoint: ReorderSubscriptionTemplateCommand.TSQ_url,
    bodySchema: ReorderSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: ReorderSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: ReorderSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('subscription-template.reorder-subscription-templates'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subscription-template.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetSubscriptionTemplatesTags = createMutationHook({
    endpoint: SetSubscriptionTemplateTagsCommand.TSQ_url,
    bodySchema: SetSubscriptionTemplateTagsCommand.RequestBodySchema,
    responseSchema: SetSubscriptionTemplateTagsCommand.ResponseSchema,
    requestMethod: SetSubscriptionTemplateTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('subscription-template.update-tags'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subscription-template.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

import { notifications } from '@mantine/notifications'
import {
    CreateApiTokenCommand,
    DeleteApiTokenCommand,
    GetOttCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '@shared/api/tsq-helpers/create-mutation-hook'

export const useCreateApiToken = createMutationHook({
    endpoint: CreateApiTokenCommand.TSQ_url,
    bodySchema: CreateApiTokenCommand.RequestBodySchema,
    responseSchema: CreateApiTokenCommand.ResponseSchema,
    requestMethod: CreateApiTokenCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('api-tokens.api-token-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('api-tokens.create-api-token'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('api-tokens.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteApiToken = createMutationHook({
    endpoint: DeleteApiTokenCommand.TSQ_url,
    routeParamsSchema: DeleteApiTokenCommand.RequestParamSchema,
    requestMethod: DeleteApiTokenCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('api-tokens.api-token-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('api-tokens.delete-api-token'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('api-tokens.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useIssueOtt = createMutationHook({
    endpoint: GetOttCommand.TSQ_url,
    responseSchema: GetOttCommand.ResponseSchema,
    requestMethod: GetOttCommand.endpointDetails.REQUEST_METHOD
})

import { notifications } from '@mantine/notifications'
import {
    CreateNodeIntegrationCommand,
    DeleteNodeIntegrationCommand,
    UpdateNodeIntegrationCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateNodeIntegration = createMutationHook({
    endpoint: CreateNodeIntegrationCommand.TSQ_url,
    bodySchema: CreateNodeIntegrationCommand.RequestBodySchema,
    responseSchema: CreateNodeIntegrationCommand.ResponseSchema,
    requestMethod: CreateNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('node-integrations.node-integration-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('node-integrations.create-node-integration'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('node-integrations.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateNodeIntegration = createMutationHook({
    endpoint: UpdateNodeIntegrationCommand.TSQ_url,
    bodySchema: UpdateNodeIntegrationCommand.RequestBodySchema,
    responseSchema: UpdateNodeIntegrationCommand.ResponseSchema,
    requestMethod: UpdateNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('node-integrations.node-integration-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('node-integrations.update-node-integration'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('node-integrations.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteNodeIntegration = createMutationHook({
    endpoint: DeleteNodeIntegrationCommand.TSQ_url,
    routeParamsSchema: DeleteNodeIntegrationCommand.RequestParamSchema,
    requestMethod: DeleteNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('node-integrations.node-integration-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('node-integrations.delete-node-integration'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('node-integrations.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

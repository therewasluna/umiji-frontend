import { notifications } from '@mantine/notifications'
import {
    CreateSnippetCommand,
    DeleteSnippetCommand,
    UpdateSnippetCommand,
    SyncSnippetCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSnippet = createMutationHook({
    endpoint: UpdateSnippetCommand.TSQ_url,
    bodySchema: UpdateSnippetCommand.RequestBodySchema,
    responseSchema: UpdateSnippetCommand.ResponseSchema,
    requestMethod: UpdateSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('snippets.snippet-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('snippets.update-snippet'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('snippets.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteSnippet = createMutationHook({
    endpoint: DeleteSnippetCommand.TSQ_url,
    bodySchema: DeleteSnippetCommand.RequestBodySchema,
    requestMethod: DeleteSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('snippets.snippet-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('snippets.delete-snippet'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('snippets.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateSnippet = createMutationHook({
    endpoint: CreateSnippetCommand.TSQ_url,
    responseSchema: CreateSnippetCommand.ResponseSchema,
    bodySchema: CreateSnippetCommand.RequestBodySchema,
    requestMethod: CreateSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('snippets.snippet-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('snippets.create-snippet'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('snippets.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSyncSnippet = createMutationHook({
    endpoint: SyncSnippetCommand.TSQ_url,
    bodySchema: SyncSnippetCommand.RequestBodySchema,
    requestMethod: SyncSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('snippets.snippet-synced-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('snippets.sync-snippet'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('snippets.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

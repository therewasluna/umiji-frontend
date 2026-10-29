import { notifications } from '@mantine/notifications'
import {
    CloneSubpageConfigCommand,
    CreateSubpageConfigCommand,
    DeleteSubpageConfigCommand,
    ReorderSubpageConfigsCommand,
    SetSubpageConfigTagsCommand,
    UpdateSubpageConfigCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSubpageConfig = createMutationHook({
    endpoint: UpdateSubpageConfigCommand.TSQ_url,
    bodySchema: UpdateSubpageConfigCommand.RequestBodySchema,
    responseSchema: UpdateSubpageConfigCommand.ResponseSchema,
    requestMethod: UpdateSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subpage-configs.subscription-page-config-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.update-subscription-page-config'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateSubpageConfig = createMutationHook({
    endpoint: CreateSubpageConfigCommand.TSQ_url,
    bodySchema: CreateSubpageConfigCommand.RequestBodySchema,
    responseSchema: CreateSubpageConfigCommand.ResponseSchema,
    requestMethod: CreateSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subpage-configs.subscription-page-config-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.create-subscription-page-config'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteSubpageConfig = createMutationHook({
    endpoint: DeleteSubpageConfigCommand.TSQ_url,
    routeParamsSchema: DeleteSubpageConfigCommand.RequestParamSchema,
    requestMethod: DeleteSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subpage-configs.subscription-page-config-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.delete-subscription-page-config'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderSubpageConfigs = createMutationHook({
    endpoint: ReorderSubpageConfigsCommand.TSQ_url,
    bodySchema: ReorderSubpageConfigsCommand.RequestBodySchema,
    responseSchema: ReorderSubpageConfigsCommand.ResponseSchema,
    requestMethod: ReorderSubpageConfigsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.reorder-subscription-page-configs'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCloneSubpageConfig = createMutationHook({
    endpoint: CloneSubpageConfigCommand.TSQ_url,
    bodySchema: CloneSubpageConfigCommand.RequestBodySchema,
    responseSchema: CloneSubpageConfigCommand.ResponseSchema,
    requestMethod: CloneSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('subpage-configs.subscription-page-config-cloned-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.clone-subscription-page-config'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetSubpageConfigsTags = createMutationHook({
    endpoint: SetSubpageConfigTagsCommand.TSQ_url,
    bodySchema: SetSubpageConfigTagsCommand.RequestBodySchema,
    responseSchema: SetSubpageConfigTagsCommand.ResponseSchema,
    requestMethod: SetSubpageConfigTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('subpage-configs.update-tags'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('subpage-configs.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

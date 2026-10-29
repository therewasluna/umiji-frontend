import { notifications } from '@mantine/notifications'
import {
    BulkDeleteHostsCommand,
    BulkDisableHostsCommand,
    BulkEnableHostsCommand,
    CloneHostCommand,
    CreateHostCommand,
    DeleteHostCommand,
    ReorderHostsCommand,
    UpdateHostCommand,
    UpdateManyHostsCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateHost = createMutationHook({
    endpoint: CreateHostCommand.TSQ_url,
    bodySchema: CreateHostCommand.RequestBodySchema,
    responseSchema: CreateHostCommand.ResponseSchema,
    requestMethod: CreateHostCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('hosts.create-host'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCloneHost = createMutationHook({
    endpoint: CloneHostCommand.TSQ_url,
    bodySchema: CloneHostCommand.RequestBodySchema,
    responseSchema: CloneHostCommand.ResponseSchema,
    requestMethod: CloneHostCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('hosts.clone-host'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateHost = createMutationHook({
    endpoint: UpdateHostCommand.TSQ_url,
    bodySchema: UpdateHostCommand.RequestBodySchema,
    responseSchema: UpdateHostCommand.ResponseSchema,
    requestMethod: UpdateHostCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.host-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.update-host'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteHost = createMutationHook({
    endpoint: DeleteHostCommand.TSQ_url,
    routeParamsSchema: DeleteHostCommand.RequestParamSchema,
    requestMethod: DeleteHostCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.host-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.delete-host'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderHosts = createMutationHook({
    endpoint: ReorderHostsCommand.TSQ_url,
    bodySchema: ReorderHostsCommand.RequestBodySchema,
    responseSchema: ReorderHostsCommand.ResponseSchema,
    requestMethod: ReorderHostsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('hosts.reorder-hosts'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkDeleteHosts = createMutationHook({
    endpoint: BulkDeleteHostsCommand.TSQ_url,
    bodySchema: BulkDeleteHostsCommand.RequestBodySchema,
    requestMethod: BulkDeleteHostsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.hosts-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.bulk-delete-hosts'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkEnableHosts = createMutationHook({
    endpoint: BulkEnableHostsCommand.TSQ_url,
    bodySchema: BulkEnableHostsCommand.RequestBodySchema,
    requestMethod: BulkEnableHostsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.hosts-enabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.bulk-enable-hosts'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkDisableHosts = createMutationHook({
    endpoint: BulkDisableHostsCommand.TSQ_url,
    bodySchema: BulkDisableHostsCommand.RequestBodySchema,
    requestMethod: BulkDisableHostsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.hosts-disabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.bulk-disable-hosts'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateManyHosts = createMutationHook({
    endpoint: UpdateManyHostsCommand.TSQ_url,
    bodySchema: UpdateManyHostsCommand.RequestBodySchema,
    requestMethod: UpdateManyHostsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hosts.hosts-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hosts.update-many-hosts'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hosts.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

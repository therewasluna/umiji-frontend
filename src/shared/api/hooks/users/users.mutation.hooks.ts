import { notifications } from '@mantine/notifications'
import {
    BulkAllExtendExpirationDateCommand,
    BulkAllResetTrafficUsersCommand,
    BulkAllUpdateUsersCommand,
    BulkDeleteUsersByStatusCommand,
    BulkDeleteUsersCommand,
    BulkExtendExpirationDateCommand,
    BulkResetTrafficUsersCommand,
    BulkRevokeUsersSubscriptionCommand,
    BulkUpdateUsersCommand,
    BulkUpdateUsersSquadsCommand,
    CreateUserCommand,
    DeleteUserCommand,
    DisableUserCommand,
    EnableUserCommand,
    ResetUserTrafficCommand,
    ResolveUserCommand,
    RevokeUserSubscriptionCommand,
    UpdateUserCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateUser = createMutationHook({
    endpoint: CreateUserCommand.TSQ_url,
    bodySchema: CreateUserCommand.RequestBodySchema,
    responseSchema: CreateUserCommand.ResponseSchema,
    requestMethod: CreateUserCommand.endpointDetails.REQUEST_METHOD,

    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.create-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateUser = createMutationHook({
    endpoint: UpdateUserCommand.TSQ_url,
    bodySchema: UpdateUserCommand.RequestBodySchema,
    responseSchema: UpdateUserCommand.ResponseSchema,
    requestMethod: UpdateUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.update-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteUser = createMutationHook({
    endpoint: DeleteUserCommand.TSQ_url,
    routeParamsSchema: DeleteUserCommand.RequestParamSchema,
    requestMethod: DeleteUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.delete-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useRevokeUserSubscription = createMutationHook({
    endpoint: RevokeUserSubscriptionCommand.TSQ_url,
    bodySchema: RevokeUserSubscriptionCommand.RequestBodySchema,
    responseSchema: RevokeUserSubscriptionCommand.ResponseSchema,
    routeParamsSchema: RevokeUserSubscriptionCommand.RequestParamSchema,
    requestMethod: RevokeUserSubscriptionCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-subscription-revoked-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.revoke-user-subscription'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useEnableUser = createMutationHook({
    endpoint: EnableUserCommand.TSQ_url,
    responseSchema: EnableUserCommand.ResponseSchema,
    routeParamsSchema: EnableUserCommand.RequestParamSchema,
    requestMethod: EnableUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-enabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.enable-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDisableUser = createMutationHook({
    endpoint: DisableUserCommand.TSQ_url,
    responseSchema: DisableUserCommand.ResponseSchema,
    routeParamsSchema: DisableUserCommand.RequestParamSchema,
    requestMethod: DisableUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-disabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.disable-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useResetUserTraffic = createMutationHook({
    endpoint: ResetUserTrafficCommand.TSQ_url,
    responseSchema: ResetUserTrafficCommand.ResponseSchema,
    routeParamsSchema: ResetUserTrafficCommand.RequestParamSchema,
    requestMethod: ResetUserTrafficCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.user-traffic-reset-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.reset-user-traffic'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkDeleteUsersByStatus = createMutationHook({
    endpoint: BulkDeleteUsersByStatusCommand.TSQ_url,
    bodySchema: BulkDeleteUsersByStatusCommand.RequestBodySchema,
    requestMethod: BulkDeleteUsersByStatusCommand.endpointDetails.REQUEST_METHOD
})

export const useBulkUpdateUsers = createMutationHook({
    endpoint: BulkUpdateUsersCommand.TSQ_url,
    bodySchema: BulkUpdateUsersCommand.RequestBodySchema,
    requestMethod: BulkUpdateUsersCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-update-users'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkResetTraffic = createMutationHook({
    endpoint: BulkResetTrafficUsersCommand.TSQ_url,
    bodySchema: BulkResetTrafficUsersCommand.RequestBodySchema,
    requestMethod: BulkResetTrafficUsersCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-reset-traffic'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkRevokeUsersSubscription = createMutationHook({
    endpoint: BulkRevokeUsersSubscriptionCommand.TSQ_url,
    bodySchema: BulkRevokeUsersSubscriptionCommand.RequestBodySchema,
    requestMethod: BulkRevokeUsersSubscriptionCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-revoke-users-subscription'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkDeleteUsers = createMutationHook({
    endpoint: BulkDeleteUsersCommand.TSQ_url,
    bodySchema: BulkDeleteUsersCommand.RequestBodySchema,
    requestMethod: BulkDeleteUsersCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-delete-users'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkSetActiveInternalSquads = createMutationHook({
    endpoint: BulkUpdateUsersSquadsCommand.TSQ_url,
    bodySchema: BulkUpdateUsersSquadsCommand.RequestBodySchema,
    requestMethod: BulkUpdateUsersSquadsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-set-active-inbounds'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkAllUpdateUsers = createMutationHook({
    endpoint: BulkAllUpdateUsersCommand.TSQ_url,
    bodySchema: BulkAllUpdateUsersCommand.RequestBodySchema,
    requestMethod: BulkAllUpdateUsersCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-all-update-users'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkAllResetTrafficUsers = createMutationHook({
    endpoint: BulkAllResetTrafficUsersCommand.TSQ_url,
    requestMethod: BulkAllResetTrafficUsersCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-all-reset-traffic-users'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkExtendUsersExpirationDate = createMutationHook({
    endpoint: BulkExtendExpirationDateCommand.TSQ_url,
    bodySchema: BulkExtendExpirationDateCommand.RequestBodySchema,
    requestMethod: BulkExtendExpirationDateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.users-expiration-date-extended-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-extend-users-expiration-date'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkAllExtendUsersExpirationDate = createMutationHook({
    endpoint: BulkAllExtendExpirationDateCommand.TSQ_url,
    bodySchema: BulkAllExtendExpirationDateCommand.RequestBodySchema,
    requestMethod: BulkAllExtendExpirationDateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('users.all-users-expiration-date-extended-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('users.bulk-all-extend-users-expiration-date'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useResolveUser = createMutationHook({
    endpoint: ResolveUserCommand.TSQ_url,
    bodySchema: ResolveUserCommand.RequestBodySchema,
    responseSchema: ResolveUserCommand.ResponseSchema,
    requestMethod: ResolveUserCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('users.resolve-user'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('users.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

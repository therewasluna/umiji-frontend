import { notifications } from '@mantine/notifications'
import {
    AddUsersToExternalSquadCommand,
    CreateExternalSquadCommand,
    DeleteExternalSquadCommand,
    DeleteUsersFromExternalSquadCommand,
    ReorderExternalSquadCommand,
    SetExternalSquadTagsCommand,
    UpdateExternalSquadCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateExternalSquad = createMutationHook({
    endpoint: UpdateExternalSquadCommand.TSQ_url,
    bodySchema: UpdateExternalSquadCommand.RequestBodySchema,
    responseSchema: UpdateExternalSquadCommand.ResponseSchema,
    requestMethod: UpdateExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('external-squads.external-squad-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('external-squads.update-external-squad'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteExternalSquad = createMutationHook({
    endpoint: DeleteExternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteExternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('external-squads.external-squad-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('external-squads.delete-external-squad'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCreateExternalSquad = createMutationHook({
    endpoint: CreateExternalSquadCommand.TSQ_url,
    responseSchema: CreateExternalSquadCommand.ResponseSchema,
    bodySchema: CreateExternalSquadCommand.RequestBodySchema,
    requestMethod: CreateExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('external-squads.external-squad-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('external-squads.create-external-squad'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useAddUsersToExternalSquad = createMutationHook({
    endpoint: AddUsersToExternalSquadCommand.TSQ_url,
    routeParamsSchema: AddUsersToExternalSquadCommand.RequestParamSchema,
    requestMethod: AddUsersToExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('external-squads.add-users-to-external-squad'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteUsersFromExternalSquad = createMutationHook({
    endpoint: DeleteUsersFromExternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteUsersFromExternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteUsersFromExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('external-squads.remove-users-from-external-squad'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderExternalSquads = createMutationHook({
    endpoint: ReorderExternalSquadCommand.TSQ_url,
    bodySchema: ReorderExternalSquadCommand.RequestBodySchema,
    responseSchema: ReorderExternalSquadCommand.ResponseSchema,
    requestMethod: ReorderExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('external-squads.reorder-external-squads'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetExternalSquadsTags = createMutationHook({
    endpoint: SetExternalSquadTagsCommand.TSQ_url,
    bodySchema: SetExternalSquadTagsCommand.RequestBodySchema,
    responseSchema: SetExternalSquadTagsCommand.ResponseSchema,
    requestMethod: SetExternalSquadTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('external-squads.update-tags'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('external-squads.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

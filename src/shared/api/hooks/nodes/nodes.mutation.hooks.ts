import { notifications } from '@mantine/notifications'
import {
    BulkNodesActionsCommand,
    BulkNodesProfileModificationCommand,
    BulkNodesUpdateCommand,
    CreateNodeCommand,
    DeleteNodeCommand,
    DisableNodeCommand,
    EnableNodeCommand,
    ReorderNodesCommand,
    ResetNodeTrafficCommand,
    RestartAllNodesCommand,
    RestartNodeCommand,
    UpdateNodeCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateNode = createMutationHook({
    endpoint: CreateNodeCommand.TSQ_url,
    bodySchema: CreateNodeCommand.RequestBodySchema,
    responseSchema: CreateNodeCommand.ResponseSchema,
    requestMethod: CreateNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-created-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.create-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateNode = createMutationHook({
    endpoint: UpdateNodeCommand.TSQ_url,
    bodySchema: UpdateNodeCommand.RequestBodySchema,
    responseSchema: UpdateNodeCommand.ResponseSchema,
    requestMethod: UpdateNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.update-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteNode = createMutationHook({
    endpoint: DeleteNodeCommand.TSQ_url,
    routeParamsSchema: DeleteNodeCommand.RequestParamSchema,
    requestMethod: DeleteNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.delete-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useEnableNode = createMutationHook({
    endpoint: EnableNodeCommand.TSQ_url,
    responseSchema: EnableNodeCommand.ResponseSchema,
    routeParamsSchema: EnableNodeCommand.RequestParamSchema,
    requestMethod: EnableNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-enabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.enable-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDisableNode = createMutationHook({
    endpoint: DisableNodeCommand.TSQ_url,
    responseSchema: DisableNodeCommand.ResponseSchema,
    routeParamsSchema: DisableNodeCommand.RequestParamSchema,
    requestMethod: DisableNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-disabled-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.disable-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useRestartAllNodes = createMutationHook({
    endpoint: RestartAllNodesCommand.TSQ_url,
    bodySchema: RestartAllNodesCommand.RequestBodySchema,
    requestMethod: RestartAllNodesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.please-wait-for-the-nodes-to-reconnect'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.restart-all-nodes'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})
export const useReorderNodes = createMutationHook({
    endpoint: ReorderNodesCommand.TSQ_url,
    bodySchema: ReorderNodesCommand.RequestBodySchema,
    responseSchema: ReorderNodesCommand.ResponseSchema,
    requestMethod: ReorderNodesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('nodes.reorder-nodes'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useRestartNode = createMutationHook({
    endpoint: RestartNodeCommand.TSQ_url,
    routeParamsSchema: RestartNodeCommand.RequestParamSchema,
    bodySchema: RestartNodeCommand.RequestBodySchema,
    requestMethod: RestartNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-restarted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.restart-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useResetNodeTraffic = createMutationHook({
    endpoint: ResetNodeTrafficCommand.TSQ_url,
    routeParamsSchema: ResetNodeTrafficCommand.RequestParamSchema,
    requestMethod: ResetNodeTrafficCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.node-traffic-reset-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.reset-node-traffic'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesProfileModification = createMutationHook({
    endpoint: BulkNodesProfileModificationCommand.TSQ_url,
    bodySchema: BulkNodesProfileModificationCommand.RequestBodySchema,
    requestMethod: BulkNodesProfileModificationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.task-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.bulk-nodes-profile-modification'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesActions = createMutationHook({
    endpoint: BulkNodesActionsCommand.TSQ_url,
    bodySchema: BulkNodesActionsCommand.RequestBodySchema,
    requestMethod: BulkNodesActionsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.actions-added-to-queue-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.bulk-nodes-actions'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesUpdate = createMutationHook({
    endpoint: BulkNodesUpdateCommand.TSQ_url,
    bodySchema: BulkNodesUpdateCommand.RequestBodySchema,
    requestMethod: BulkNodesUpdateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('nodes.nodes-updated-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('nodes.bulk-nodes-update'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

import { createQueryKeys } from '@lukemorales/query-key-factory'
import { notifications } from '@mantine/notifications'
import {
    GetNodeInstallCommand,
    StartNodeInstallCommand,
    TNodeInstallState
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createGetQueryHook, createMutationHook, errorHandler } from '../../tsq-helpers'

export const nodeInstallQueryKeys = createQueryKeys('nodeInstall', {
    getNodeInstall: (route: GetNodeInstallCommand.RequestParam) => ({
        queryKey: [route]
    })
})

export const useStartNodeInstall = createMutationHook({
    endpoint: StartNodeInstallCommand.TSQ_url,
    bodySchema: StartNodeInstallCommand.RequestBodySchema,
    responseSchema: StartNodeInstallCommand.ResponseSchema,
    requestMethod: StartNodeInstallCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                title: t('node-install.install-node'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('nodes.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useGetNodeInstall = createGetQueryHook({
    endpoint: GetNodeInstallCommand.TSQ_url,
    responseSchema: GetNodeInstallCommand.ResponseSchema,
    routeParamsSchema: GetNodeInstallCommand.RequestParamSchema,
    getQueryKey: ({ route }) => nodeInstallQueryKeys.getNodeInstall(route!).queryKey,
    rQueryParams: {
        // Poll while the server is installing; stop once it finished either way.
        refetchInterval: (query) => {
            if (query.state.status === 'error') return false

            const install = query.state.data as TNodeInstallState | undefined
            return !install || install.status === 'running' ? 1_000 : false
        }
    },
    errorHandler: (error) => errorHandler(error, t('node-install.install-node'))
})

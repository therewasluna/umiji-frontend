import { notifications } from '@mantine/notifications'
import {
    DeleteAllUserHwidDevicesCommand,
    DeleteUserHwidDeviceCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useDeleteUserHwidDevice = createMutationHook({
    endpoint: DeleteUserHwidDeviceCommand.TSQ_url,
    bodySchema: DeleteUserHwidDeviceCommand.RequestBodySchema,
    responseSchema: DeleteUserHwidDeviceCommand.ResponseSchema,
    requestMethod: DeleteUserHwidDeviceCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hwid-user-devices.device-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hwid-user-devices.delete-device'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hwid-user-devices.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteAllUserHwidDevices = createMutationHook({
    endpoint: DeleteAllUserHwidDevicesCommand.TSQ_url,
    bodySchema: DeleteAllUserHwidDevicesCommand.RequestBodySchema,
    responseSchema: DeleteAllUserHwidDevicesCommand.ResponseSchema,
    requestMethod: DeleteAllUserHwidDevicesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('hwid-user-devices.all-devices-deleted-successfully'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                title: t('hwid-user-devices.delete-all-devices'),
                message:
                    error instanceof Error
                        ? error.message
                        : t('hwid-user-devices.request-failed-with-unknown-error'),
                color: 'red'
            })
        }
    }
})

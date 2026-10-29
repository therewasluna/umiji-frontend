import { notifications } from '@mantine/notifications'
import {
    DeletePasskeyCommand,
    UpdatePasskeyCommand,
    VerifyPasskeyRegistrationCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const usePasskeyRegistrationVerify = createMutationHook({
    endpoint: VerifyPasskeyRegistrationCommand.TSQ_url,
    bodySchema: VerifyPasskeyRegistrationCommand.RequestBodySchema,
    responseSchema: VerifyPasskeyRegistrationCommand.ResponseSchema,
    requestMethod: VerifyPasskeyRegistrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('passkeys.passkey-verified'),
                message: t('passkeys.passkey-verification-successful'),
                color: 'teal'
            })
        }
    }
})

export const useDeletePasskey = createMutationHook({
    endpoint: DeletePasskeyCommand.TSQ_url,
    bodySchema: DeletePasskeyCommand.RequestBodySchema,
    requestMethod: DeletePasskeyCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('passkeys.passkey-deleted'),
                message: t('passkeys.passkey-deleted-successfully'),
                color: 'teal'
            })
        }
    }
})

export const useUpdatePasskey = createMutationHook({
    endpoint: UpdatePasskeyCommand.TSQ_url,
    bodySchema: UpdatePasskeyCommand.RequestBodySchema,
    responseSchema: UpdatePasskeyCommand.ResponseSchema,
    requestMethod: UpdatePasskeyCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('passkeys.passkey-updated'),
                message: t('passkeys.passkey-updated-successfully'),
                color: 'teal'
            })
        }
    }
})

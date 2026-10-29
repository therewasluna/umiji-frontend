import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
    GetPasskeysCommand,
    GetPasskeyRegistrationOptionsCommand
} from '@umiji/backend-contract'
import { t } from 'i18next'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const passkeysQueryKeys = createQueryKeys('passkeys', {
    getPasskeys: {
        queryKey: null
    },
    getPasskeyRegistrationOptions: {
        queryKey: null
    }
})

export const usePasskeyRegistrationOptions = createGetQueryHook({
    endpoint: GetPasskeyRegistrationOptionsCommand.TSQ_url,
    responseSchema: GetPasskeyRegistrationOptionsCommand.ResponseSchema,
    getQueryKey: () => passkeysQueryKeys.getPasskeyRegistrationOptions.queryKey,
    rQueryParams: {
        enabled: false
    },
    errorHandler: (error) => errorHandler(error, t('passkeys.get-passkey-registration-options'))
})

export const useGetPasskeys = createGetQueryHook({
    endpoint: GetPasskeysCommand.TSQ_url,
    responseSchema: GetPasskeysCommand.ResponseSchema,
    getQueryKey: () => passkeysQueryKeys.getPasskeys.queryKey,
    rQueryParams: {
        refetchOnMount: false
    },
    errorHandler: (error) => errorHandler(error, t('passkeys.get-all-passkeys'))
})

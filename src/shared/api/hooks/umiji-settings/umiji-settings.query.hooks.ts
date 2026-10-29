import { createQueryKeys } from '@lukemorales/query-key-factory'
import { GetUmijiSettingsCommand } from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const umijiSettingsQueryKeys = createQueryKeys('umijiSettings', {
    getUmijiSettings: {
        queryKey: null
    }
})

export const useGetUmijiSettings = createGetQueryHook({
    endpoint: GetUmijiSettingsCommand.TSQ_url,
    responseSchema: GetUmijiSettingsCommand.ResponseSchema,
    getQueryKey: () => umijiSettingsQueryKeys.getUmijiSettings.queryKey,
    rQueryParams: {
        refetchOnMount: false,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('umiji-settings.get-umiji-settings'))
})

import { createQueryKeys } from '@lukemorales/query-key-factory'
import { GetSnippetsCommand } from '@umiji/backend-contract'
import { t } from 'i18next'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'

export const snippetsQueryKeys = createQueryKeys('snippets', {
    getSnippets: {
        queryKey: null
    }
})

export const useGetSnippets = createGetQueryHook({
    endpoint: GetSnippetsCommand.TSQ_url,
    responseSchema: GetSnippetsCommand.ResponseSchema,
    getQueryKey: () => snippetsQueryKeys.getSnippets.queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(30)
    },
    errorHandler: (error) => errorHandler(error, t('snippets.get-all-snippets'))
})

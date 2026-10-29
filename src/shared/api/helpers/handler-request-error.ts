import { isAxiosError } from 'axios'
import { consola } from 'consola/browser'
import { t } from 'i18next'
import { ZodError } from 'zod'

/** Handle request errors */
export function handleRequestError(error: unknown): never {
    if (isAxiosError(error)) {
        const errorData = error.response?.data
        const enhancedError = new Error(
            errorData?.message || t('handler-request-error.request-failed')
        )
        enhancedError.cause = errorData
        throw enhancedError
    }

    if (error instanceof ZodError) {
        consola.error(error.format())
    }

    consola.log(error)

    throw error
}

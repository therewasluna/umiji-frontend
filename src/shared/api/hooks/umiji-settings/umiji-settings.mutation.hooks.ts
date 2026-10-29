import { notifications } from '@mantine/notifications'
import { UpdateUmijiSettingsCommand } from '@umiji/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateUmijiSettings = createMutationHook({
    endpoint: UpdateUmijiSettingsCommand.TSQ_url,
    bodySchema: UpdateUmijiSettingsCommand.RequestBodySchema,
    responseSchema: UpdateUmijiSettingsCommand.ResponseSchema,
    requestMethod: UpdateUmijiSettingsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: t('common.message.success'),
                message: t('umiji-settings.umiji-settings-updated-successfully'),
                color: 'teal'
            })
        }
    }
})

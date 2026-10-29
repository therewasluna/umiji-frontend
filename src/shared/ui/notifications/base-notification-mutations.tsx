import { notifications } from '@mantine/notifications'
import { t as translate, TFunction } from 'i18next'
import { TbCheck as IconCheck } from 'react-icons/tb'

export const baseNotificationsMutations = (
    id: string,
    refetch: () => void,
    t: TFunction = translate
) => {
    return {
        onMutate: () => {
            notifications.show({
                id,
                loading: true,
                title: t('common.message.processing'),
                message: t('base-notification-mutations.this-operation-may-take-some-time'),
                autoClose: false,
                withCloseButton: false
            })

            return undefined
        },
        onSettled(error: unknown) {
            if (error) {
                notifications.update({
                    id,
                    color: 'red',
                    title: t('common.message.error'),
                    message:
                        error instanceof Error
                            ? error.message
                            : t('base-notification-mutations.unknown-error'),
                    loading: false,
                    autoClose: 5000
                })
            }
        },
        onSuccess: () => {
            notifications.update({
                icon: <IconCheck size={18} />,
                id,
                color: 'teal',
                title: t('common.message.success'),
                message: t(
                    'base-notification-mutations.task-added-to-queue-please-wait-for-it-to-be-processed'
                ),
                loading: false,
                autoClose: 3000
            })

            refetch()
        }
    }
}

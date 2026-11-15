import { Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { TFunction } from 'i18next'
import { TbAlertTriangle } from 'react-icons/tb'

import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

export const showValidationErrorsModal = (
    errors: { message: string; path: string }[],
    t: TFunction
) => {
    modals.open({
        title: (
            <BaseOverlayHeader
                IconComponent={TbAlertTriangle}
                iconSize={20}
                title={t('validation-error.validation-error')}
                titleOrder={5}
            />
        ),
        children: (
            <Stack gap="sm" p="sm">
                <Stack gap={2} mt="xs">
                    {errors.map((err, idx) => (
                        <Text c="red" key={idx} size="sm">
                            • {err.path ? `${err.path}: ` : ''}
                            {err.message}
                        </Text>
                    ))}
                </Stack>
            </Stack>
        ),
        centered: true,
        size: 'lg'
    })
}

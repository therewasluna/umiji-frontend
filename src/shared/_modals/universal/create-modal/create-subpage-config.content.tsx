import { Stack, TextInput, Button } from '@mantine/core'
import { useField } from '@mantine/form'
import { CreateSubpageConfigCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { generatePath, NavigateFunction } from 'react-router'

import { queryClient } from '@shared/api'
import { useCreateSubpageConfig } from '@shared/api/hooks'
import { QueryKeys } from '@shared/api/hooks/keys-factory'
import { ROUTES } from '@shared/constants'
import { ModalFooter } from '@shared/ui/modal-footer'

interface IProps {
    onClose: () => void
    navigate: NavigateFunction
}

export const CreateSubpageConfigContent = (props: IProps) => {
    const { t } = useTranslation()

    const { onClose, navigate } = props

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.subpageConfigs.getSubpageConfigs.queryKey
        })
    }

    const nameField = useField<CreateSubpageConfigCommand.RequestBody['name']>({
        initialValue: '',
        validateOnChange: true,
        validate: (value) => {
            const result = CreateSubpageConfigCommand.RequestBodySchema.safeParse({
                name: value
            })
            return result.success ? null : result.error.issues[0]?.message
        }
    })

    const { mutate: createSubpageConfig, isPending } = useCreateSubpageConfig({
        mutationFns: {
            onSuccess: (data) => {
                onClose()
                handleUpdate()
                navigate(
                    generatePath(ROUTES.DASHBOARD.SUBPAGE_CONFIGS.SUBPAGE_CONFIG_BY_UUID, {
                        uuid: data.uuid
                    })
                )
            }
        }
    })
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                createSubpageConfig({
                    variables: {
                        name: nameField.getValue()
                    }
                })
            }}
        >
            <Stack gap="md">
                <TextInput
                    data-autofocus
                    label={t('common.field.name')}
                    placeholder={t('create-subpage-config.my-subscription-page-config')}
                    required
                    {...nameField.getInputProps()}
                />
            </Stack>
            <ModalFooter>
                <Button color="gray" onClick={onClose} variant="soft">
                    {t('common.action.cancel')}
                </Button>

                <Button color="teal" loading={isPending} type="submit">
                    {t('common.action.create')}
                </Button>
            </ModalFooter>
        </form>
    )
}

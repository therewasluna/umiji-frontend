import { Stack, TextInput, Button } from '@mantine/core'
import { useField } from '@mantine/form'
import { CreateNodePluginCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { generatePath, NavigateFunction } from 'react-router'

import { queryClient } from '@shared/api'
import { useCreateNodePlugin } from '@shared/api/hooks'
import { QueryKeys } from '@shared/api/hooks/keys-factory'
import { ROUTES } from '@shared/constants/routes'
import { ModalFooter } from '@shared/ui/modal-footer'

interface IProps {
    onClose: () => void
    navigate: NavigateFunction
}

export const CreateNodePluginContent = (props: IProps) => {
    const { t } = useTranslation()

    const { onClose, navigate } = props

    const handleUpdate = async () => {
        await queryClient.refetchQueries({
            queryKey: QueryKeys.nodePlugins.getNodePlugins.queryKey
        })
    }

    const nameField = useField<CreateNodePluginCommand.RequestBody['name']>({
        initialValue: '',
        validateOnChange: true,
        validate: (value) => {
            const result = CreateNodePluginCommand.RequestBodySchema.safeParse({
                name: value
            })
            return result.success ? null : result.error.issues[0]?.message
        }
    })
    const { mutate: createNodePlugin, isPending } = useCreateNodePlugin({
        mutationFns: {
            onSuccess: (data) => {
                onClose()

                handleUpdate()
                navigate(
                    generatePath(ROUTES.DASHBOARD.MANAGEMENT.NODE_PLUGINS.NODE_PLUGIN_BY_UUID, {
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
                createNodePlugin({
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
                    placeholder={t('create-node-plugin.my-node-plugin')}
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

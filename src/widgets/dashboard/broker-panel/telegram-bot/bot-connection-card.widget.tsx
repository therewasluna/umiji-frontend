import { Badge, Button, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbChevronRight, TbHash, TbKey, TbLanguage, TbPlugConnectedX } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { useConnectBrokerBot, useDisconnectBrokerBot } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

interface IFormValues {
    botToken: string
    groupId: string
}

export function BotConnectionCardWidget({ bot }: IProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const form = useForm<IFormValues>({
        mode: 'uncontrolled',
        initialValues: {
            botToken: '',
            groupId: bot.groupId ?? ''
        },
        validate: {
            groupId: (value) =>
                value.trim() && !/^-?\d+$/.test(value.trim())
                    ? t('broker-bot.connection.group-id-hint')
                    : null
        }
    })

    const { mutate: connect, isPending } = useConnectBrokerBot({
        mutationFns: {
            onSuccess: () => {
                form.setFieldValue('botToken', '')
                notifications.show({ message: t('broker-bot.connection.saved'), color: 'teal' })
            }
        }
    })
    const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectBrokerBot()

    const handleSubmit = form.onSubmit((values) =>
        connect({
            variables: {
                botToken: values.botToken.trim() || undefined,
                groupId: values.groupId.trim() || null
            }
        })
    )

    const confirmDisconnect = () =>
        modals.openConfirmModal({
            title: t('broker-bot.connection.disconnect'),
            children: t('broker-bot.connection.disconnect-confirm'),
            labels: {
                confirm: t('broker-bot.connection.disconnect'),
                cancel: t('common.action.cancel')
            },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm: () => disconnect({})
        })

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    description={
                        bot.isConnected ? (
                            <Group component="span" gap="xs" mt={4}>
                                <Badge color="teal" tt="none" variant="soft">
                                    {t('broker-bot.connection.connected-as', {
                                        username: bot.botUsername
                                    })}
                                </Badge>
                                {bot.groupId && (
                                    <Badge
                                        color={bot.topicsReady ? 'gray' : 'orange'}
                                        variant="soft"
                                    >
                                        {bot.topicsReady
                                            ? t('broker-bot.connection.topics-ok')
                                            : t('broker-bot.connection.topics-missing')}
                                    </Badge>
                                )}
                            </Group>
                        ) : (
                            t('broker-bot.connection.not-connected')
                        )
                    }
                    title={t('broker-bot.connection.title')}
                />

                <SettingsCardShared.Content>
                    <Stack gap="md">
                        {!bot.isConnected && (
                            <Text c="dimmed" size="sm">
                                {t('broker-bot.connection.help')}
                            </Text>
                        )}

                        <PasswordInput
                            autoComplete="off"
                            dir="ltr"
                            key={form.key('botToken')}
                            label={t('broker-bot.connection.bot-token')}
                            leftSection={<TbKey size={16} />}
                            placeholder={
                                bot.isConnected
                                    ? t('broker-bot.connection.bot-token-keep')
                                    : '123456:ABC-DEF…'
                            }
                            {...form.getInputProps('botToken')}
                        />

                        <TextInput
                            description={t('broker-bot.connection.group-id-hint')}
                            dir="ltr"
                            key={form.key('groupId')}
                            label={t('broker-bot.connection.group-id')}
                            leftSection={<TbHash size={16} />}
                            placeholder="-1001234567890"
                            {...form.getInputProps('groupId')}
                        />

                        <Button
                            fullWidth
                            justify="space-between"
                            leftSection={<TbLanguage size={18} />}
                            onClick={() => navigate(ROUTES.DASHBOARD.BROKER.TELEGRAM_TEXTS)}
                            rightSection={<TbChevronRight size={16} />}
                            size="md"
                            variant="default"
                        >
                            {t('broker-bot.connection.texts-link')}
                        </Button>
                    </Stack>
                </SettingsCardShared.Content>

                <SettingsCardShared.Bottom>
                    <Group justify="space-between" mt="md">
                        {bot.isConnected ? (
                            <Button
                                color="red"
                                leftSection={<TbPlugConnectedX size={18} />}
                                loading={isDisconnecting}
                                onClick={confirmDisconnect}
                                variant="subtle"
                            >
                                {t('broker-bot.connection.disconnect')}
                            </Button>
                        ) : (
                            <span />
                        )}
                        <Button
                            color="teal"
                            loading={isPending}
                            size="md"
                            type="submit"
                            variant="soft"
                        >
                            {t('broker-bot.connection.save')}
                        </Button>
                    </Group>
                </SettingsCardShared.Bottom>
            </SettingsCardShared.Container>
        </form>
    )
}

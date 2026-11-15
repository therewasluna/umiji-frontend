import { Button, Group, Text, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { BrokerBotTelegramLinkSchema, GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbLink } from 'react-icons/tb'
import { z } from 'zod'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

const ChannelFormSchema = z.object({
    channelUrl: z.union([z.literal(''), BrokerBotTelegramLinkSchema])
})

/** The "Our channel" button on the bot's start menu. */
export function BotChannelCardWidget({ bot }: IProps) {
    const { t } = useTranslation()

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: { channelUrl: bot.channelUrl ?? '' },
        validate: schemaResolver(ChannelFormSchema)
    })

    const { mutate: updateSettings, isPending } = useUpdateBrokerBotSettings({
        mutationFns: {
            onSuccess: () => notifications.show({ message: t('broker-bot.saved'), color: 'teal' })
        }
    })

    const handleSubmit = form.onSubmit((values) =>
        updateSettings({ variables: { channelUrl: values.channelUrl.trim() || null } })
    )

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    description={t('broker-bot.channel.description')}
                    title={t('broker-bot.channel.title')}
                />

                <SettingsCardShared.Content>
                    {bot.isConnected ? (
                        <TextInput
                            description={t('broker-bot.channel.url-hint')}
                            dir="ltr"
                            key={form.key('channelUrl')}
                            label={t('broker-bot.channel.url')}
                            leftSection={<TbLink size={16} />}
                            placeholder="https://t.me/yourchannel"
                            {...form.getInputProps('channelUrl')}
                        />
                    ) : (
                        <Text c="dimmed" size="sm">
                            {t('broker-bot.connect-first')}
                        </Text>
                    )}
                </SettingsCardShared.Content>

                {bot.isConnected && (
                    <SettingsCardShared.Bottom>
                        <Group justify="flex-end" mt="md">
                            <Button color="teal" loading={isPending} type="submit" variant="soft">
                                {t('broker-bot.channel.save')}
                            </Button>
                        </Group>
                    </SettingsCardShared.Bottom>
                )}
            </SettingsCardShared.Container>
        </form>
    )
}

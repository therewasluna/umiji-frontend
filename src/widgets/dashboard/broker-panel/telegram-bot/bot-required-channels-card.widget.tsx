import { BrokerBotRequiredChannelSchema, GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbLock } from 'react-icons/tb'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

import { BotListEditor } from './bot-list-editor'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

/** Channels a customer must join before the bot answers them. */
export function BotRequiredChannelsCardWidget({ bot }: IProps) {
    const { t } = useTranslation()
    const { mutateAsync: updateSettings, isPending } = useUpdateBrokerBotSettings()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('broker-bot.channels.description')}
                icon={<TbLock size={24} />}
                iconColor="orange"
                iconVariant="soft"
                title={t('broker-bot.channels.title')}
            />

            <SettingsCardShared.Content>
                <BotListEditor
                    addLabel={t('broker-bot.channels.add')}
                    emptyLabel={t('broker-bot.channels.empty')}
                    fields={[
                        { key: 'title', label: t('broker-bot.channels.label') },
                        { key: 'chatRef', label: t('broker-bot.channels.ref'), mono: true },
                        { key: 'url', label: t('broker-bot.channels.link'), mono: true }
                    ]}
                    isPending={isPending}
                    items={bot.requiredChannels}
                    max={10}
                    onChange={(requiredChannels) =>
                        updateSettings({ variables: { requiredChannels } })
                    }
                    schema={BrokerBotRequiredChannelSchema}
                />
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

import { BrokerBotRequiredChannelSchema, GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbBrandTelegram } from 'react-icons/tb'

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
                title={t('broker-bot.channels.title')}
            />

            <SettingsCardShared.Content>
                <BotListEditor
                    addLabel={t('broker-bot.channels.add')}
                    emptyLabel={t('broker-bot.channels.empty')}
                    fields={[
                        { key: 'title', label: t('broker-bot.channels.label') },
                        {
                            invalid: t('broker-bot.channels.ref-invalid'),
                            key: 'chatRef',
                            label: t('broker-bot.channels.ref'),
                            mono: true
                        },
                        {
                            invalid: t('broker-bot.channels.link-invalid'),
                            key: 'url',
                            label: t('broker-bot.channels.link'),
                            mono: true
                        }
                    ]}
                    Icon={TbBrandTelegram}
                    isPending={isPending}
                    items={bot.requiredChannels}
                    max={10}
                    onChange={(requiredChannels) =>
                        updateSettings({ variables: { requiredChannels } })
                    }
                    schema={BrokerBotRequiredChannelSchema}
                    title={t('broker-bot.channels.list')}
                />
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

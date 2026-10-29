import { Stack, Title } from '@mantine/core'
import {
    BrokerBotCardSchema,
    BrokerBotWalletSchema,
    GetBrokerBotCommand
} from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbCreditCard } from 'react-icons/tb'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

import { BotListEditor } from './bot-list-editor'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

/** Where customers send money when they top up their wallet. */
export function BotPaymentMethodsCardWidget({ bot }: IProps) {
    const { t } = useTranslation()
    const { mutateAsync: updateSettings, isPending } = useUpdateBrokerBotSettings()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('broker-bot.payments.description')}
                icon={<TbCreditCard size={24} />}
                iconColor="yellow"
                iconVariant="soft"
                title={t('broker-bot.payments.title')}
            />

            <SettingsCardShared.Content>
                <Stack gap="lg">
                    <Stack gap="xs">
                        <Title order={6}>{t('broker-bot.payments.cards')}</Title>
                        <BotListEditor
                            addLabel={t('broker-bot.payments.add-card')}
                            emptyLabel={t('broker-bot.payments.no-cards')}
                            fields={[
                                {
                                    key: 'cardNumber',
                                    label: t('broker-bot.payments.card-number'),
                                    mono: true
                                },
                                { key: 'holderName', label: t('broker-bot.payments.holder-name') }
                            ]}
                            isPending={isPending}
                            items={bot.cards}
                            max={20}
                            onChange={(cards) => updateSettings({ variables: { cards } })}
                            schema={BrokerBotCardSchema}
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Title order={6}>{t('broker-bot.payments.wallets')}</Title>
                        <BotListEditor
                            addLabel={t('broker-bot.payments.add-wallet')}
                            emptyLabel={t('broker-bot.payments.no-wallets')}
                            fields={[
                                { key: 'asset', label: t('broker-bot.payments.asset') },
                                {
                                    key: 'address',
                                    label: t('broker-bot.payments.address'),
                                    mono: true
                                }
                            ]}
                            isPending={isPending}
                            items={bot.wallets}
                            max={20}
                            onChange={(wallets) => updateSettings({ variables: { wallets } })}
                            schema={BrokerBotWalletSchema}
                        />
                    </Stack>
                </Stack>
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

import { Badge } from '@mantine/core'
import {
    BrokerBotCardSchema,
    BrokerBotPayMethodSchema,
    BrokerBotWalletSchema,
    GetBrokerBotCommand
} from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbCreditCard, TbCurrencyBitcoin, TbWorld } from 'react-icons/tb'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

import { BotListEditor } from './bot-list-editor'

// Manual transfers that need no API: international, then Russia, then Turkey.
const PAY_METHOD_SUGGESTIONS = [
    'PayPal',
    'Wise',
    'Revolut',
    'Payoneer',
    'Skrill',
    'IBAN',
    'SBP (СБП)',
    'YooMoney',
    'Payeer',
    'Papara'
]

// 6037997512345678 reads as 6037 9975 1234 5678. Anything that isn't just digits stays as typed.
const formatCardNumber = (value: string) => {
    const digits = value.replace(/[\s-]/g, '')
    return /^\d+$/.test(digits) ? digits.replace(/(\d{4})(?=\d)/g, '$1 ') : value
}

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

/** Where customers send money when they top up their wallet. */
export function BotPaymentMethodsCardWidget({ bot }: IProps) {
    const { t } = useTranslation()
    const { mutateAsync: updateSettings, isPending } = useUpdateBrokerBotSettings()

    const methodsCount = bot.cards.length + bot.wallets.length + bot.payMethods.length

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                actions={
                    // With all three lists empty the bot refuses every top-up, so this is real state.
                    methodsCount > 0 ? (
                        <Badge color="teal" variant="soft">
                            {t('localization-block.active', { count: methodsCount })}
                        </Badge>
                    ) : (
                        <Badge color="yellow" variant="soft">
                            {t('broker-bot.payments.not-set-up')}
                        </Badge>
                    )
                }
                description={t('broker-bot.payments.description')}
                title={t('broker-bot.payments.title')}
            />

            <SettingsCardShared.Content>
                <div>
                    <BotListEditor
                        addLabel={t('broker-bot.payments.add-card')}
                        emptyLabel={t('broker-bot.payments.no-cards')}
                        fields={[
                            {
                                format: formatCardNumber,
                                key: 'cardNumber',
                                label: t('broker-bot.payments.card-number'),
                                ltr: true
                            },
                            { key: 'holderName', label: t('broker-bot.payments.holder-name') }
                        ]}
                        Icon={TbCreditCard}
                        isPending={isPending}
                        items={bot.cards}
                        max={20}
                        onChange={(cards) => updateSettings({ variables: { cards } })}
                        schema={BrokerBotCardSchema}
                        title={t('broker-bot.payments.cards')}
                    />

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
                        Icon={TbCurrencyBitcoin}
                        isPending={isPending}
                        items={bot.wallets}
                        max={20}
                        onChange={(wallets) => updateSettings({ variables: { wallets } })}
                        schema={BrokerBotWalletSchema}
                        title={t('broker-bot.payments.wallets')}
                    />

                    <BotListEditor
                        addLabel={t('broker-bot.payments.add-other')}
                        emptyLabel={t('broker-bot.payments.no-other')}
                        fields={[
                            {
                                key: 'method',
                                label: t('broker-bot.payments.method'),
                                suggestions: PAY_METHOD_SUGGESTIONS
                            },
                            {
                                key: 'account',
                                label: t('broker-bot.payments.account'),
                                mono: true
                            },
                            { key: 'note', label: t('broker-bot.payments.note') }
                        ]}
                        Icon={TbWorld}
                        isPending={isPending}
                        items={bot.payMethods}
                        max={20}
                        onChange={(payMethods) => updateSettings({ variables: { payMethods } })}
                        schema={BrokerBotPayMethodSchema}
                        title={t('broker-bot.payments.other')}
                    />
                </div>
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

import { Button, Group, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { BROKER_BOT_MAX_TOMAN } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbUserDollar } from 'react-icons/tb'

import { useTopUpBrokerBotWallet } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { formatTomanUtil } from '@shared/utils/brokers'

/** Credit a customer's wallet by hand, e.g. after a payment outside the bot. */
export function BotTopupCardWidget({ isConnected }: { isConnected: boolean }) {
    const { t } = useTranslation()
    const [done, setDone] = useState<null | string>(null)

    const form = useForm<{ amount: number | string; telegramId: string }>({
        mode: 'uncontrolled',
        initialValues: { telegramId: '', amount: '' },
        validate: {
            telegramId: (value) =>
                /^\d+$/.test(value.trim()) ? null : t('broker-bot.topup.invalid-id'),
            amount: (value) =>
                Number(value) >= 1 && Number(value) <= BROKER_BOT_MAX_TOMAN
                    ? null
                    : t('broker-bot.topup.invalid-amount')
        }
    })

    const { mutate: topUp, isPending } = useTopUpBrokerBotWallet({
        mutationFns: {
            onSuccess: (data) => {
                form.reset()
                setDone(
                    t('broker-bot.topup.done', {
                        name: data.name,
                        balance: formatTomanUtil(data.balance, t)
                    })
                )
            }
        }
    })

    const handleSubmit = form.onSubmit((values) => {
        setDone(null)
        topUp({
            variables: { telegramId: values.telegramId.trim(), amount: Number(values.amount) }
        })
    })

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    description={t('broker-bot.topup.description')}
                    title={t('broker-bot.topup.title')}
                />

                <SettingsCardShared.Content>
                    {isConnected ? (
                        <>
                            <Group align="flex-start" grow>
                                <TextInput
                                    inputMode="numeric"
                                    key={form.key('telegramId')}
                                    label={t('broker-bot.topup.telegram-id')}
                                    leftSection={<TbUserDollar size={16} />}
                                    placeholder="123456789"
                                    {...form.getInputProps('telegramId')}
                                />
                                <NumberInput
                                    allowDecimal={false}
                                    allowNegative={false}
                                    hideControls
                                    key={form.key('amount')}
                                    label={t('broker-bot.topup.amount')}
                                    placeholder="50,000"
                                    thousandSeparator=","
                                    {...form.getInputProps('amount')}
                                />
                            </Group>
                            {done && (
                                <Text c="teal" mt="sm" size="sm">
                                    {done}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text c="dimmed" size="sm">
                            {t('broker-bot.connect-first')}
                        </Text>
                    )}
                </SettingsCardShared.Content>

                {isConnected && (
                    <SettingsCardShared.Bottom>
                        <Group justify="flex-end" mt="md">
                            <Button color="teal" loading={isPending} type="submit" variant="soft">
                                {t('broker-bot.topup.submit')}
                            </Button>
                        </Group>
                    </SettingsCardShared.Bottom>
                )}
            </SettingsCardShared.Container>
        </form>
    )
}

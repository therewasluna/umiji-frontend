import { Button, Group, NumberInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbPercentage } from 'react-icons/tb'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

/** The share of a referred customer's top-ups paid to whoever invited them. */
export function BotReferralCardWidget({ bot }: IProps) {
    const { t } = useTranslation()

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: { referralPercent: bot.referralPercent },
        validate: {
            referralPercent: (v) =>
                Number.isInteger(v) && v >= 0 && v <= 100 ? null : t('broker-bot.field-invalid')
        }
    })

    const { mutate: updateSettings, isPending } = useUpdateBrokerBotSettings({
        mutationFns: {
            onSuccess: () => notifications.show({ message: t('broker-bot.saved'), color: 'teal' })
        }
    })

    const handleSubmit = form.onSubmit((values) =>
        updateSettings({ variables: { referralPercent: values.referralPercent } })
    )

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    description={t('broker-bot.referral.description')}
                    title={t('broker-bot.referral.title')}
                />

                <SettingsCardShared.Content>
                    <NumberInput
                        allowDecimal={false}
                        allowNegative={false}
                        description={t('broker-bot.referral.percent-hint')}
                        key={form.key('referralPercent')}
                        label={t('broker-bot.referral.percent')}
                        leftSection={<TbPercentage size={16} />}
                        max={100}
                        min={0}
                        {...form.getInputProps('referralPercent')}
                    />
                </SettingsCardShared.Content>

                <SettingsCardShared.Bottom>
                    <Group justify="flex-end" mt="md">
                        <Button color="teal" loading={isPending} type="submit" variant="soft">
                            {t('broker-bot.referral.save')}
                        </Button>
                    </Group>
                </SettingsCardShared.Bottom>
            </SettingsCardShared.Container>
        </form>
    )
}

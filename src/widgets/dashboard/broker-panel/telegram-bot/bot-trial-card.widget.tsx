import {
    Button,
    Checkbox,
    Group,
    NativeSelect,
    NumberInput,
    SimpleGrid,
    Stack,
    Switch,
    Text
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'

import { useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { IpLimitBetaDescription, IpLimitBetaLabel } from '@shared/ui/ip-limit-beta/ip-limit-beta'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
    squads: { name: string; uuid: string }[]
}

/** The free test plan: every Telegram account can claim it once until the next reset. */
export function BotTrialCardWidget({ bot, squads }: IProps) {
    const { t, i18n } = useTranslation()

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            isActive: bot.trial?.isActive ?? false,
            trafficGb: bot.trial?.trafficGb ?? 1,
            duration: bot.trial?.durationHours ?? bot.trial?.durationDays ?? 1,
            durationUnit: bot.trial?.durationHours ? 'hours' : 'days',
            ipLimit: (bot.trial?.ipLimit ?? '') as number | string,
            dailyLimit: (bot.trial?.dailyLimit ?? '') as number | string,
            deleteExpired: bot.trial?.deleteExpired ?? false,
            // Drop squads the broker lost, so saving clears them instead of failing.
            squadUuids: bot.trial
                ? bot.trial.squadUuids.filter((uuid) => squads.some((s) => s.uuid === uuid))
                : squads.slice(0, 1).map((s) => s.uuid)
        },
        validate: {
            trafficGb: (v) => (v >= 0 ? null : t('broker-bot.field-invalid')),
            duration: (v) =>
                Number.isInteger(v) && v >= 1 && v <= 3650 ? null : t('broker-bot.field-invalid'),
            squadUuids: (v) => (v.length ? null : t('broker-bot.plans.squads-required'))
        }
    })

    const { mutate: updateSettings, isPending } = useUpdateBrokerBotSettings({
        mutationFns: {
            onSuccess: () => notifications.show({ message: t('broker-bot.saved'), color: 'teal' })
        }
    })

    const handleSubmit = form.onSubmit(({ duration, durationUnit, ...values }) =>
        updateSettings({
            variables: {
                trial: {
                    ...values,
                    // Hours replace days when set; durationDays stays valid for API readers.
                    durationDays: durationUnit === 'hours' ? Math.ceil(duration / 24) : duration,
                    durationHours: durationUnit === 'hours' ? duration : null,
                    ipLimit: Number(values.ipLimit) || null,
                    dailyLimit: Number(values.dailyLimit) || null
                }
            }
        })
    )

    const confirmReset = () =>
        modals.openConfirmModal({
            title: t('broker-bot.trial.reset'),
            children: t('broker-bot.trial.reset-confirm'),
            labels: { confirm: t('broker-bot.trial.reset'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'teal', variant: 'soft' },
            centered: true,
            onConfirm: () => updateSettings({ variables: { resetTrial: true } })
        })

    const since = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(bot.trialResetAt)

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    description={t('broker-bot.trial.description')}
                    title={t('broker-bot.trial.title')}
                />

                <SettingsCardShared.Content>
                    {squads.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('broker-bot.plans.no-squads')}
                        </Text>
                    ) : (
                        <Stack gap="md">
                            <Switch
                                key={form.key('isActive')}
                                label={t('broker-bot.trial.offer')}
                                {...form.getInputProps('isActive', { type: 'checkbox' })}
                            />
                            <SimpleGrid cols={{ base: 1, xs: 2 }}>
                                <NumberInput
                                    allowNegative={false}
                                    decimalScale={1}
                                    description={t('broker-bot.plans.field-traffic-hint')}
                                    inputWrapperOrder={['label', 'input', 'description']}
                                    key={form.key('trafficGb')}
                                    label={t('broker-bot.plans.field-traffic')}
                                    min={0}
                                    {...form.getInputProps('trafficGb')}
                                />
                                <Group align="flex-end" gap="xs" wrap="nowrap">
                                    <NumberInput
                                        allowDecimal={false}
                                        allowNegative={false}
                                        flex={1}
                                        key={form.key('duration')}
                                        label={t('broker-bot.trial.field-duration')}
                                        max={3650}
                                        min={1}
                                        {...form.getInputProps('duration')}
                                    />
                                    <NativeSelect
                                        aria-label={t('broker-bot.trial.duration-unit')}
                                        data={[
                                            {
                                                value: 'days',
                                                label: t('broker-bot.trial.unit-days')
                                            },
                                            {
                                                value: 'hours',
                                                label: t('broker-bot.trial.unit-hours')
                                            }
                                        ]}
                                        key={form.key('durationUnit')}
                                        w={110}
                                        {...form.getInputProps('durationUnit')}
                                    />
                                </Group>
                            </SimpleGrid>
                            <NumberInput
                                allowDecimal={false}
                                allowNegative={false}
                                clampBehavior="strict"
                                description={
                                    <IpLimitBetaDescription>
                                        {t('broker-bot.trial.field-ip-limit-hint')}
                                    </IpLimitBetaDescription>
                                }
                                hideControls
                                key={form.key('ipLimit')}
                                label={
                                    <IpLimitBetaLabel>
                                        {t('broker-bot.plans.field-ip-limit')}
                                    </IpLimitBetaLabel>
                                }
                                max={100}
                                min={1}
                                placeholder={t('broker-bot.plans.unlimited')}
                                {...form.getInputProps('ipLimit')}
                            />
                            <NumberInput
                                allowDecimal={false}
                                allowNegative={false}
                                clampBehavior="strict"
                                description={t('broker-bot.trial.field-daily-limit-hint')}
                                hideControls
                                key={form.key('dailyLimit')}
                                label={t('broker-bot.trial.field-daily-limit')}
                                max={100000}
                                min={1}
                                placeholder={t('broker-bot.plans.unlimited')}
                                {...form.getInputProps('dailyLimit')}
                            />
                            <Checkbox.Group
                                description={t('broker-bot.trial.squads-hint')}
                                key={form.key('squadUuids')}
                                label={t('broker-bot.plans.field-squads')}
                                {...form.getInputProps('squadUuids')}
                            >
                                <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
                                    {squads.map((squad) => (
                                        <Checkbox.Card
                                            key={squad.uuid}
                                            p="sm"
                                            radius="md"
                                            value={squad.uuid}
                                        >
                                            <Group gap="sm" wrap="nowrap">
                                                <Checkbox.Indicator />
                                                <Text fw={500} size="sm" truncate="end">
                                                    {squad.name}
                                                </Text>
                                            </Group>
                                        </Checkbox.Card>
                                    ))}
                                </SimpleGrid>
                            </Checkbox.Group>
                            <Switch
                                description={t('broker-bot.trial.delete-expired-hint')}
                                key={form.key('deleteExpired')}
                                label={t('broker-bot.trial.delete-expired')}
                                {...form.getInputProps('deleteExpired', { type: 'checkbox' })}
                            />
                            <Text c="dimmed" size="xs">
                                {t('broker-bot.trial.claims', { count: bot.trialClaims, since })}
                            </Text>
                        </Stack>
                    )}
                </SettingsCardShared.Content>

                {squads.length > 0 && (
                    <SettingsCardShared.Bottom>
                        <Group justify="space-between" mt="md">
                            <Button
                                color="gray"
                                disabled={bot.trialClaims === 0}
                                onClick={confirmReset}
                                variant="soft"
                            >
                                {t('broker-bot.trial.reset')}
                            </Button>
                            <Button color="teal" loading={isPending} type="submit" variant="soft">
                                {t('broker-bot.trial.save')}
                            </Button>
                        </Group>
                    </SettingsCardShared.Bottom>
                )}
            </SettingsCardShared.Container>
        </form>
    )
}

import {
    Button,
    Checkbox,
    Group,
    Modal,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbPackage } from 'react-icons/tb'

import { useCreateBrokerBotPlan, useUpdateBrokerBotPlan } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks/use-is-mobile'
import { IpLimitBetaDescription, IpLimitBetaLabel } from '@shared/ui/ip-limit-beta/ip-limit-beta'
import { ModalFooter } from '@shared/ui/modal-footer'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

type TBot = GetBrokerBotCommand.Response['response']

interface IProps {
    bot: TBot
    onClose: () => void
    opened: boolean
    plan: null | TBot['plans'][number]
    squads: { name: string; uuid: string }[]
}

interface IFormValues {
    categoryId: null | string
    durationDays: number | string
    ipLimit: number | string
    price: number | string
    squadUuids: string[]
    title: string
    trafficGb: number | string
}

export function BotPlanModal({ bot, onClose, opened, plan, squads }: IProps) {
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const form = useForm<IFormValues>({
        mode: 'uncontrolled',
        initialValues: {
            title: plan?.title ?? '',
            categoryId: plan?.categoryId != null ? String(plan.categoryId) : null,
            trafficGb: plan?.trafficGb ?? 10,
            durationDays: plan?.durationDays ?? 30,
            price: plan?.price ?? 0,
            ipLimit: plan?.ipLimit ?? '',
            // Drop squads the broker lost, so saving clears them instead of failing.
            squadUuids: plan
                ? plan.squadUuids.filter((uuid) => squads.some((s) => s.uuid === uuid))
                : squads.slice(0, 1).map((s) => s.uuid)
        },
        validate: {
            title: (v) => (v.trim() ? null : t('broker-bot.plans.field-title')),
            durationDays: (v) => (Number(v) >= 1 ? null : t('broker-bot.plans.field-duration')),
            squadUuids: (v) => (v.length ? null : t('broker-bot.plans.squads-required'))
        }
    })

    const { mutate: createPlan, isPending: isCreating } = useCreateBrokerBotPlan({
        mutationFns: { onSuccess: onClose }
    })
    const { mutate: updatePlan, isPending: isUpdating } = useUpdateBrokerBotPlan({
        mutationFns: { onSuccess: onClose }
    })

    const handleSubmit = form.onSubmit((values) => {
        const body = {
            title: values.title.trim(),
            categoryId: values.categoryId ? Number(values.categoryId) : null,
            trafficGb: Number(values.trafficGb) || 0,
            durationDays: Number(values.durationDays),
            price: Number(values.price) || 0,
            ipLimit: Number(values.ipLimit) || null,
            squadUuids: values.squadUuids
        }
        if (plan) updatePlan({ variables: { id: plan.id, ...body } })
        else createPlan({ variables: body })
    })

    return (
        <Modal
            centered
            fullScreen={isMobile}
            onClose={onClose}
            opened={opened}
            size="lg"
            title={
                <BaseOverlayHeader
                    IconComponent={TbPackage}
                    title={plan ? t('broker-bot.plans.edit') : t('broker-bot.plans.add')}
                />
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        data-autofocus
                        key={form.key('title')}
                        label={t('broker-bot.plans.field-title')}
                        maxLength={64}
                        placeholder={t('broker-bot.plans.title-placeholder')}
                        {...form.getInputProps('title')}
                    />

                    {bot.categories.length > 0 && (
                        <Select
                            clearable
                            data={bot.categories.map((c) => ({
                                value: String(c.id),
                                label: c.title
                            }))}
                            key={form.key('categoryId')}
                            label={t('broker-bot.plans.field-category')}
                            placeholder={t('broker-bot.plans.no-category')}
                            {...form.getInputProps('categoryId')}
                        />
                    )}

                    <SimpleGrid cols={{ base: 1, xs: 3 }}>
                        <NumberInput
                            allowNegative={false}
                            decimalScale={1}
                            // The hint goes under the input, so all three inputs share a top edge.
                            description={t('broker-bot.plans.field-traffic-hint')}
                            inputWrapperOrder={['label', 'input', 'description']}
                            key={form.key('trafficGb')}
                            label={t('broker-bot.plans.field-traffic')}
                            min={0}
                            {...form.getInputProps('trafficGb')}
                        />
                        <NumberInput
                            allowDecimal={false}
                            allowNegative={false}
                            key={form.key('durationDays')}
                            label={t('broker-bot.plans.field-duration')}
                            max={3650}
                            min={1}
                            {...form.getInputProps('durationDays')}
                        />
                        <NumberInput
                            allowDecimal={false}
                            allowNegative={false}
                            hideControls
                            key={form.key('price')}
                            label={t('broker-bot.plans.field-price')}
                            thousandSeparator=","
                            {...form.getInputProps('price')}
                        />
                    </SimpleGrid>

                    <NumberInput
                        allowDecimal={false}
                        allowNegative={false}
                        clampBehavior="strict"
                        description={
                            <IpLimitBetaDescription>
                                {t('broker-bot.plans.field-ip-limit-hint')}
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

                    {squads.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            {t('broker-bot.plans.no-squads')}
                        </Text>
                    ) : (
                        <Checkbox.Group
                            description={t('broker-bot.plans.field-squads-hint')}
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
                    )}
                </Stack>

                <ModalFooter>
                    <Button color="gray" onClick={onClose} variant="soft">
                        {t('common.action.cancel')}
                    </Button>
                    <Button
                        color="teal"
                        disabled={squads.length === 0}
                        loading={isCreating || isUpdating}
                        type="submit"
                        variant="soft"
                    >
                        {t('common.action.save')}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}

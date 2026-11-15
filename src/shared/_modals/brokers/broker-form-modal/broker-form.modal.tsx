import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
    ActionIcon,
    Button,
    Group,
    Modal,
    NumberInput,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Tooltip
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { schemaResolver, useForm } from '@mantine/form'
import { useClipboard } from '@mantine/hooks'
import {
    CreateBrokerCommand,
    GetBrokersCommand,
    UpdateBrokerCommand
} from '@umiji/backend-contract'
import { InternalSquadsListWidget } from '@widgets/dashboard/users/internal-squads-list'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    PiCalendarDuotone,
    PiCheck,
    PiCopy,
    PiFloppyDiskDuotone,
    PiHandshake,
    PiUsers
} from 'react-icons/pi'
import { TbChartLine, TbDice5, TbShield, TbUserCog, TbWebhook } from 'react-icons/tb'
import { z } from 'zod'

import { showModal } from '@shared/_modals/show-modal'
import { useNiceMantineModal } from '@shared/_modals/use-nice-modal'
import { queryClient } from '@shared/api'
import {
    QueryKeys,
    useCreateBroker,
    useGetInternalSquads,
    useUpdateBroker
} from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { TrafficLimitInput } from '@shared/ui/forms/traffic-limit-input'
import { ModalFooter } from '@shared/ui/modal-footer'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'
import { handleFormErrors } from '@shared/utils/misc'

interface IProps {
    broker?: GetBrokersCommand.Response['response']['brokers'][number]
}

interface IFormValues {
    description: string
    expireAt: Date | null
    internalSquads: string[]
    isDisabled: boolean
    password: string
    trafficLimitBytes: number | undefined
    username: string
    usersLimit: '' | null | number
}

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

// Meets the backend rule (24+ chars with upper, lower and digit) by construction.
const generatePassword = (): string => {
    const random = crypto.getRandomValues(new Uint32Array(32))
    const chars = Array.from(random, (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length])
    chars[0] = 'ABCDEFGHJKLMNPQRSTUVWXYZ'[random[0] % 24]
    chars[1] = 'abcdefghijkmnopqrstuvwxyz'[random[1] % 25]
    chars[2] = '23456789'[random[2] % 8]
    return chars.join('')
}

const createSchema = CreateBrokerCommand.RequestBodySchema.omit({ expireAt: true })
const updateSchema = UpdateBrokerCommand.RequestBodySchema.omit({
    uuid: true,
    expireAt: true
}).extend({
    password: UpdateBrokerCommand.RequestBodySchema.shape.password.or(z.literal(''))
})

export const BrokerFormModal = NiceModal.create((props: IProps) => {
    const { broker } = props
    const isEdit = !!broker

    const { t, i18n } = useTranslation()
    const isMobile = useIsMobile()

    const modal = useModal()
    const { modalProps, hide } = useNiceMantineModal({ modal })

    const { data: internalSquads } = useGetInternalSquads()
    const [squadSearch, setSquadSearch] = useState('')
    const clipboard = useClipboard({ timeout: 1500 })

    const filteredInternalSquads = useMemo(() => {
        const all = internalSquads?.internalSquads ?? []
        const query = squadSearch.toLowerCase().trim()
        return query ? all.filter((squad) => squad.name.toLowerCase().includes(query)) : all
    }, [internalSquads, squadSearch])

    const form = useForm<IFormValues>({
        name: 'broker-form',
        mode: 'uncontrolled',
        validateInputOnBlur: true,
        onValuesChange: (values) => {
            if (values.usersLimit === '') {
                form.setFieldValue('usersLimit', null)
            }
        },
        validate: schemaResolver(isEdit ? updateSchema : createSchema),
        initialValues: {
            username: broker?.username ?? '',
            password: '',
            trafficLimitBytes: broker?.trafficLimitBytes ?? 0,
            usersLimit: broker?.usersLimit ?? null,
            expireAt: broker?.expireAt ?? null,
            description: broker?.description ?? '',
            isDisabled: broker?.isDisabled ?? false,
            internalSquads: broker?.internalSquads.map(({ uuid }) => uuid) ?? []
        }
    })

    const onSaved = () => {
        queryClient.refetchQueries({ queryKey: QueryKeys.brokers.getBrokers.queryKey })
        hide()
    }

    const { mutate: createBroker, isPending: isCreating } = useCreateBroker({
        mutationFns: { onSuccess: onSaved, onError: (error) => handleFormErrors(form, error) }
    })
    const { mutate: updateBroker, isPending: isUpdating } = useUpdateBroker({
        mutationFns: { onSuccess: onSaved, onError: (error) => handleFormErrors(form, error) }
    })

    const handleSubmit = form.onSubmit((values) => {
        const fields = {
            trafficLimitBytes: values.trafficLimitBytes ?? 0,
            usersLimit: values.usersLimit || null,
            // @ts-expect-error - the contract parses the ISO string into a Date
            expireAt: (values.expireAt ? dayjs(values.expireAt).toISOString() : null) as Date,
            description: values.description.trim() || null,
            internalSquads: values.internalSquads
        }

        if (broker) {
            updateBroker({
                variables: {
                    uuid: broker.uuid,
                    password: values.password || undefined,
                    isDisabled: values.isDisabled,
                    ...fields
                }
            })
            return
        }

        createBroker({
            variables: { username: values.username, password: values.password, ...fields }
        })
    })

    const accountCard = (
        <SectionCard.Root>
            <SectionCard.Section>
                <BaseOverlayHeader
                    IconComponent={TbUserCog}
                    iconSize={20}
                    title={t('brokers.account')}
                    titleOrder={5}
                />
            </SectionCard.Section>
            <SectionCard.Section>
                <Stack gap="md">
                    <TextInput
                        description={t('brokers.username-description')}
                        disabled={isEdit}
                        key={form.key('username')}
                        label={t('common.field.username')}
                        required={!isEdit}
                        {...form.getInputProps('username')}
                    />

                    {/* Visible on purpose: the admin hands this password to the broker. */}
                    <TextInput
                        autoComplete="new-password"
                        description={t(
                            isEdit
                                ? 'brokers.new-password-description'
                                : 'brokers.password-description'
                        )}
                        key={form.key('password')}
                        label={t(isEdit ? 'brokers.new-password' : 'common.field.password')}
                        required={!isEdit}
                        rightSection={
                            <Group gap={2} wrap="nowrap">
                                <Tooltip label={t('brokers.generate-password')} withArrow>
                                    <ActionIcon
                                        aria-label={t('brokers.generate-password')}
                                        onClick={() =>
                                            form.setFieldValue('password', generatePassword())
                                        }
                                        variant="subtle"
                                    >
                                        <TbDice5 size={18} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t('common.action.copy')} withArrow>
                                    <ActionIcon
                                        aria-label={t('common.action.copy')}
                                        color={clipboard.copied ? 'teal' : undefined}
                                        onClick={() => clipboard.copy(form.getValues().password)}
                                        variant="subtle"
                                    >
                                        {clipboard.copied ? (
                                            <PiCheck size={18} />
                                        ) : (
                                            <PiCopy size={18} />
                                        )}
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        }
                        rightSectionWidth={68}
                        styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
                        {...form.getInputProps('password')}
                    />

                    <DateTimePicker
                        clearable
                        description={t('brokers.expire-at-description')}
                        dropdownType="modal"
                        highlightToday
                        key={form.key('expireAt')}
                        label={t('brokers.expire-at')}
                        leftSection={<PiCalendarDuotone size="16px" />}
                        locale={i18n.language}
                        minDate={new Date()}
                        modalProps={{ centered: true }}
                        placeholder={t('brokers.never-expires')}
                        valueFormat="MMMM D, YYYY - HH:mm"
                        {...form.getInputProps('expireAt')}
                    />

                    <Textarea
                        autosize
                        key={form.key('description')}
                        label={t('common.field.description')}
                        maxRows={4}
                        minRows={2}
                        {...form.getInputProps('description')}
                    />

                    {isEdit && (
                        <Switch
                            checked={!form.getValues().isDisabled}
                            color="teal"
                            description={t('brokers.account-enabled-description')}
                            key={form.key('isDisabled')}
                            label={t('brokers.account-enabled')}
                            onChange={(event) =>
                                form.setFieldValue('isDisabled', !event.currentTarget.checked)
                            }
                        />
                    )}
                </Stack>
            </SectionCard.Section>
        </SectionCard.Root>
    )

    const limitsCard = (
        <SectionCard.Root>
            <SectionCard.Section>
                <BaseOverlayHeader
                    IconComponent={TbChartLine}
                    iconSize={20}
                    title={t('brokers.limits')}
                    titleOrder={5}
                />
            </SectionCard.Section>
            <SectionCard.Section>
                <Stack gap="md">
                    <TrafficLimitInput
                        description={t('brokers.traffic-quota-description')}
                        key={form.key('trafficLimitBytes')}
                        label={t('brokers.traffic-quota')}
                        leftSection={<TbChartLine size={16} />}
                        {...form.getInputProps('trafficLimitBytes')}
                    />

                    <NumberInput
                        allowDecimal={false}
                        allowNegative={false}
                        description={t('brokers.users-limit-description')}
                        key={form.key('usersLimit')}
                        label={t('brokers.users-limit')}
                        leftSection={<PiUsers size={16} />}
                        min={1}
                        placeholder={t('brokers.unlimited')}
                        {...form.getInputProps('usersLimit')}
                    />
                </Stack>
            </SectionCard.Section>
        </SectionCard.Root>
    )

    const accessCard = (
        <SectionCard.Root>
            <SectionCard.Section>
                <BaseOverlayHeader
                    IconComponent={TbShield}
                    iconSize={20}
                    title={t('brokers.access')}
                    titleOrder={5}
                />
            </SectionCard.Section>
            <SectionCard.Section>
                <Stack gap="md">
                    <InternalSquadsListWidget
                        description={t('brokers.internal-squads-description')}
                        filteredInternalSquads={filteredInternalSquads}
                        formKey={form.key('internalSquads')}
                        hideEditButton
                        label={t('common.field.internal-squads')}
                        searchQuery={squadSearch}
                        setSearchQuery={setSquadSearch}
                        {...form.getInputProps('internalSquads')}
                    />

                    <Group gap="sm" justify="space-between" wrap="nowrap">
                        <Stack gap={2}>
                            <Text fw={500} size="sm">
                                {t('brokers.external-squad')}
                            </Text>
                            <Text c="dimmed" size="xs">
                                {t('brokers.external-squad-description')}
                            </Text>
                        </Stack>
                        {broker?.externalSquad && (
                            <Button
                                leftSection={<TbWebhook size={16} />}
                                onClick={() =>
                                    showModal('externalSquads_externalSquadsDrawer', {
                                        uuid: broker.externalSquad!.uuid
                                    })
                                }
                                size="xs"
                                style={{ flexShrink: 0 }}
                                variant="light"
                            >
                                {broker.externalSquad.name}
                            </Button>
                        )}
                    </Group>
                </Stack>
            </SectionCard.Section>
        </SectionCard.Root>
    )

    return (
        <Modal
            {...modalProps}
            size="900px"
            title={
                <BaseOverlayHeader
                    IconComponent={PiHandshake}
                    title={broker ? broker.username : t('brokers.create-broker')}
                />
            }
        >
            <form onSubmit={handleSubmit}>
                <Group align="flex-start" gap="md" grow={false} wrap="wrap">
                    <Stack gap="md" style={{ flex: '1 1 380px' }}>
                        {accountCard}
                    </Stack>
                    <Stack gap="md" style={{ flex: '1 1 380px' }}>
                        {limitsCard}
                        {accessCard}
                    </Stack>
                </Group>

                <ModalFooter isMobile={isMobile}>
                    <Button
                        color="teal"
                        leftSection={<PiFloppyDiskDuotone size="16px" />}
                        loading={isCreating || isUpdating}
                        size="md"
                        type="submit"
                        variant="soft"
                    >
                        {t(isEdit ? 'common.action.save' : 'common.action.create')}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
})

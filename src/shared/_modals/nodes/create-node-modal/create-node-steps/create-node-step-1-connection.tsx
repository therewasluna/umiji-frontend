import {
    Anchor,
    Button,
    Code,
    Divider,
    Group,
    NumberInput,
    PasswordInput,
    Popover,
    SegmentedControl,
    Select,
    Stack,
    TagsInput,
    Text,
    TextInput,
    UnstyledButton
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateNodeCommand } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiArrowRight, PiTagDuotone } from 'react-icons/pi'
import { SiDocker } from 'react-icons/si'
import {
    TbCertificate,
    TbChevronDown,
    TbId,
    TbLock,
    TbMapPin,
    TbPackage,
    TbRocket,
    TbSettings,
    TbShieldLock,
    TbWorld
} from 'react-icons/tb'

import { useGetNodePlugins, useGetNodesTags } from '@shared/api/hooks'
import { CopyableFieldShared } from '@shared/ui/copyable-field/copyable-field'
import { getCountries } from '@shared/ui/forms/nodes/base-node-form/constants'
import { SelectInfraProviderShared } from '@shared/ui/infra-billing/select-infra-provider/select-infra-provider.shared'
import { TagInputPill } from '@shared/ui/tag-input-pill'

import { CopyDockerComposeWidget } from './copy-docker-compose.widget'

export type TCreateNodeMode = 'auto' | 'manual'

export interface ISshLogin {
    password: string
    port: number | string
}

interface IProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturnType<CreateNodeCommand.RequestBody, any>
    mode: TCreateNodeMode
    onModeChange: (mode: TCreateNodeMode) => void
    onNext: () => void
    onSshChange: (ssh: ISshLogin) => void
    port: number
    secretKey: string | undefined
    ssh: ISshLogin
}

export const CreateNodeStep1Connection = (props: IProps) => {
    const { form, mode, onModeChange, onNext, onSshChange, port, secretKey, ssh } = props
    const { t } = useTranslation()

    const isAuto = mode === 'auto'
    const [sshErrors, setSshErrors] = useState<{ password?: string; port?: string }>({})

    const { data: nodePlugins } = useGetNodePlugins()
    const { data: nodesTags } = useGetNodesTags()

    const [additionalOpened, setAdditionalOpened] = useState(false)

    const handleNext = async () => {
        const nameErrors = form.validateField('name')
        const countryCodeErrors = form.validateField('countryCode')
        const addressErrors = form.validateField('address')
        const portErrors = form.validateField('port')

        const sshPort = Number(ssh.port)
        const nextSshErrors = isAuto
            ? {
                  password: ssh.password ? undefined : t('node-install.password-required'),
                  port:
                      Number.isInteger(sshPort) && sshPort >= 1 && sshPort <= 65535
                          ? undefined
                          : t('node-install.ssh-port')
              }
            : {}
        setSshErrors(nextSshErrors)

        if (
            nameErrors.hasError ||
            countryCodeErrors.hasError ||
            addressErrors.hasError ||
            portErrors.hasError ||
            nextSshErrors.password ||
            nextSshErrors.port
        ) {
            return
        }

        onNext()
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                handleNext()
            }}
        >
            <Stack gap="xs" mih={400}>
                <SegmentedControl
                    data={[
                        {
                            value: 'auto',
                            label: (
                                <Group gap={8} justify="center" wrap="nowrap">
                                    <TbRocket size={16} />
                                    <span>{t('node-install.mode-auto')}</span>
                                </Group>
                            )
                        },
                        {
                            value: 'manual',
                            label: (
                                <Group gap={8} justify="center" wrap="nowrap">
                                    <SiDocker size={15} />
                                    <span>{t('node-install.mode-manual')}</span>
                                </Group>
                            )
                        }
                    ]}
                    fullWidth
                    mb={6}
                    onChange={(value) => onModeChange(value as TCreateNodeMode)}
                    value={mode}
                />

                {isAuto ? (
                    <Text c="dimmed" size="sm">
                        {t('node-install.auto-description')}
                    </Text>
                ) : (
                    <Text c="dimmed" size="sm">
                        {t('create-node-step-1-connection.copy-the')}{' '}
                        <Code c="white" color="gray.8">
                            docker-compose.yml
                        </Code>{' '}
                        {t('create-node-step-1-connection.content-for-the-umiji-node-below')}{' '}
                        <Anchor
                            fw="700"
                            href="https://github.com/therewasluna/umiji"
                            inherit
                            rel="noopener noreferrer"
                            target="_blank"
                            underline="hover"
                        >
                            {t('create-node-step-1-connection.learn-more')}
                        </Anchor>
                    </Text>
                )}

                <Divider />
                <Stack gap="md">
                    {!isAuto && (
                        <CopyableFieldShared
                            label={t('create-node-step-1-connection.secret-key-secret-key')}
                            leftSection={<TbCertificate size={16} />}
                            size="sm"
                            value={secretKey ?? ''}
                        />
                    )}

                    <TextInput
                        key={form.key('name')}
                        label={t('base-node-form.internal-name')}
                        leftSection={<TbId size={16} />}
                        placeholder={t('base-node-form.internal-name-placeholder')}
                        required
                        size="sm"
                        styles={{
                            label: { fontWeight: 500 }
                        }}
                        {...form.getInputProps('name')}
                    />

                    <Select
                        key={form.key('countryCode')}
                        label={t('base-node-form.country')}
                        {...form.getInputProps('countryCode')}
                        data={getCountries(t)}
                        leftSection={<TbMapPin size={16} />}
                        placeholder={t('base-node-form.select-country')}
                        searchable
                        size="sm"
                        styles={{
                            label: { fontWeight: 500 }
                        }}
                    />

                    <Group align="flex-start" gap="xs" w="100%">
                        <TextInput
                            key={form.key('address')}
                            label={
                                isAuto
                                    ? t('node-install.server-ip')
                                    : t('create-node-step-1-connection.domain-or-ip')
                            }
                            {...form.getInputProps('address')}
                            leftSection={<TbWorld size={16} />}
                            placeholder="192.168.1.1"
                            required
                            size="sm"
                            styles={{
                                label: { fontWeight: 500 }
                            }}
                            w="70%"
                        />

                        <NumberInput
                            key={form.key('port')}
                            label={t('create-node-step-1-connection.node-port')}
                            {...form.getInputProps('port')}
                            allowDecimal={false}
                            allowNegative={false}
                            clampBehavior="strict"
                            decimalScale={0}
                            hideControls
                            max={65535}
                            placeholder="2222"
                            required
                            size="sm"
                            styles={{
                                label: { fontWeight: 500 }
                            }}
                            w="25%"
                        />
                    </Group>

                    {isAuto && (
                        <>
                            <Group align="flex-start" gap="xs" w="100%">
                                <PasswordInput
                                    autoComplete="new-password"
                                    error={sshErrors.password}
                                    label={t('node-install.root-password')}
                                    leftSection={<TbLock size={16} />}
                                    name="server-root-password"
                                    onChange={(event) => {
                                        onSshChange({ ...ssh, password: event.currentTarget.value })
                                        setSshErrors((errors) => ({
                                            ...errors,
                                            password: undefined
                                        }))
                                    }}
                                    required
                                    size="sm"
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                    value={ssh.password}
                                    w="70%"
                                />

                                <NumberInput
                                    allowDecimal={false}
                                    allowNegative={false}
                                    clampBehavior="strict"
                                    decimalScale={0}
                                    error={sshErrors.port}
                                    hideControls
                                    label={t('node-install.ssh-port')}
                                    max={65535}
                                    onChange={(value) => {
                                        onSshChange({ ...ssh, port: value })
                                        setSshErrors((errors) => ({ ...errors, port: undefined }))
                                    }}
                                    placeholder="22"
                                    required
                                    size="sm"
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                    value={ssh.port}
                                    w="25%"
                                />
                            </Group>

                            <Group c="dimmed" gap={6} wrap="nowrap">
                                <TbShieldLock size={14} style={{ flexShrink: 0 }} />
                                <Text inherit size="xs">
                                    {t('node-install.password-note')}
                                </Text>
                            </Group>
                        </>
                    )}

                    <Popover
                        closeOnClickOutside={false}
                        onChange={setAdditionalOpened}
                        opened={additionalOpened}
                        position="bottom"
                        shadow="md"
                        width={340}
                        withArrow
                    >
                        <Divider
                            label={
                                <Popover.Target>
                                    <UnstyledButton
                                        c="dimmed"
                                        onClick={() => setAdditionalOpened((opened) => !opened)}
                                        px={4}
                                        type="button"
                                    >
                                        <Group gap={6}>
                                            <TbSettings size={16} />
                                            <Text fw={500} size="sm">
                                                {t(
                                                    'create-node-step-1-connection.additional-options'
                                                )}
                                            </Text>
                                            <TbChevronDown
                                                size={14}
                                                style={{
                                                    transform: additionalOpened
                                                        ? 'rotate(180deg)'
                                                        : undefined,
                                                    transition: 'transform 200ms ease'
                                                }}
                                            />
                                        </Group>
                                    </UnstyledButton>
                                </Popover.Target>
                            }
                            labelPosition="center"
                        />

                        <Popover.Dropdown>
                            <Stack gap="md">
                                <SelectInfraProviderShared
                                    selectedInfraProviderUuid={form.getValues().providerUuid}
                                    setSelectedInfraProviderUuid={(providerUuid) => {
                                        form.setValues({ providerUuid })
                                        form.setTouched({ providerUuid: true })
                                        form.setDirty({ providerUuid: true })
                                    }}
                                />

                                <Select
                                    key={form.key('activePluginUuid')}
                                    label={t('node-vitals.card.plugin')}
                                    {...form.getInputProps('activePluginUuid')}
                                    allowDeselect
                                    clearable
                                    data={(nodePlugins?.nodePlugins ?? []).map((nodePlugin) => ({
                                        label: nodePlugin.name,
                                        value: nodePlugin.uuid
                                    }))}
                                    description={t(
                                        'node-vitals.card.review-documentation-for-more-information'
                                    )}
                                    leftSection={<TbPackage size={16} />}
                                    nothingFoundMessage={t('node-vitals.card.nothing-found')}
                                    placeholder={t('node-vitals.card.select-plugin')}
                                    searchable
                                    size="sm"
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                />

                                <TagsInput
                                    clearable
                                    data={nodesTags?.tags || []}
                                    key={form.key('tags')}
                                    label={t('common.field.tags')}
                                    leftSection={<PiTagDuotone size="16px" />}
                                    maxTags={10}
                                    placeholder={t(
                                        'create-node-step-1-connection.enter-tags-comma-space-semicolon'
                                    )}
                                    size="sm"
                                    splitChars={[',', ' ', ';']}
                                    {...form.getInputProps('tags')}
                                    error={
                                        Object.keys(form.errors)
                                            .filter((key) => key.startsWith('tags.'))
                                            .map((key) => form.errors[key])
                                            .join(', ') || form.getInputProps('tags').error
                                    }
                                    renderPill={({ value, onRemove }) => (
                                        <TagInputPill onRemove={onRemove} value={value} />
                                    )}
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                />
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                </Stack>

                <Stack gap="xs" mt="auto">
                    {!isAuto && <CopyDockerComposeWidget port={port} />}

                    <Group justify="flex-end" mt="auto">
                        <Button
                            color="teal"
                            rightSection={<PiArrowRight size={18} />}
                            size="md"
                            type="submit"
                        >
                            {t('common.action.next')}
                        </Button>
                    </Group>
                </Stack>
            </Stack>
        </form>
    )
}

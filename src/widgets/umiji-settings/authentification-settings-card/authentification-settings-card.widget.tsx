import {
    ActionIcon,
    Badge,
    Button,
    Checkbox,
    Code,
    Collapse,
    Group,
    PasswordInput,
    Stack,
    Switch,
    SwitchProps,
    TagsInput,
    Text,
    TextInput,
    Tooltip
} from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { GetUmijiSettingsCommand, UpdateUmijiSettingsCommand } from '@umiji/backend-contract'
import { TFunction } from 'i18next'
import { ComponentType, ReactNode, useEffect, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { BiLogoGithub, BiLogoTelegram } from 'react-icons/bi'
import { FaYandex } from 'react-icons/fa'
import { SiKeycloak } from 'react-icons/si'
import {
    TbAlertCircle,
    TbChevronDown,
    TbCircleDot,
    TbFingerprint,
    TbHelp,
    TbHash,
    TbId,
    TbLink,
    TbMail,
    TbWorld,
    TbKey,
    TbPassword,
    TbShieldCheck
} from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { THelpDrawerAvailableScreen } from '@shared/_modals/universal/help-drawer/help-drawer.types'
import { queryClient } from '@shared/api'
import { QueryKeys } from '@shared/api/hooks/keys-factory'
import { useUpdateUmijiSettings } from '@shared/api/hooks/umiji-settings/umiji-settings.mutation.hooks'
import { DimmedText, HelpPopover } from '@shared/ui/forms/hosts/base-host-form/options/fields/help'
import { PocketidLogo } from '@shared/ui/logos'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { TagInputPill } from '@shared/ui/tag-input-pill'
import { handleFormErrors } from '@shared/utils/misc'

import classes from './authentification-settings-card.module.css'

function authFieldLabel(id: string, label: string, description: string) {
    return (
        <Group component="span" gap={6} wrap="nowrap">
            <label htmlFor={id}>{label}</label>
            {description && (
                <HelpPopover>
                    <DimmedText>{description}</DimmedText>
                </HelpPopover>
            )}
        </Group>
    )
}

const fieldIcons = {
    clientId: TbId,
    clientSecret: TbKey,
    plainDomain: TbWorld,
    allowedEmails: TbMail,
    realm: TbShieldCheck,
    frontendDomain: TbWorld,
    keycloakDomain: TbWorld,
    authorizationUrl: TbLink,
    tokenUrl: TbLink,
    allowedIds: TbHash,
    withPkce: TbShieldCheck
}

interface IProps {
    oauth2Settings: NonNullable<GetUmijiSettingsCommand.Response['response']['oauth2Settings']>
    passkeySettings: NonNullable<GetUmijiSettingsCommand.Response['response']['passkeySettings']>
    passwordSettings: NonNullable<GetUmijiSettingsCommand.Response['response']['passwordSettings']>
}

const getOAuth2ProvidersConfig = (t: TFunction) =>
    [
        {
            key: 'telegram' as const,
            title: 'Telegram',
            Icon: BiLogoTelegram,
            fields: ['clientId', 'clientSecret', 'frontendDomain', 'allowedIds'] as const
        },
        {
            key: 'github' as const,
            title: 'GitHub',
            Icon: BiLogoGithub,
            fields: ['clientId', 'clientSecret', 'allowedEmails'] as const
        },
        {
            key: 'pocketid' as const,
            title: 'PocketID',
            Icon: PocketidLogo,
            fields: [
                'clientId',
                'clientSecret',
                'plainDomain',
                'frontendDomain',
                'allowedEmails'
            ] as const
        },
        {
            key: 'yandex' as const,
            title: 'Yandex',
            Icon: FaYandex,
            fields: ['clientId', 'clientSecret', 'allowedEmails'] as const
        },
        {
            key: 'keycloak' as const,
            title: 'Keycloak',
            Icon: SiKeycloak,
            fields: [
                'clientId',
                'clientSecret',
                'realm',
                'frontendDomain',
                'keycloakDomain',
                'allowedEmails'
            ] as const
        },
        {
            key: 'generic' as const,
            title: t('authentification-settings-card.generic-oauth2'),
            Icon: TbKey,
            fields: [
                'clientId',
                'clientSecret',
                'frontendDomain',
                'authorizationUrl',
                'tokenUrl',
                'allowedEmails',
                'withPkce'
            ] as const
        }
    ] as const

const getFieldConfig = (t: TFunction) =>
    ({
        clientId: {
            label: t('auth-settings.fields.clientId.label'),
            description: t('auth-settings.fields.clientId.description'),
            placeholder: t('auth-settings.fields.clientId.placeholder'),
            type: 'text' as const
        },
        clientSecret: {
            label: t('auth-settings.fields.clientSecret.label'),
            description: t('auth-settings.fields.clientSecret.description'),
            placeholder: t('auth-settings.fields.clientSecret.placeholder'),
            type: 'text' as const
        },
        plainDomain: {
            label: t('auth-settings.fields.plainDomain.label'),
            description: t('auth-settings.fields.plainDomain.description'),
            placeholder: t('auth-settings.fields.plainDomain.placeholder'),
            type: 'text' as const
        },
        allowedEmails: {
            label: t('auth-settings.fields.allowedEmails.label'),
            description: t('auth-settings.fields.allowedEmails.description'),
            placeholder: t('auth-settings.fields.allowedEmails.placeholder'),
            type: 'tags' as const
        },
        realm: {
            label: t('auth-settings.fields.realm.label'),
            description: t('auth-settings.fields.realm.description'),
            placeholder: 'master',
            type: 'text' as const
        },
        frontendDomain: {
            label: t('auth-settings.passkey.rpId.label'),
            description: t('auth-settings.passkey.rpId.description'),
            placeholder: 'example.com',
            type: 'text' as const
        },
        keycloakDomain: {
            label: t('auth-settings.fields.keycloakDomain.label'),
            description: t('auth-settings.fields.keycloakDomain.description'),
            placeholder: 'keycloak.example.com',
            type: 'text' as const
        },
        authorizationUrl: {
            label: t('authentification-settings-card.authorization-url'),
            description: t(
                'authentification-settings-card.authorization-url-for-the-oauth2-provider'
            ),
            placeholder: 'https://example.com/oauth2/authorize',
            type: 'text' as const
        },
        tokenUrl: {
            label: t('authentification-settings-card.token-url'),
            description: t('authentification-settings-card.token-url-for-the-oauth2-provider'),
            placeholder: 'https://example.com/oauth2/token',
            type: 'text' as const
        },
        withPkce: {
            label: t('authentification-settings-card.with-pkce'),
            description: '',
            placeholder: 'false',
            type: 'checkbox' as const
        },
        allowedIds: {
            label: t('auth-settings.telegram.adminIds.label'),
            description: t('auth-settings.telegram.adminIds.placeholder'),
            placeholder: t('auth-settings.telegram.adminIds.placeholder'),
            type: 'tags' as const
        }
    }) as const

interface IAuthMethodRowProps {
    /** What opens under the row; a method with nothing to configure has no toggle. */
    children?: ReactNode
    hasErrors?: boolean
    help?: THelpDrawerAvailableScreen
    Icon: ComponentType<{ size?: number | string }>
    isEnabled: boolean
    switchProps: SwitchProps
    title: string
}

function AuthMethodGroupLabel({ label }: { label: string }) {
    return (
        <Text className={classes.groupLabel} component="h3">
            {label}
        </Text>
    )
}

function AuthMethodRow(props: IAuthMethodRowProps) {
    const { children, hasErrors, help, Icon, isEnabled, switchProps, title } = props
    const { t } = useTranslation()
    const [opened, { open, toggle }] = useDisclosure(false)
    const panelId = useId()

    useEffect(() => {
        if (hasErrors) open()
    }, [hasErrors, open])

    return (
        <section
            className={classes.method}
            data-enabled={isEnabled || undefined}
            data-open={opened || undefined}
        >
            <div className={classes.head}>
                <div className={classes.summary}>
                    <span aria-hidden className={classes.providerIcon}>
                        <Icon size={24} />
                    </span>
                    <div className={classes.identity}>
                        <Text className={classes.title}>{title}</Text>
                        <Text className={classes.status}>
                            {t(isEnabled ? 'auth-settings.enabled' : 'auth-settings.disabled')}
                        </Text>
                    </div>
                </div>

                {children && (
                    <Tooltip
                        label={`${t('auth-settings.configure')}: ${title}`}
                        openDelay={300}
                        withArrow
                    >
                        <ActionIcon
                            aria-controls={panelId}
                            aria-expanded={opened}
                            aria-label={`${t('auth-settings.configure')}: ${title}`}
                            className={classes.configure}
                            color={opened ? 'rose' : 'gray'}
                            onClick={toggle}
                            radius="xl"
                            size={44}
                            type="button"
                            variant={opened ? 'light' : 'subtle'}
                        >
                            <TbChevronDown aria-hidden className={classes.chevron} size={18} />
                        </ActionIcon>
                    </Tooltip>
                )}

                {!children && help && (
                    <ActionIcon
                        aria-label={t('help-action-icon.shared.help-article')}
                        color="gray"
                        onClick={() => showModal('helpDrawer', { screen: help })}
                        size={44}
                        variant="subtle"
                    >
                        <TbHelp size={18} />
                    </ActionIcon>
                )}
                <Switch
                    aria-label={title}
                    classNames={{ root: classes.switchRoot, body: classes.switchBody }}
                    size="md"
                    {...switchProps}
                    onChange={(event) => {
                        switchProps.onChange?.(event)
                        if (event.currentTarget.checked && children) open()
                    }}
                />
            </div>

            {children && (
                <Collapse expanded={opened} id={panelId}>
                    <div aria-label={title} className={classes.panel} role="region">
                        {children}
                        {help && (
                            <Button
                                className={classes.help}
                                color="gray"
                                leftSection={<TbHelp size={16} />}
                                mt="md"
                                onClick={() => showModal('helpDrawer', { screen: help })}
                                size="compact-sm"
                                variant="subtle"
                            >
                                {t('help-action-icon.shared.help-article')}
                            </Button>
                        )}
                    </div>
                </Collapse>
            )}
        </section>
    )
}

export const AuthentificationSettingsCardWidget = (props: IProps) => {
    const { passkeySettings, passwordSettings, oauth2Settings } = props
    const { t } = useTranslation()

    const form = useForm<NonNullable<UpdateUmijiSettingsCommand.RequestBody>>({
        name: 'auth-settings',
        mode: 'controlled',
        validate: schemaResolver(
            UpdateUmijiSettingsCommand.RequestBodySchema.pick({
                passkeySettings: true,
                passwordSettings: true,
                oauth2Settings: true
            })
        ),
        initialValues: {
            passkeySettings: {
                enabled: passkeySettings.enabled,
                rpId: passkeySettings.rpId,
                origin: passkeySettings.origin
            },
            passwordSettings: {
                enabled: passwordSettings.enabled
            },
            oauth2Settings: {
                github: oauth2Settings.github,
                pocketid: oauth2Settings.pocketid,
                yandex: oauth2Settings.yandex,
                keycloak: oauth2Settings.keycloak,
                generic: oauth2Settings.generic,
                telegram: oauth2Settings.telegram
            }
        }
    })

    const { mutate: updateSettings, isPending: isUpdatePending } = useUpdateUmijiSettings({
        mutationFns: {
            onSuccess(data) {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.umijiSettings.getUmijiSettings.queryKey
                })

                form.setValues({
                    passkeySettings: data.passkeySettings!,
                    passwordSettings: data.passwordSettings!,
                    oauth2Settings: data.oauth2Settings!
                })

                form.resetDirty()
                form.resetTouched()
            },
            onError(error) {
                handleFormErrors(form, error)

                modals.open({
                    title: (
                        <BaseOverlayHeader
                            IconComponent={TbAlertCircle}
                            title={t('auth-settings.error-modal.title')}
                        />
                    ),
                    centered: true,
                    children: (
                        <Stack gap="md">
                            <Text c="dimmed" size="sm">
                                {t('auth-settings.error-modal.description')}
                            </Text>
                            <Code p="md">
                                <Text c="red.1" fw={500} size="sm">
                                    {error instanceof Error
                                        ? error.message
                                        : t('auth-settings.error-modal.unknown-error')}
                                </Text>
                            </Code>
                            <Button
                                color="red"
                                fullWidth
                                onClick={() => modals.closeAll()}
                                variant="light"
                            >
                                {t('common.action.close')}
                            </Button>
                        </Stack>
                    )
                })
            }
        }
    })

    const handleSubmit = form.onSubmit((values) => {
        updateSettings({
            variables: {
                passkeySettings: values.passkeySettings,
                passwordSettings: values.passwordSettings,
                oauth2Settings: values.oauth2Settings
            }
        })
    })

    const OAUTH2_PROVIDERS = getOAuth2ProvidersConfig(t)
    const FIELD_CONFIG = getFieldConfig(t)

    const values = form.getValues()

    const enabledMethods = [
        values.passwordSettings?.enabled,
        values.passkeySettings?.enabled,
        ...OAUTH2_PROVIDERS.map((provider) => values.oauth2Settings?.[provider.key]?.enabled)
    ].filter(Boolean).length

    const totalMethods = OAUTH2_PROVIDERS.length + 2

    const renderOAuth2Provider = (config: ReturnType<typeof getOAuth2ProvidersConfig>[number]) => (
        <AuthMethodRow
            hasErrors={Object.keys(form.errors).some((key) =>
                key.startsWith(`oauth2Settings.${config.key}.`)
            )}
            help={`AUTH_METHODS_${config.key.toUpperCase()}` as THelpDrawerAvailableScreen}
            Icon={config.Icon}
            isEnabled={values.oauth2Settings?.[config.key]?.enabled ?? false}
            key={config.key}
            switchProps={form.getInputProps(`oauth2Settings.${config.key}.enabled`, {
                type: 'checkbox'
            })}
            title={config.title}
        >
            <Stack gap="md">
                {config.fields.map((fieldKey: keyof ReturnType<typeof getFieldConfig>) => {
                    const fieldConfig = FIELD_CONFIG[fieldKey]
                    const formPath = `oauth2Settings.${config.key}.${fieldKey}` as const
                    const id = `auth-settings-${config.key}-${fieldKey}`
                    const label = authFieldLabel(id, fieldConfig.label, fieldConfig.description)

                    if (fieldConfig.type === 'tags') {
                        return (
                            <TagsInput
                                clearable
                                leftSection={
                                    fieldKey === 'allowedIds' ? (
                                        <TbHash size={16} />
                                    ) : (
                                        <TbMail size={16} />
                                    )
                                }
                                id={id}
                                key={form.key(formPath)}
                                label={label}
                                labelProps={{ labelElement: 'div' }}
                                placeholder={fieldConfig.placeholder}
                                splitChars={[',', ' ', ';']}
                                {...form.getInputProps(formPath)}
                                renderPill={({ value, onRemove }) => (
                                    <TagInputPill onRemove={onRemove} value={value} />
                                )}
                            />
                        )
                    }

                    if (fieldConfig.type === 'checkbox') {
                        return (
                            <Checkbox
                                classNames={{ body: classes.checkboxBody }}
                                key={form.key(formPath)}
                                label={fieldConfig.label}
                                {...form.getInputProps(formPath, {
                                    type: 'checkbox'
                                })}
                            />
                        )
                    }

                    if (fieldKey === 'clientSecret') {
                        return (
                            <PasswordInput
                                autoComplete="off"
                                leftSection={<TbKey size={16} />}
                                id={id}
                                key={form.key(formPath)}
                                label={label}
                                labelProps={{ labelElement: 'div' }}
                                placeholder={fieldConfig.placeholder}
                                {...form.getInputProps(formPath)}
                            />
                        )
                    }

                    const FieldIcon = fieldIcons[fieldKey]

                    return (
                        <TextInput
                            autoComplete="off"
                            leftSection={<FieldIcon size={16} />}
                            id={id}
                            key={form.key(formPath)}
                            label={label}
                            labelProps={{ labelElement: 'div' }}
                            placeholder={fieldConfig.placeholder}
                            {...form.getInputProps(formPath)}
                        />
                    )
                })}
            </Stack>
        </AuthMethodRow>
    )

    return (
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    actions={
                        <Badge
                            color="rose"
                            leftSection={<TbShieldCheck size={12} />}
                            size="md"
                            title={t('auth-settings.header.active-methods')}
                            variant="light"
                        >
                            {t('auth-settings.header.active-count', {
                                active: enabledMethods,
                                total: totalMethods
                            })}
                        </Badge>
                    }
                    description={t('auth-settings.header.description')}
                    title={t('auth-settings.header.title')}
                />

                <SettingsCardShared.Content>
                    <div className={classes.list}>
                        <AuthMethodGroupLabel label={t('auth-settings.groups.built-in')} />

                        <AuthMethodRow
                            help="AUTH_METHODS_PASSWORD"
                            Icon={TbPassword}
                            isEnabled={values.passwordSettings?.enabled ?? false}
                            switchProps={form.getInputProps('passwordSettings.enabled', {
                                type: 'checkbox'
                            })}
                            title={t('auth-settings.password.title')}
                        />

                        <AuthMethodRow
                            hasErrors={Object.keys(form.errors).some((key) =>
                                key.startsWith('passkeySettings.')
                            )}
                            Icon={TbFingerprint}
                            isEnabled={values.passkeySettings?.enabled ?? false}
                            switchProps={form.getInputProps('passkeySettings.enabled', {
                                type: 'checkbox'
                            })}
                            title={t('auth-settings.passkey.title')}
                        >
                            <Stack gap="md">
                                <TextInput
                                    id="auth-settings-passkey-rpId"
                                    key={form.key('passkeySettings.rpId')}
                                    label={authFieldLabel(
                                        'auth-settings-passkey-rpId',
                                        t('auth-settings.passkey.rpId.label'),
                                        t('auth-settings.passkey.rpId.description')
                                    )}
                                    labelProps={{ labelElement: 'div' }}
                                    leftSection={<TbWorld size={16} />}
                                    placeholder="example.com"
                                    {...form.getInputProps('passkeySettings.rpId')}
                                />

                                <TextInput
                                    id="auth-settings-passkey-origin"
                                    key={form.key('passkeySettings.origin')}
                                    label={authFieldLabel(
                                        'auth-settings-passkey-origin',
                                        t('auth-settings.passkey.origin.label'),
                                        t('auth-settings.passkey.origin.description')
                                    )}
                                    labelProps={{ labelElement: 'div' }}
                                    leftSection={<TbLink size={16} />}
                                    placeholder="https://api.example.com"
                                    {...form.getInputProps('passkeySettings.origin')}
                                />

                                <Group justify="flex-start">
                                    <Button
                                        color="gray"
                                        disabled={!values.passkeySettings?.enabled}
                                        leftSection={<TbFingerprint size={18} />}
                                        onClick={() => showModal('umijiSettings_passkeysDrawer')}
                                        size="sm"
                                        variant="light"
                                    >
                                        {t('auth-settings.passkey.manage-button')}
                                    </Button>
                                </Group>
                            </Stack>
                        </AuthMethodRow>

                        <AuthMethodGroupLabel label={t('auth-settings.groups.oauth2')} />

                        {OAUTH2_PROVIDERS.map(renderOAuth2Provider)}
                    </div>
                </SettingsCardShared.Content>

                <SettingsCardShared.Bottom>
                    <Group className={classes.footer} justify="space-between" wrap="nowrap">
                        <Group className={classes.unsaved} aria-live="polite" gap={6} wrap="nowrap">
                            {form.isDirty() && (
                                <>
                                    <TbCircleDot aria-hidden size={14} />
                                    <Text component="span" size="xs">
                                        {t('auth-settings.unsaved-changes')}
                                    </Text>
                                </>
                            )}
                        </Group>

                        <Button
                            color="rose"
                            disabled={!form.isDirty()}
                            loading={isUpdatePending}
                            size="md"
                            type="submit"
                            variant="filled"
                        >
                            {t('common.action.save')}
                        </Button>
                    </Group>
                </SettingsCardShared.Bottom>
            </SettingsCardShared.Container>
        </form>
    )
}

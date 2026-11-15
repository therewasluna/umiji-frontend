import {
    ActionIcon,
    Alert,
    Anchor,
    Code,
    CopyButton,
    Group,
    List,
    Stack,
    Text,
    TextInput,
    Tooltip
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateUserCommand, GetUserByIdCommand, UpdateUserCommand } from '@umiji/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCheck, PiCopy, PiTelegramLogoDuotone } from 'react-icons/pi'
import { TbInfoCircle, TbRefresh } from 'react-icons/tb'

import { IAssignableInternalSquads, useGetTelegramLinksByUserId } from '@shared/api/hooks'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'

const generateHex = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')

const hexInputStyles = {
    input: { fontFamily: 'var(--mantine-font-family-monospace)' },
    label: { fontWeight: 500 }
}

const CopyValue = ({ value }: { value: string }) => (
    <Group gap={6} wrap="nowrap">
        <Code style={{ overflowWrap: 'anywhere' }}>{value}</Code>
        <CopyButton timeout={2000} value={value}>
            {({ copied, copy }) => (
                <ActionIcon
                    aria-label={value}
                    color={copied ? 'teal' : 'gray'}
                    onClick={copy}
                    size="sm"
                    variant="subtle"
                >
                    {copied ? <PiCheck size="14px" /> : <PiCopy size="14px" />}
                </ActionIcon>
            )}
        </CopyButton>
    </Group>
)

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    internalSquads: IAssignableInternalSquads | undefined
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
    /** The saved user. Without one, the form is still creating them. */
    user?: GetUserByIdCommand.Response['response']
}

export function TelegramProxyCard<
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(props: IProps<T>) {
    const { t } = useTranslation()

    const { cardVariants, motionWrapper, form, internalSquads, user } = props

    const MotionWrapper = motionWrapper

    const [selectedSquads, setSelectedSquads] = useState<string[]>(
        () => user?.activeInternalSquads.map((squad) => squad.uuid) ?? []
    )

    form.watch('activeInternalSquads', ({ value }) => setSelectedSquads(value ?? []))

    const hasTelegramProxy = internalSquads?.internalSquads.some(
        (squad) =>
            selectedSquads.includes(squad.uuid) &&
            squad.inbounds?.some((inbound) => inbound.type === 'mtproto')
    )

    const { data: telegramLinks } = useGetTelegramLinksByUserId({
        route: { userId: user?.id ?? 0 },
        rQueryParams: { enabled: Boolean(user && hasTelegramProxy) }
    })

    if (!hasTelegramProxy) return null

    const proxies = (telegramLinks?.links ?? []).map((link) => {
        const params = new URLSearchParams(link.split('?')[1])

        return { link, address: `${params.get('server')}:${params.get('port')}` }
    })

    return (
        <MotionWrapper variants={cardVariants}>
            <SectionCard.Root>
                <SectionCard.Section>
                    <BaseOverlayHeader
                        IconComponent={PiTelegramLogoDuotone}
                        iconSize={20}
                        title={t('telegram-proxy-card.title')}
                        titleOrder={5}
                    />
                </SectionCard.Section>

                <SectionCard.Section>
                    <Stack gap="md">
                        <TextInput
                            description={t('telegram-proxy-card.secret-description')}
                            key={form.key('mtprotoSecret')}
                            label={t('telegram-proxy-card.secret')}
                            maxLength={32}
                            rightSection={
                                <Tooltip label={t('telegram-proxy-card.generate')}>
                                    <ActionIcon
                                        aria-label={t('telegram-proxy-card.generate')}
                                        color="gray"
                                        onClick={() =>
                                            (
                                                form as UseFormReturnType<UpdateUserCommand.RequestBody>
                                            ).setFieldValue('mtprotoSecret', generateHex())
                                        }
                                        variant="subtle"
                                    >
                                        <TbRefresh size="16px" />
                                    </ActionIcon>
                                </Tooltip>
                            }
                            styles={hexInputStyles}
                            {...form.getInputProps('mtprotoSecret')}
                        />

                        <TextInput
                            description={t('telegram-proxy-card.ad-tag-description')}
                            key={form.key('mtprotoAdTag')}
                            label={t('telegram-proxy-card.ad-tag')}
                            maxLength={32}
                            styles={hexInputStyles}
                            {...form.getInputProps('mtprotoAdTag')}
                        />

                        {!user && (
                            <Alert color="gray" icon={<TbInfoCircle size="16px" />} variant="light">
                                {t('telegram-proxy-card.after-create')}
                            </Alert>
                        )}

                        {user && proxies.length === 0 && (
                            <Alert
                                color="yellow"
                                icon={<TbInfoCircle size="16px" />}
                                variant="light"
                            >
                                {t('telegram-proxy-card.no-address')}
                            </Alert>
                        )}

                        {user && proxies.length > 0 && (
                            <Stack gap="xs">
                                <Text fw={500} size="sm">
                                    {t('telegram-proxy-card.proxy-link')}
                                </Text>
                                {proxies.map(({ link }) => (
                                    <CopyValue key={link} value={link} />
                                ))}

                                <Text fw={500} mt="xs" size="sm">
                                    {t('telegram-proxy-card.register-title')}
                                </Text>
                                <List size="sm" spacing="xs" type="ordered">
                                    <List.Item>
                                        <Anchor
                                            href="https://t.me/MTProxybot"
                                            rel="noreferrer"
                                            size="sm"
                                            target="_blank"
                                        >
                                            {t('telegram-proxy-card.step-open')}
                                        </Anchor>
                                    </List.Item>
                                    <List.Item>
                                        <Stack gap={4}>
                                            {t('telegram-proxy-card.step-address')}
                                            {proxies.map(({ address }) => (
                                                <CopyValue key={address} value={address} />
                                            ))}
                                        </Stack>
                                    </List.Item>
                                    <List.Item>
                                        <Stack gap={4}>
                                            {t('telegram-proxy-card.step-secret')}
                                            <CopyValue value={user.mtprotoSecret} />
                                        </Stack>
                                    </List.Item>
                                    <List.Item>{t('telegram-proxy-card.step-tag')}</List.Item>
                                    <List.Item>{t('telegram-proxy-card.step-channel')}</List.Item>
                                </List>
                            </Stack>
                        )}
                    </Stack>
                </SectionCard.Section>
            </SectionCard.Root>
        </MotionWrapper>
    )
}

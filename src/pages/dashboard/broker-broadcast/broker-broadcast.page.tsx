import {
    Badge,
    Button,
    FileInput,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Textarea
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { BROKER_BOT_BROADCAST_MAX_IMAGE_BYTES } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbHistory, TbPhoto, TbSend, TbSpeakerphone } from 'react-icons/tb'

import { useCreateBrokerBotBroadcast, useGetBrokerBotBroadcasts } from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { SettingsCardShared } from '@shared/ui/settings-card'

const readBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })

/** The owner's message to every customer of every connected broker bot. */
export function BrokerBroadcastPage() {
    const { t } = useTranslation()

    const [caption, setCaption] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [error, setError] = useState<null | string>(null)

    const { data } = useGetBrokerBotBroadcasts()
    const isSending = !!data?.broadcasts.some((b) => b.status === 'sending')
    // Poll only while a delivery is running.
    useGetBrokerBotBroadcasts({ rQueryParams: { refetchInterval: isSending ? 2_000 : false } })

    const { mutate: broadcast, isPending } = useCreateBrokerBotBroadcast({
        mutationFns: {
            onSuccess: () => {
                setCaption('')
                setImage(null)
            }
        }
    })

    if (!data) return <LoadingScreen />

    const handleSend = () => {
        const text = caption.trim()
        if (!text && !image) return setError(t('broker-bot.broadcast.error-empty'))
        if (text.length > (image ? 1024 : 4096))
            return setError(t('broker-bot.broadcast.error-too-long'))
        if (image && image.size > BROKER_BOT_BROADCAST_MAX_IMAGE_BYTES)
            return setError(t('broker-bot.broadcast.error-image-size'))
        setError(null)

        modals.openConfirmModal({
            title: t('broker-bot.broadcast.send'),
            children: t('broker-bot.broadcast.confirm', { count: data.audience }),
            labels: { confirm: t('broker-bot.broadcast.send'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'teal', variant: 'soft' },
            centered: true,
            onConfirm: async () =>
                broadcast({
                    variables: {
                        caption: text || null,
                        image: image
                            ? {
                                  fileName: image.name,
                                  mimeType: image.type,
                                  base64: await readBase64(image)
                              }
                            : null
                    }
                })
        })
    }

    return (
        <Page title={t('broker-bot.broadcast.title')}>
            <PageHeaderShared
                description={t('broker-bot.broadcast.description')}
                icon={<TbSpeakerphone size={24} />}
                title={t('broker-bot.broadcast.title')}
            />

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" style={{ alignItems: 'start' }}>
                <SettingsCardShared.Container>
                    <SettingsCardShared.Header
                        description={t('broker-bot.broadcast.audience', { count: data.audience })}
                        icon={<TbSend size={24} />}
                        iconColor="teal"
                        iconVariant="soft"
                        title={t('broker-bot.broadcast.new')}
                    />
                    <SettingsCardShared.Content>
                        <Stack gap="md">
                            <Textarea
                                autosize
                                label={t('broker-bot.broadcast.message')}
                                maxLength={4096}
                                minRows={4}
                                onChange={(e) => setCaption(e.currentTarget.value)}
                                placeholder={t('broker-bot.broadcast.message-placeholder')}
                                value={caption}
                            />
                            <FileInput
                                accept="image/*"
                                clearable
                                description={t('broker-bot.broadcast.image-hint')}
                                label={t('broker-bot.broadcast.image')}
                                leftSection={<TbPhoto size={16} />}
                                onChange={setImage}
                                value={image}
                            />
                            {error && (
                                <Text c="red" size="sm">
                                    {error}
                                </Text>
                            )}
                        </Stack>
                    </SettingsCardShared.Content>
                    <SettingsCardShared.Bottom>
                        <Group justify="flex-end" mt="md">
                            <Button
                                color="teal"
                                disabled={data.audience === 0}
                                leftSection={<TbSend size={18} />}
                                loading={isPending}
                                onClick={handleSend}
                                size="md"
                                variant="soft"
                            >
                                {t('broker-bot.broadcast.send')}
                            </Button>
                        </Group>
                    </SettingsCardShared.Bottom>
                </SettingsCardShared.Container>

                <SettingsCardShared.Container>
                    <SettingsCardShared.Header
                        description={t('broker-bot.broadcast.recent-description')}
                        icon={<TbHistory size={24} />}
                        iconColor="gray"
                        iconVariant="soft"
                        title={t('broker-bot.broadcast.recent')}
                    />
                    <SettingsCardShared.Content>
                        {data.broadcasts.length === 0 ? (
                            <Text c="dimmed" py="md" size="sm" ta="center">
                                {t('broker-bot.broadcast.none')}
                            </Text>
                        ) : (
                            <Stack gap="xs">
                                {data.broadcasts.map((b) => (
                                    <Paper key={b.id} p="sm" radius="md" withBorder>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Stack gap={2} miw={0}>
                                                <Text fw={600} size="sm" truncate="end">
                                                    {b.caption ||
                                                        (b.hasMedia
                                                            ? `🖼 ${t('broker-bot.broadcast.image')}`
                                                            : '—')}
                                                </Text>
                                                <Text c="dimmed" size="xs">
                                                    {dayjs(b.createdAt).format('DD.MM.YYYY HH:mm')}{' '}
                                                    ·{' '}
                                                    {t('broker-bot.broadcast.recipients', {
                                                        count: b.recipients
                                                    })}
                                                </Text>
                                            </Stack>
                                            {b.status === 'sending' ? (
                                                <Badge color="orange" variant="soft">
                                                    {t('broker-bot.broadcast.sending')}
                                                </Badge>
                                            ) : (
                                                <Group gap={4} wrap="nowrap">
                                                    <Badge color="teal" variant="soft">
                                                        {t('broker-bot.broadcast.sent', {
                                                            count: b.sent
                                                        })}
                                                    </Badge>
                                                    {b.failed > 0 && (
                                                        <Badge color="red" variant="soft">
                                                            {t('broker-bot.broadcast.failed', {
                                                                count: b.failed
                                                            })}
                                                        </Badge>
                                                    )}
                                                </Group>
                                            )}
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </SettingsCardShared.Content>
                </SettingsCardShared.Container>
            </SimpleGrid>
        </Page>
    )
}

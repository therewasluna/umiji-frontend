import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Paper,
    rem,
    Stack,
    Text,
    ThemeIcon,
    Tooltip
} from '@mantine/core'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TbCheck, TbRefresh, TbTrash, TbUsersGroup } from 'react-icons/tb'

import { useConnectBrokerBot, useGetBrokerBot, useUpdateBrokerBotSettings } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    bot: GetBrokerBotCommand.Response['response']
}

/** Groups the bot saw /find in, so the broker can pick the staff group without knowing its ID. */
export function BotGroupFinderCardWidget({ bot }: IProps) {
    const { t } = useTranslation()

    const { refetch, isRefetching } = useGetBrokerBot()
    const { mutate: connect, isPending, variables } = useConnectBrokerBot()
    const { mutate: updateSettings, isPending: isClearing } = useUpdateBrokerBotSettings()

    const steps = [
        { done: bot.isConnected, label: t('broker-bot.finder.step-connect') },
        { done: false, label: t('broker-bot.finder.step-add') },
        { done: false, label: t('broker-bot.finder.step-find') }
    ]

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                actions={
                    bot.isConnected && (
                        <>
                            <Tooltip label={t('broker-bot.finder.refresh')}>
                                <ActionIcon
                                    aria-label={t('broker-bot.finder.refresh')}
                                    loading={isRefetching}
                                    onClick={() => refetch()}
                                    size="lg"
                                    variant="soft"
                                >
                                    <TbRefresh size={18} />
                                </ActionIcon>
                            </Tooltip>
                            {bot.groupFinds.length > 0 && (
                                <Tooltip label={t('broker-bot.finder.clear')}>
                                    <ActionIcon
                                        aria-label={t('broker-bot.finder.clear')}
                                        color="red"
                                        loading={isClearing}
                                        onClick={() =>
                                            updateSettings({ variables: { clearGroupFinds: true } })
                                        }
                                        size="lg"
                                        variant="soft"
                                    >
                                        <TbTrash size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </>
                    )
                }
                description={t('broker-bot.finder.help')}
                title={t('broker-bot.finder.title')}
            />

            <SettingsCardShared.Content>
                {bot.groupFinds.length === 0 ? (
                    <Stack align="center" flex={1} gap={6} justify="center" py={rem(28)}>
                        <ThemeIcon color="gray" mb={4} radius="xl" size={48} variant="light">
                            <TbUsersGroup size={24} />
                        </ThemeIcon>
                        <Text fw={600} size="sm">
                            {t('broker-bot.finder.empty-title')}
                        </Text>
                        <Stack gap="xs" mt="xs">
                            {steps.map((step, i) => (
                                <Group gap="sm" key={step.label} wrap="nowrap">
                                    <ThemeIcon
                                        color={step.done ? 'teal' : 'gray'}
                                        radius="xl"
                                        size={24}
                                        variant="soft"
                                    >
                                        {step.done ? (
                                            <TbCheck size={14} />
                                        ) : (
                                            <Text fw={600} size="xs">
                                                {i + 1}
                                            </Text>
                                        )}
                                    </ThemeIcon>
                                    <Text
                                        c={step.done ? 'dimmed' : undefined}
                                        size="sm"
                                        td={step.done ? 'line-through' : undefined}
                                    >
                                        {step.label}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    </Stack>
                ) : (
                    <Stack gap="xs">
                        {bot.groupFinds.map((group) => {
                            const isCurrent = group.chatId === bot.groupId
                            return (
                                <Paper key={group.chatId} p="sm" radius="md" withBorder>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Stack gap={2} miw={0}>
                                            <Group gap="xs" wrap="nowrap">
                                                <Text fw={600} size="sm" truncate="end">
                                                    {group.title || t('broker-bot.finder.unnamed')}
                                                </Text>
                                                {isCurrent && (
                                                    <Badge color="teal" size="sm" variant="soft">
                                                        {t('broker-bot.finder.current')}
                                                    </Badge>
                                                )}
                                            </Group>
                                            <Text c="dimmed" ff="monospace" size="xs">
                                                <span dir="ltr">{group.chatId}</span> ·{' '}
                                                {dayjs(group.foundAt).format('DD.MM.YYYY HH:mm')}
                                            </Text>
                                        </Stack>
                                        {!isCurrent && (
                                            <Button
                                                loading={
                                                    isPending &&
                                                    variables?.variables?.groupId === group.chatId
                                                }
                                                onClick={() =>
                                                    connect({
                                                        variables: {
                                                            groupId: group.chatId
                                                        }
                                                    })
                                                }
                                                size="xs"
                                                variant="soft"
                                            >
                                                {t('broker-bot.finder.use')}
                                            </Button>
                                        )}
                                    </Group>
                                </Paper>
                            )
                        })}
                    </Stack>
                )}
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

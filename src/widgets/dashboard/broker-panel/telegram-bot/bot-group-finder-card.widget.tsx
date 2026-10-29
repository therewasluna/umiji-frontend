import { ActionIcon, Badge, Button, Group, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TbRefresh, TbSearch, TbTrash } from 'react-icons/tb'

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

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={
                    bot.isConnected
                        ? t('broker-bot.finder.help')
                        : t('broker-bot.finder.connect-first')
                }
                icon={<TbSearch size={24} />}
                iconColor="violet"
                iconVariant="soft"
                title={t('broker-bot.finder.title')}
            />

            {bot.isConnected && (
                <SettingsCardShared.Content>
                    <Stack gap="xs">
                        <Group gap="xs" justify="flex-end">
                            <Tooltip label={t('broker-bot.finder.refresh')}>
                                <ActionIcon
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
                        </Group>

                        {bot.groupFinds.length === 0 ? (
                            <Text c="dimmed" py="md" size="sm" ta="center">
                                {t('broker-bot.finder.empty')}
                            </Text>
                        ) : (
                            bot.groupFinds.map((group) => {
                                const isCurrent = group.chatId === bot.groupId
                                return (
                                    <Paper key={group.chatId} p="sm" radius="md" withBorder>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Stack gap={2} miw={0}>
                                                <Group gap="xs" wrap="nowrap">
                                                    <Text fw={600} size="sm" truncate="end">
                                                        {group.title ||
                                                            t('broker-bot.finder.unnamed')}
                                                    </Text>
                                                    {isCurrent && (
                                                        <Badge
                                                            color="teal"
                                                            size="sm"
                                                            variant="soft"
                                                        >
                                                            {t('broker-bot.finder.current')}
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Text c="dimmed" ff="monospace" size="xs">
                                                    <span dir="ltr">{group.chatId}</span> ·{' '}
                                                    {dayjs(group.foundAt).format(
                                                        'DD.MM.YYYY HH:mm'
                                                    )}
                                                </Text>
                                            </Stack>
                                            {!isCurrent && (
                                                <Button
                                                    loading={
                                                        isPending &&
                                                        variables?.variables?.groupId ===
                                                            group.chatId
                                                    }
                                                    onClick={() =>
                                                        connect({
                                                            variables: {
                                                                groupId: group.chatId,
                                                                lang: bot.lang,
                                                                greeting: bot.greeting
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
                            })
                        )}
                    </Stack>
                </SettingsCardShared.Content>
            )}
        </SettingsCardShared.Container>
    )
}

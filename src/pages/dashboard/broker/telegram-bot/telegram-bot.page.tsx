import { Alert, Badge, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { BotChannelCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-channel-card.widget'
import { BotConnectionCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-connection-card.widget'
import { BotGroupFinderCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-group-finder-card.widget'
import { BotPaymentMethodsCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-payment-methods-card.widget'
import { BotPlansCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-plans-card.widget'
import { BotRequiredChannelsCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-required-channels-card.widget'
import { BotTopupCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-topup-card.widget'
import { useTranslation } from 'react-i18next'
import {
    PiCalendarCheckDuotone,
    PiCoinsDuotone,
    PiHourglassDuotone,
    PiPulseDuotone,
    PiShoppingCartDuotone,
    PiSparkleDuotone,
    PiUsersDuotone,
    PiWalletDuotone
} from 'react-icons/pi'
import { TbBrandTelegram, TbReceipt, TbSpeakerphone } from 'react-icons/tb'
import Masonry from 'react-layout-masonry'
import { useNavigate } from 'react-router'

import { useGetBrokerBot, useGetBrokerMe } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { IMetricCardProps, MetricCardShared } from '@shared/ui/metrics/metric-card'
import { formatTomanUtil } from '@shared/utils/brokers'

const MASONRY_COLUMNS = { 300: 1, 1400: 2 }

export function BrokerTelegramBotPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { data: bot } = useGetBrokerBot()
    const { data: broker } = useGetBrokerMe()

    if (!bot || !broker) return <LoadingScreen />

    const stats = bot.stats
    const statCards: IMetricCardProps[] = stats
        ? [
              {
                  IconComponent: PiUsersDuotone,
                  iconColor: 'blue',
                  title: t('broker-bot.stats.users'),
                  value: stats.usersTotal
              },
              {
                  IconComponent: PiPulseDuotone,
                  iconColor: 'teal',
                  title: t('broker-bot.stats.active-today'),
                  value: stats.activeToday
              },
              {
                  IconComponent: PiSparkleDuotone,
                  iconColor: 'cyan',
                  title: t('broker-bot.stats.new-today'),
                  value: stats.newToday
              },
              {
                  IconComponent: PiCalendarCheckDuotone,
                  iconColor: 'indigo',
                  title: t('broker-bot.stats.active-7d'),
                  value: stats.active7d
              },
              {
                  IconComponent: PiWalletDuotone,
                  iconColor: 'yellow',
                  title: t('broker-bot.stats.wallet-credit'),
                  value: formatTomanUtil(stats.walletTotal, t)
              },
              {
                  IconComponent: PiShoppingCartDuotone,
                  iconColor: 'grape',
                  title: t('broker-bot.stats.subs-sold'),
                  value: stats.plansSold
              },
              {
                  IconComponent: PiCoinsDuotone,
                  iconColor: 'green',
                  title: t('broker-bot.stats.topups'),
                  value: formatTomanUtil(stats.topupsTotal, t)
              },
              {
                  IconComponent: PiHourglassDuotone,
                  iconColor: 'orange',
                  title: t('broker-bot.stats.pending'),
                  value: stats.pendingReceipts
              }
          ].map((card) => ({ ...card, iconVariant: 'soft' }))
        : []

    return (
        <Page title={t('broker-bot.title')}>
            <PageHeaderShared
                actions={
                    bot.isConnected && (
                        <Button
                            leftSection={<TbReceipt size={20} />}
                            onClick={() => navigate(ROUTES.DASHBOARD.BROKER.TELEGRAM_ORDERS)}
                            rightSection={
                                <Badge
                                    color={stats?.pendingReceipts ? 'orange' : 'gray'}
                                    variant="filled"
                                >
                                    {stats?.pendingReceipts ?? 0}
                                </Badge>
                            }
                            size="md"
                            variant="soft"
                        >
                            {t('broker-bot.pending-receipts')}
                        </Button>
                    )
                }
                description={t('broker-bot.description')}
                icon={<TbBrandTelegram size={24} />}
                title={t('broker-bot.title')}
            />

            <Stack gap="md">
                <Alert color="violet" icon={<TbSpeakerphone size={20} />} variant="light">
                    {t('broker-bot.broadcast-notice')}
                </Alert>

                {stats && (
                    <div>
                        <Group align="baseline" gap="sm" mb="xs">
                            <Title c="dimmed" order={4}>
                                {t('broker-bot.stats.title')}
                            </Title>
                            <Text c="dimmed" size="xs">
                                {t('broker-bot.stats.reset-note')}
                            </Text>
                        </Group>
                        <SimpleGrid cols={{ base: 1, xs: 2, xl: 4 }} spacing="xs">
                            {statCards.map((card) => (
                                <MetricCardShared key={card.title} {...card} />
                            ))}
                        </SimpleGrid>
                    </div>
                )}

                <Masonry columns={MASONRY_COLUMNS} gap={16}>
                    {/* Remount when the saved connection changes (e.g. a group picked in the finder). */}
                    <BotConnectionCardWidget
                        bot={bot}
                        key={`${bot.botUsername}|${bot.groupId}|${bot.lang}|${bot.greeting}`}
                    />
                    <BotGroupFinderCardWidget bot={bot} />
                    <BotChannelCardWidget bot={bot} key={`channel|${bot.channelUrl}`} />
                    {bot.isConnected && <BotTopupCardWidget />}
                </Masonry>

                <BotPlansCardWidget bot={bot} squads={broker.internalSquads} />

                <Masonry columns={MASONRY_COLUMNS} gap={16}>
                    <BotPaymentMethodsCardWidget bot={bot} />
                    <BotRequiredChannelsCardWidget bot={bot} />
                </Masonry>
            </Stack>
        </Page>
    )
}

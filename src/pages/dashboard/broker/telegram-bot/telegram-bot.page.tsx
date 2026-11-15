import { Alert, Badge, Button, SimpleGrid, Stack } from '@mantine/core'
import { BotChannelCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-channel-card.widget'
import { BotConnectionCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-connection-card.widget'
import { BotGroupFinderCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-group-finder-card.widget'
import { BotPaymentMethodsCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-payment-methods-card.widget'
import { BotPlansCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-plans-card.widget'
import { BotReferralCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-referral-card.widget'
import { BotRequiredChannelsCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-required-channels-card.widget'
import { BotTopupCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-topup-card.widget'
import { BotTrialCardWidget } from '@widgets/dashboard/broker-panel/telegram-bot/bot-trial-card.widget'
import { useTranslation } from 'react-i18next'
import { TbReceipt, TbSpeakerphone } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { useGetBrokerBot, useGetBrokerMe } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

// Grid rows stretch both cards to the same height, so pairs line up (masonry left ragged ends).
const PAIR_COLS = { base: 1, xl: 2 }

export function BrokerTelegramBotPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { data: bot } = useGetBrokerBot()
    const { data: broker } = useGetBrokerMe()

    if (!bot || !broker) return <LoadingScreen />

    const stats = bot.stats

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
                title={t('broker-bot.title')}
            />

            <Stack gap="md">
                <Alert color="violet" icon={<TbSpeakerphone size={20} />} variant="light">
                    {t('broker-bot.broadcast-notice')}
                </Alert>

                <SimpleGrid cols={PAIR_COLS} spacing="md">
                    {/* Remount when the saved connection changes (e.g. a group picked in the finder). */}
                    <BotConnectionCardWidget bot={bot} key={`${bot.botUsername}|${bot.groupId}`} />
                    <BotGroupFinderCardWidget bot={bot} />
                    <BotChannelCardWidget bot={bot} key={`channel|${bot.channelUrl}`} />
                    <BotTopupCardWidget isConnected={bot.isConnected} />
                </SimpleGrid>

                <BotPlansCardWidget bot={bot} squads={broker.internalSquads} />

                <SimpleGrid cols={PAIR_COLS} spacing="md">
                    <BotPaymentMethodsCardWidget bot={bot} />
                    <BotRequiredChannelsCardWidget bot={bot} />
                </SimpleGrid>

                <SimpleGrid cols={PAIR_COLS} spacing="md">
                    <BotTrialCardWidget
                        bot={bot}
                        // Remount on a save or reset so the form shows what the bot now offers.
                        key={`trial|${JSON.stringify(bot.trial)}|${bot.trialResetAt.getTime()}`}
                        squads={broker.internalSquads}
                    />
                    <BotReferralCardWidget bot={bot} key={`referral|${bot.referralPercent}`} />
                </SimpleGrid>
            </Stack>
        </Page>
    )
}

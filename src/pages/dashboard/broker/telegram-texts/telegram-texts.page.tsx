import { BotTextsEditorWidget } from '@widgets/dashboard/broker-panel/telegram-texts/bot-texts-editor.widget'
import { useTranslation } from 'react-i18next'

import { useGetBrokerBot, useGetBrokerBotTexts } from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'

export function BrokerTelegramTextsPage() {
    const { t } = useTranslation()
    const { data } = useGetBrokerBotTexts()
    const { data: bot } = useGetBrokerBot()

    if (!data) return <LoadingScreen />

    return (
        <Page title={t('broker-bot-texts.title')}>
            <PageHeaderShared
                description={t('broker-bot-texts.description')}
                title={t('broker-bot-texts.title')}
            />
            <BotTextsEditorWidget
                botName={bot?.botUsername ? `@${bot.botUsername}` : null}
                data={data}
            />
        </Page>
    )
}

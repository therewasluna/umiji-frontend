import { Box, Flex } from '@mantine/core'
import { GetSubscriptionSettingsCommand, TSubscriptionTemplateType } from '@umiji/backend-contract'
import { ResponseRulesEditorWidget } from '@widgets/dashboard/response-rules/response-rules-editor'
import { useTranslation } from 'react-i18next'

import { Page, PageHeaderShared } from '@shared/ui'
import { SrrAdvancedWarningOverlay } from '@shared/ui/srr-advanced-warning-overlay/srr-advanced-warning-overlay'

interface Props {
    groupedTemplates: Record<TSubscriptionTemplateType, string[]>
    responseRules: GetSubscriptionSettingsCommand.Response['response']['responseRules']
    subscriptionSettingsUuid: string
}

export const ResponseRulesPageComponent = (props: Props) => {
    const { groupedTemplates, responseRules, subscriptionSettingsUuid } = props

    const { t } = useTranslation()

    return (
        <Page title={t('constants.response-rules')}>
            <PageHeaderShared
                description={t('page-descriptions.response-rules')}
                title={t('constants.response-rules')}
            />

            <SrrAdvancedWarningOverlay />

            <Flex gap="md">
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <ResponseRulesEditorWidget
                        groupedTemplates={groupedTemplates}
                        responseRules={responseRules}
                        subscriptionSettingsUuid={subscriptionSettingsUuid}
                    />
                </Box>
            </Flex>
        </Page>
    )
}

import { Select, SimpleGrid } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import {
    INSTALLATION_GUIDE_BLOCKS_VARIANTS_VALUES,
    SUBSCRIPTION_INFO_BLOCK_VARIANTS_VALUES,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import { useTranslation } from 'react-i18next'

import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function UiConfigBlockComponent({ form }: IProps) {
    const { t } = useTranslation()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('subpage-config-visual-editor.widget.ui-configuration-description')}
                title={t('subpage-config-visual-editor.widget.ui-configuration')}
            />

            <SimpleGrid cols={{ base: 1, md: 2 }} mt="xs" spacing="md">
                <Select
                    allowDeselect={false}
                    data={SUBSCRIPTION_INFO_BLOCK_VARIANTS_VALUES}
                    key={form.key('uiConfig.subscriptionInfoBlockType')}
                    label={t('subpage-config-visual-editor.widget.subscription-info-block-design')}
                    required
                    {...form.getInputProps('uiConfig.subscriptionInfoBlockType')}
                />

                <Select
                    allowDeselect={false}
                    data={INSTALLATION_GUIDE_BLOCKS_VARIANTS_VALUES}
                    key={form.key('uiConfig.installationGuidesBlockType')}
                    label={t('subpage-config-visual-editor.widget.installation-guides-design')}
                    required
                    {...form.getInputProps('uiConfig.installationGuidesBlockType')}
                />
            </SimpleGrid>
        </SettingsCardShared.Container>
    )
}

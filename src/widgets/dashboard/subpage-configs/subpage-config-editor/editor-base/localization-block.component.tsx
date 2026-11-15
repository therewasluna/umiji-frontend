import { Badge, Box, ScrollArea, SimpleGrid } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import {
    getLanguagesArray,
    TSubscriptionPageLanguageCode,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import { useTranslation } from 'react-i18next'

import { SettingsCardShared } from '@shared/ui/settings-card'

import { LocaleCard } from '../editor-components/locale-card.component'

const ALL_LANGUAGES = getLanguagesArray()

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function LocalizationBlockComponent({ form }: IProps) {
    const { t } = useTranslation()
    const { locales } = form.getValues()

    const toggleLocale = (code: TSubscriptionPageLanguageCode) => {
        if (locales.includes(code)) {
            if (locales.length > 1) {
                form.setFieldValue(
                    'locales',
                    locales.filter((l) => l !== code)
                )
            }
        } else {
            form.setFieldValue('locales', [...locales, code])
        }
    }

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                actions={
                    <Badge color="gray" size="lg" variant="soft">
                        {t('localization-block.active', { count: locales.length })}
                    </Badge>
                }
                description={t('subpage-config-visual-editor.widget.additional-languages')}
                title={t('subpage-config-visual-editor.widget.localization')}
            />

            {/* Fills the height the grid row gives the card (the Branding card beside it sets it),
                so the list scrolls only when it really doesn't fit. Alone in a column it keeps 232px. */}
            <Box mih={232} mt="xs" pos="relative" style={{ flex: 1 }}>
                <ScrollArea
                    offsetScrollbars
                    style={{ position: 'absolute', inset: 0 }}
                    type="hover"
                >
                    <SimpleGrid cols={{ base: 2, xl: 3 }} spacing="xs" verticalSpacing="xs">
                        {ALL_LANGUAGES.map((lang) => {
                            const isActive = locales.includes(lang.code)
                            return (
                                <LocaleCard
                                    code={lang.code}
                                    isActive={isActive}
                                    isToggleDisabled={isActive && locales.length === 1}
                                    key={lang.code}
                                    onToggle={() => toggleLocale(lang.code)}
                                />
                            )
                        })}
                    </SimpleGrid>
                </ScrollArea>
            </Box>
        </SettingsCardShared.Container>
    )
}

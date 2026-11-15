import { Button, Progress } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconLanguage } from '@tabler/icons-react'
import {
    BASE_TRANSLATION_LABELS,
    TSubscriptionPageBaseTranslationKeys,
    TSubscriptionPageLanguageCode,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import { useTranslation } from 'react-i18next'

import { SettingsCardShared } from '@shared/ui/settings-card'

import { BaseTranslationsDrawer } from '../editor-components/base-translations-drawer.component'

const TRANSLATION_KEYS = Object.keys(
    BASE_TRANSLATION_LABELS
) as TSubscriptionPageBaseTranslationKeys[]

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function BaseTranslationsBlockComponent({ form }: IProps) {
    const { t } = useTranslation()

    const values = form.getValues()

    const [drawerOpened, { close: closeDrawer, open: openDrawer }] = useDisclosure(false)

    const enabledLocales: TSubscriptionPageLanguageCode[] = values.locales

    const getFilledCount = () => {
        let count = 0
        for (const key of TRANSLATION_KEYS) {
            const translations = values.baseTranslations[key]
            const allFilled = enabledLocales.every((locale) => translations[locale]?.trim())
            if (allFilled) count++
        }
        return count
    }

    const filledCount = getFilledCount()
    const totalKeys = TRANSLATION_KEYS.length

    return (
        <>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    actions={
                        <Button
                            leftSection={<IconLanguage size={16} />}
                            onClick={openDrawer}
                            variant="default"
                        >
                            {t('base-translations-block.configure')}
                        </Button>
                    }
                    description={t('base-translations-drawer.component.completed', {
                        count: filledCount,
                        total: totalKeys
                    })}
                    title={t('base-translations-block.base-translations')}
                />

                {/* Yellow only while some key is missing a language. */}
                <Progress
                    color={filledCount === totalKeys ? undefined : 'yellow'}
                    mt="md"
                    radius="xl"
                    size="sm"
                    value={(filledCount / totalKeys) * 100}
                />
            </SettingsCardShared.Container>

            <BaseTranslationsDrawer
                baseTranslations={values.baseTranslations}
                enabledLocales={enabledLocales}
                onChange={(key, value) => form.setFieldValue(`baseTranslations.${key}`, value)}
                onClose={closeDrawer}
                opened={drawerOpened}
            />
        </>
    )
}

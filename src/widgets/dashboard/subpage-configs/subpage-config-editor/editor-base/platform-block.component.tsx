import { Accordion, Select, Text } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { IconDeviceDesktop, IconPlus } from '@tabler/icons-react'
import {
    TSubscriptionPagePlatformKey,
    TSubscriptionPagePlatformSchema,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import { useTranslation } from 'react-i18next'

import { SettingsCardShared } from '@shared/ui/settings-card'

import { PlatformEditor } from '../editor-components/platform-editor.component'
import styles from '../subpage-config-visual-editor.module.css'
import { AVAILABLE_PLATFORMS, PLATFORM_LABELS } from '../subpage-config.constants'

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function PlatformBlockComponent(props: IProps) {
    const { form } = props
    const { t } = useTranslation()
    const values = form.getValues()

    const enabledLocales = values.locales

    const existingPlatforms = Object.keys(values.platforms) as TSubscriptionPagePlatformKey[]
    const availablePlatformsToAdd = AVAILABLE_PLATFORMS.filter(
        (p) => !existingPlatforms.includes(p.value)
    )

    const handleAddPlatform = (platformKey: TSubscriptionPagePlatformKey) => {
        const { platforms, locales } = form.getValues()
        if (platforms[platformKey]) return

        const firstLocale = locales[0]
        const newPlatform: TSubscriptionPagePlatformSchema = {
            apps: [],
            displayName: firstLocale ? { [firstLocale]: PLATFORM_LABELS[platformKey] } : {},
            svgIconKey: ''
        }

        form.setFieldValue(`platforms.${platformKey}`, newPlatform)
    }

    const handlePlatformChange = (
        platformKey: TSubscriptionPagePlatformKey,
        updatedPlatform: TSubscriptionPagePlatformSchema
    ) => {
        form.setFieldValue(`platforms.${platformKey}`, updatedPlatform)
    }

    const handlePlatformDelete = (platformKey: TSubscriptionPagePlatformKey) => {
        const { platforms } = form.getValues()
        const { [platformKey]: _, ...rest } = platforms
        form.setFieldValue('platforms', rest)
    }

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                actions={
                    availablePlatformsToAdd.length > 0 && (
                        <Select
                            allowDeselect={false}
                            data={availablePlatformsToAdd}
                            leftSection={<IconPlus size={16} />}
                            onChange={(value) => {
                                if (value) handleAddPlatform(value as TSubscriptionPagePlatformKey)
                            }}
                            placeholder={t('subpage-config-visual-editor.widget.add-platform')}
                            value={null}
                            w={180}
                        />
                    )
                }
                description={t(
                    'subpage-config-visual-editor.widget.configure-apps-for-each-platform'
                )}
                title={t('subpage-config-visual-editor.widget.platforms')}
            />

            {existingPlatforms.length === 0 ? (
                <div className={styles.emptyState}>
                    <IconDeviceDesktop size={32} stroke={1.5} />
                    <Text mt="sm" size="sm">
                        {t('subpage-config-visual-editor.widget.no-platforms-configured')}
                    </Text>
                    <Text c="dimmed" size="xs">
                        {t('subpage-config-visual-editor.widget.add-a-platform-to-get-started')}
                    </Text>
                </div>
            ) : (
                <Accordion
                    chevronPosition="right"
                    classNames={{
                        item: styles.accordionItem,
                        control: styles.accordionControl,
                        label: styles.accordionLabel
                    }}
                    mt="xs"
                    multiple
                    variant="separated"
                >
                    {existingPlatforms.map((platformKey) => {
                        const platform = values.platforms[platformKey]
                        if (!platform) return null
                        return (
                            <PlatformEditor
                                enabledLocales={enabledLocales}
                                key={platformKey}
                                onChange={(p) => handlePlatformChange(platformKey, p)}
                                onDelete={() => handlePlatformDelete(platformKey)}
                                platform={platform}
                                platformKey={platformKey}
                                svgLibrary={values.svgLibrary}
                            />
                        )
                    })}
                </Accordion>
            )}
        </SettingsCardShared.Container>
    )
}

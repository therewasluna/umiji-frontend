import { ColorSwatch, Group, Radio, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import {
    SUBSCRIPTION_PAGE_ACCENT_COLORS_VALUES,
    SUBSCRIPTION_PAGE_ACCENT_PALETTES,
    SUBSCRIPTION_PAGE_DEFAULT_ACCENT_COLOR,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCheck } from 'react-icons/tb'

import { SettingsCardShared } from '@shared/ui/settings-card'

import classes from './branding-block.module.css'

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function BrandingBlockComponent({ form }: IProps) {
    const { t } = useTranslation()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('subpage-config-visual-editor.widget.brand-appearance')}
                title={t('subpage-config-visual-editor.widget.branding')}
            />

            <Stack gap="md" mt="xs">
                <TextInput
                    key={form.key('brandingSettings.title')}
                    label={t('subpage-config-visual-editor.widget.brand-title')}
                    placeholder={t('subpage-config-visual-editor.widget.your-brand-name')}
                    required
                    {...form.getInputProps('brandingSettings.title')}
                />

                <TextInput
                    key={form.key('brandingSettings.logoUrl')}
                    label={t('common.field.logo-url')}
                    placeholder="https://example.com/logo.png"
                    required
                    {...form.getInputProps('brandingSettings.logoUrl')}
                />

                <TextInput
                    key={form.key('brandingSettings.supportUrl')}
                    label={t('subpage-config-visual-editor.widget.support-url')}
                    placeholder="https://t.me/support"
                    required
                    {...form.getInputProps('brandingSettings.supportUrl')}
                />

                <Radio.Group
                    description={t('subpage-config-visual-editor.widget.main-color-description')}
                    key={form.key('brandingSettings.accentColor')}
                    label={t('subpage-config-visual-editor.widget.main-color')}
                    {...form.getInputProps('brandingSettings.accentColor')}
                    // Configs saved before this setting existed have no value yet.
                    defaultValue={
                        form.getValues().brandingSettings.accentColor ??
                        SUBSCRIPTION_PAGE_DEFAULT_ACCENT_COLOR
                    }
                >
                    <SimpleGrid cols={{ base: 2, '26rem': 4 }} spacing="xs" type="container">
                        {SUBSCRIPTION_PAGE_ACCENT_COLORS_VALUES.map((color) => {
                            const swatch = SUBSCRIPTION_PAGE_ACCENT_PALETTES[color].shades[8]

                            return (
                                <Radio.Card
                                    className={classes.swatchCard}
                                    key={color}
                                    p="xs"
                                    radius="md"
                                    style={{ '--swatch': swatch } as CSSProperties}
                                    value={color}
                                >
                                    <Group gap="xs" wrap="nowrap">
                                        <ColorSwatch color={swatch} size={22} withShadow={false}>
                                            <TbCheck
                                                className={classes.check}
                                                color="#fff"
                                                size={14}
                                            />
                                        </ColorSwatch>
                                        <Text fw={500} size="sm" truncate="end">
                                            {t(
                                                `subpage-config-visual-editor.widget.color-${color}`
                                            )}
                                        </Text>
                                    </Group>
                                </Radio.Card>
                            )
                        })}
                    </SimpleGrid>
                </Radio.Group>
            </Stack>
        </SettingsCardShared.Container>
    )
}

import {
    ActionIcon,
    Checkbox,
    Group,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { TSubscriptionPageRawConfig } from '@umiji/subscription-page-types'
import { useTranslation } from 'react-i18next'
import { HiQuestionMarkCircle } from 'react-icons/hi'
import { TbKey, TbLink } from 'react-icons/tb'

import { CheckboxCardShared } from '@shared/ui/checkbox-card/checkbox-card.shared'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function BaseSettingsBlockComponent({ form }: IProps) {
    const { t } = useTranslation()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('base-settings-block.component.description')}
                title={t('base-settings-block.component.base-settings')}
            />

            <SimpleGrid cols={{ base: 1, md: 2 }} mt="xs" spacing="md">
                <TextInput
                    key={form.key('baseSettings.metaTitle')}
                    label={t('base-settings-block.component.meta-title')}
                    required
                    {...form.getInputProps('baseSettings.metaTitle')}
                />

                <TextInput
                    key={form.key('baseSettings.metaDescription')}
                    label={t('base-settings-block.component.meta-description')}
                    required
                    {...form.getInputProps('baseSettings.metaDescription')}
                />

                <CheckboxCardShared
                    key={form.key('baseSettings.showConnectionKeys')}
                    {...form.getInputProps('baseSettings.showConnectionKeys', {
                        type: 'checkbox'
                    })}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                            <ThemeIcon color="gray" size="lg" variant="soft">
                                <TbKey size={20} />
                            </ThemeIcon>
                            <Stack gap={2}>
                                <Group gap={4}>
                                    <Text fw={600} size="sm">
                                        {t('base-settings-block.component.show-connection-keys')}
                                    </Text>
                                    <ActionIcon
                                        color="gray"
                                        component="a"
                                        href="https://github.com/therewasluna/umiji"
                                        onClick={(e) => e.stopPropagation()}
                                        rel="noopener noreferrer"
                                        size="xs"
                                        target="_blank"
                                        variant="subtle"
                                    >
                                        <HiQuestionMarkCircle size={24} />
                                    </ActionIcon>
                                </Group>
                                <Text c="dimmed" size="xs">
                                    {t(
                                        'base-settings-block.component.show-or-hide-raw-connection-keys'
                                    )}
                                </Text>
                            </Stack>
                        </Group>
                        <Checkbox.Indicator size="md" />
                    </Group>
                </CheckboxCardShared>

                <CheckboxCardShared
                    key={form.key('baseSettings.hideGetLinkButton')}
                    {...form.getInputProps('baseSettings.hideGetLinkButton', {
                        type: 'checkbox'
                    })}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                            <ThemeIcon color="gray" size="lg" variant="soft">
                                <TbLink size={20} />
                            </ThemeIcon>
                            <Stack gap={2}>
                                <Group gap={4}>
                                    <Text fw={600} size="sm">
                                        {t('base-settings-block.component.hide-get-link-button')}
                                    </Text>
                                </Group>
                                <Text c="dimmed" size="xs">
                                    {t(
                                        'base-settings-block.component.hide-the-get-link-button-top-right-corner'
                                    )}
                                </Text>
                            </Stack>
                        </Group>
                        <Checkbox.Indicator size="md" />
                    </Group>
                </CheckboxCardShared>
            </SimpleGrid>
        </SettingsCardShared.Container>
    )
}

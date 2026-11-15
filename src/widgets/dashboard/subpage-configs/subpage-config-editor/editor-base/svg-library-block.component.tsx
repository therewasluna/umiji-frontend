import { Box, Button, Group, Text } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { IconPhoto } from '@tabler/icons-react'
import { TSubscriptionPageRawConfig } from '@umiji/subscription-page-types'
import isSvg from 'is-svg'
import { useTranslation } from 'react-i18next'

import { SettingsCardShared } from '@shared/ui/settings-card'

import { SvgLibraryModal } from '../editor-components/svg-library-modal.component'
import styles from '../subpage-config-visual-editor.module.css'

const PREVIEW_COUNT = 12

interface IProps {
    form: UseFormReturnType<TSubscriptionPageRawConfig>
}

export function SvgLibraryBlockComponent(props: IProps) {
    const { form } = props
    const values = form.getValues()
    const [svgLibraryOpened, { close: closeSvgLibrary, open: openSvgLibrary }] =
        useDisclosure(false)

    const { t } = useTranslation()

    const entries = Object.entries(values.svgLibrary || {})
    const iconCount = entries.length

    return (
        <>
            <SettingsCardShared.Container>
                <SettingsCardShared.Header
                    actions={
                        <Button
                            leftSection={<IconPhoto size={16} />}
                            onClick={openSvgLibrary}
                            variant="default"
                        >
                            {t('subpage-config-visual-editor.widget.open-svg-library')}
                        </Button>
                    }
                    description={t('svg-library-block.icons', { count: iconCount })}
                    title={t('svg-library-modal.component.svg-library')}
                />

                <Group gap={6} mt="xs">
                    {entries.slice(0, PREVIEW_COUNT).map(([key, svg]) => (
                        <Box className={styles.appIconPreview} key={key}>
                            {isSvg(svg) && (
                                <Box
                                    className={styles.appIconSvg}
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                            )}
                        </Box>
                    ))}
                    {iconCount > PREVIEW_COUNT && (
                        <Text c="dimmed" ml={4} size="xs">
                            +{iconCount - PREVIEW_COUNT}
                        </Text>
                    )}
                </Group>
            </SettingsCardShared.Container>

            <SvgLibraryModal
                onChange={(library) => form.setFieldValue('svgLibrary', library)}
                onClose={closeSvgLibrary}
                opened={svgLibraryOpened}
                svgLibrary={values.svgLibrary}
            />
        </>
    )
}

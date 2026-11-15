import {
    ActionIcon,
    Alert,
    Anchor,
    Badge,
    Button,
    Card,
    Drawer,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
    ThemeIcon
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconBulb, IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react'
import { TSubscriptionPageSvgLibrary } from '@umiji/subscription-page-types'
import isSvg from 'is-svg'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

import styles from '../subpage-config-visual-editor.module.css'

interface IProps {
    onChange: (library: TSubscriptionPageSvgLibrary) => void
    onClose: () => void
    opened: boolean
    svgLibrary: TSubscriptionPageSvgLibrary
}

export function SvgLibraryModal(props: IProps) {
    const { onChange, onClose, opened, svgLibrary } = props
    const { t } = useTranslation()

    const [addDrawerOpened, { close: closeAddDrawer, open: openAddDrawer }] = useDisclosure(false)
    const [editingKey, setEditingKey] = useState<null | string>(null)
    const [newKey, setNewKey] = useState('')
    const [newSvg, setNewSvg] = useState('')

    const libraryEntries = Object.entries(svgLibrary)

    useEffect(() => {
        const invalidKeys = libraryEntries.filter(([, svg]) => !isSvg(svg)).map(([key]) => key)

        if (invalidKeys.length > 0) {
            const cleanedLibrary = { ...svgLibrary }
            for (const key of invalidKeys) {
                delete cleanedLibrary[key]
            }
            onChange(cleanedLibrary)
        }
    }, [])

    const handleAdd = () => {
        if (!newKey.trim() || !isSvg(newSvg)) return
        if (!/^[A-Za-z]+$/.test(newKey)) return

        onChange({ ...svgLibrary, [newKey]: newSvg })
        setNewKey('')
        setNewSvg('')
        closeAddDrawer()
    }

    const handleUpdate = () => {
        if (!editingKey || !isSvg(newSvg)) return

        onChange({ ...svgLibrary, [editingKey]: newSvg })
        setEditingKey(null)
        setNewSvg('')
        closeAddDrawer()
    }

    const handleDelete = (key: string) => {
        const newLibrary = { ...svgLibrary }
        delete newLibrary[key]
        onChange(newLibrary)
    }

    const handleEdit = (key: string) => {
        setEditingKey(key)
        setNewKey(key)
        setNewSvg(svgLibrary[key])
        openAddDrawer()
    }

    const handleOpenAdd = () => {
        setEditingKey(null)
        setNewKey('')
        setNewSvg('')
        openAddDrawer()
    }

    return (
        <>
            <Drawer
                keepMounted={false}
                onClose={onClose}
                opened={opened}
                position="right"
                size="xl"
                title={
                    <BaseOverlayHeader
                        IconComponent={IconPhoto}
                        subtitle={t('svg-library-modal.icons', { count: libraryEntries.length })}
                        title={t('svg-library-modal.component.svg-library')}
                    />
                }
            >
                <Stack gap="md">
                    <Alert
                        bg="rgba(255, 255, 255, 0.02)"
                        color="gray"
                        icon={<IconBulb size={20} />}
                        radius="md"
                        styles={{
                            root: {
                                border: '1px solid rgba(255, 255, 255, 0.07)'
                            }
                        }}
                        title={t('svg-library-modal.component.where-to-find-icons')}
                        variant="light"
                    >
                        <Text c="dimmed" size="sm">
                            {t('svg-library-modal.component.you-can-find-beautiful-icons-at')}{' '}
                            <Anchor fw={500} href="https://tabler.io/icons" target="_blank">
                                tabler.io/icons.
                            </Anchor>
                        </Text>
                        <Text c="dimmed" size="sm">
                            {t('svg-library-modal.component.where-to-find-icons-description')}
                        </Text>
                    </Alert>

                    <Button
                        className={styles.addButton}
                        fullWidth
                        leftSection={<IconPlus size={20} />}
                        onClick={handleOpenAdd}
                        size="md"
                        variant="default"
                    >
                        {t('svg-library-modal.component.add-icon')}
                    </Button>

                    {libraryEntries.length === 0 ? (
                        <div className={styles.emptyState}>
                            <IconPhoto size={32} stroke={1.5} />
                            <Text mt="sm" size="sm">
                                {t('svg-icon-select.component.no-icons-in-library')}
                            </Text>
                            <Text c="dimmed" size="xs">
                                {t(
                                    'svg-library-modal.component.add-icons-to-use-them-in-blocks-and-buttons'
                                )}
                            </Text>
                        </div>
                    ) : (
                        <SimpleGrid
                            cols={{
                                base: 1,
                                sm: 1,
                                md: 2
                            }}
                            spacing="sm"
                        >
                            {libraryEntries.map(([key, svg]) => (
                                <Card
                                    className={styles.interactiveCard}
                                    key={key}
                                    onClick={() => handleEdit(key)}
                                    p="sm"
                                    radius="md"
                                >
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="sm" wrap="nowrap">
                                            <div className={styles.svgPreviewBox}>
                                                {isSvg(svg) ? (
                                                    <ThemeIcon
                                                        color="gray"
                                                        radius="xl"
                                                        size={44}
                                                        style={{ flexShrink: 0 }}
                                                        variant="soft"
                                                    >
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: svg
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        />
                                                    </ThemeIcon>
                                                ) : (
                                                    <IconPhoto
                                                        color="var(--mantine-color-dimmed)"
                                                        size={24}
                                                    />
                                                )}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <Text c="white" fw={500} size="sm" truncate="end">
                                                    {key}
                                                </Text>
                                                <Badge color="gray" size="xs" variant="soft">
                                                    SVG
                                                </Badge>
                                            </div>
                                        </Group>
                                        <ActionIcon
                                            className={styles.deleteButton}
                                            color="red"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(key)
                                            }}
                                            size="sm"
                                            variant="subtle"
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>
            </Drawer>

            <Drawer
                keepMounted={false}
                onClose={closeAddDrawer}
                opened={addDrawerOpened}
                position="right"
                size="md"
                title={
                    <BaseOverlayHeader
                        IconComponent={editingKey ? IconPhoto : IconPlus}
                        title={
                            editingKey
                                ? t('svg-library-modal.component.edit-icon')
                                : t('svg-library-modal.component.add-icon')
                        }
                    />
                }
            >
                <Stack gap="md">
                    <TextInput
                        description={t(
                            'svg-library-modal.component.only-latin-characters-no-spaces'
                        )}
                        disabled={!!editingKey}
                        error={
                            newKey && !/^[A-Za-z]+$/.test(newKey)
                                ? t('svg-library-modal.component.only-latin-characters-allowed')
                                : undefined
                        }
                        label={t('svg-library-modal.component.icon-key')}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder={t('svg-library-modal.myiconname')}
                        value={newKey}
                    />

                    <Stack gap="xs">
                        <Text fw={500} size="sm">
                            {t('svg-library-modal.component.svg-code')}
                        </Text>
                        <Stack gap="sm">
                            <Textarea
                                onChange={(e) => setNewSvg(e.target.value)}
                                placeholder="<svg>...</svg>"
                                rows={12}
                                value={newSvg}
                            />
                            <Card className={styles.sectionCard} p="sm" radius="md">
                                <Stack align="center" gap="xs">
                                    <Text c="dimmed" size="xs">
                                        {t('svg-library-modal.component.preview')}
                                    </Text>
                                    <div className={styles.svgPreviewBox}>
                                        {isSvg(newSvg) ? (
                                            <ThemeIcon
                                                color="gray"
                                                radius="xl"
                                                size={44}
                                                style={{ flexShrink: 0 }}
                                                variant="soft"
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: newSvg
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                />
                                            </ThemeIcon>
                                        ) : (
                                            <IconPhoto
                                                color="var(--mantine-color-dimmed)"
                                                size={24}
                                            />
                                        )}
                                    </div>
                                </Stack>
                            </Card>
                        </Stack>
                    </Stack>

                    <Button
                        disabled={
                            !isSvg(newSvg) ||
                            (!editingKey && (!newKey.trim() || !/^[A-Za-z]+$/.test(newKey)))
                        }
                        fullWidth
                        onClick={editingKey ? handleUpdate : handleAdd}
                    >
                        {editingKey ? t('common.action.update') : t('common.action.add')}
                    </Button>
                </Stack>
            </Drawer>
        </>
    )
}

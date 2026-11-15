import type { editor } from 'monaco-editor'

import { ConfigEditorActionsFeature } from '@features/dashboard/config-profiles/config-editor-actions'
import { ConfigValidationFeature } from '@features/dashboard/config-profiles/config-validation'
import { MonacoSetupFeature } from '@features/dashboard/config-profiles/monaco-setup'
import {
    ActionIcon,
    Box,
    Button,
    Code,
    Group,
    Loader,
    Paper,
    SegmentedControl,
    Text,
    Tooltip
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { useMonaco } from '@monaco-editor/react'
import clsx from 'clsx'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbAlertTriangle,
    TbArrowBackUp,
    TbArrowForwardUp,
    TbBraces,
    TbLayoutDashboard
} from 'react-icons/tb'
import { useBlocker } from 'react-router'

import { usePseudoFullscreen, useViewportFillHeight } from '@shared/hooks'
import { CodeEditor, editorClasses, EditorFooter, EditorStatusBar } from '@shared/ui/code-editor'
import { FullscreenToggleButton, fullscreenClasses } from '@shared/ui/fullscreen-toggle-button'
import { LoaderModalShared } from '@shared/ui/loader-modal'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { preventBackScroll } from '@shared/utils/misc'

import { VisualEditorWidget } from '../visual-editor/visual-editor.widget'
import styles from './ConfigEditor.module.css'
import { IProps } from './interfaces'

export function ConfigEditorWidget(props: IProps) {
    const { t, i18n } = useTranslation()
    const monaco = useMonaco()

    const { configProfile, isWasmCrashed, isWasmRestarting, onRestartWasm, snippets } = props

    const [result, setResult] = useState('')
    const [isConfigValid, setIsConfigValid] = useState(true)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [originalValue, setOriginalValue] = useState<string>(
        JSON.stringify(configProfile.config, null, 2) || ''
    )

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const wasWasmRestarting = useRef(false)
    const lastVisualEdit = useRef(0)

    // Monaco stays the single source of truth; the visual editor reads its text and writes whole-document
    // edits back, so saving, validation, the unsaved-changes guard and undo work the same in both modes.
    const [mode, setMode] = useState<'json' | 'visual'>('visual')
    const [text, setText] = useState<string | null>(null)
    const parsed = useMemo(() => {
        if (text === null) return null
        try {
            const value: unknown = JSON.parse(text)
            return value && typeof value === 'object' && !Array.isArray(value)
                ? (value as Record<string, unknown>)
                : undefined
        } catch {
            return undefined
        }
    }, [text])

    const applyVisual = (next: Record<string, unknown>) => {
        const instance = editorRef.current
        const model = instance?.getModel()
        if (!instance || !model) return

        // Edits less than a second apart (typing in one field) undo as one step.
        if (Date.now() - lastVisualEdit.current > 1000) instance.pushUndoStop()
        lastVisualEdit.current = Date.now()
        instance.executeEdits('visual-editor', [
            { range: model.getFullModelRange(), text: JSON.stringify(next, null, 2) }
        ])
    }

    const isVisual = mode === 'visual'

    const { isFullscreen, toggle: toggleFullscreen } = usePseudoFullscreen()
    const { containerRef: editorWrapperRef, footerRef } = useViewportFillHeight({
        enabled: !isFullscreen && !isVisual
    })

    useEffect(() => {
        if (!monaco) return

        MonacoSetupFeature.setup(i18n.language, snippets.snippets)
    }, [i18n.language, snippets, monaco])

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    )

    const snippetMap = new Map(snippets.snippets.map((s) => [s.name, s.snippet]))

    useEffect(() => {
        if (wasWasmRestarting.current && !isWasmRestarting && !isWasmCrashed && editorRef.current) {
            ConfigValidationFeature.validate(editorRef, setResult, setIsConfigValid, snippetMap)
        }
        wasWasmRestarting.current = isWasmRestarting
    }, [isWasmRestarting, isWasmCrashed])

    const checkForChanges = () => {
        if (!editorRef.current) return

        const currentValue = editorRef.current.getValue()
        const hasChanges = currentValue !== originalValue
        setHasUnsavedChanges(hasChanges)
    }

    useLayoutEffect(() => {
        document.body.addEventListener('wheel', preventBackScroll, {
            passive: false
        })
        return () => {
            document.body.removeEventListener('wheel', preventBackScroll)
        }
    }, [])

    useEffect(() => {
        if (blocker.state === 'blocked') {
            modals.openConfirmModal({
                title: (
                    <BaseOverlayHeader
                        IconComponent={TbAlertTriangle}
                        iconSize={20}
                        title={t('config-editor.widget.unsaved-changes')}
                    />
                ),
                children: t(
                    'config-editor.widget.your-changes-will-be-lost-if-you-leave-this-page-without-saving'
                ),
                centered: true,
                labels: {
                    confirm: t('config-editor.widget.leave'),
                    cancel: t('config-editor.widget.stay')
                },

                confirmProps: {
                    color: 'red',
                    variant: 'soft'
                },
                cancelProps: {
                    variant: 'light'
                },
                onConfirm: () => {
                    blocker.proceed()
                },
                onCancel: () => {
                    blocker.reset()
                },
                closeOnConfirm: true,
                closeOnCancel: true
            })
        }
    }, [blocker])

    const statusBar = (result || isWasmRestarting || isWasmCrashed) && (
        <EditorStatusBar
            status={isWasmCrashed || isWasmRestarting || !isConfigValid ? 'error' : 'success'}
        >
            {isWasmRestarting && (
                <Group gap="xs">
                    <Loader color="orange" size="xs" />
                    <Code className={styles.statusCode} color="orange">
                        {t('config-editor.xray-core-wasm-is-restarting')}
                    </Code>
                </Group>
            )}
            {!isWasmRestarting && isWasmCrashed && (
                <Group gap="sm">
                    <Code className={styles.statusCode} color="red">
                        {t('config-editor.xray-core-wasm-crashed-validation-is-unavailable')}
                    </Code>
                    <Button color="red" onClick={onRestartWasm} size="compact-xs" variant="light">
                        {t('restart-node-button.feature.restart')}
                    </Button>
                </Group>
            )}
            {!isWasmRestarting && !isWasmCrashed && result}
        </EditorStatusBar>
    )

    return (
        <Box className={clsx(styles.container, isFullscreen && fullscreenClasses.overlay)}>
            {!isFullscreen && (
                <Group className={styles.modeBar} justify="space-between" wrap="nowrap">
                    <SegmentedControl
                        classNames={{
                            root: styles.modeSwitch,
                            indicator: styles.modeIndicator,
                            label: styles.modeLabel
                        }}
                        data={[
                            {
                                value: 'visual',
                                label: (
                                    <Group gap={8} wrap="nowrap">
                                        <TbLayoutDashboard size={17} />
                                        {t('config-visual-editor.visual')}
                                    </Group>
                                )
                            },
                            {
                                value: 'json',
                                label: (
                                    <Group gap={8} wrap="nowrap">
                                        <TbBraces size={17} />
                                        JSON
                                    </Group>
                                )
                            }
                        ]}
                        onChange={(v) => setMode(v as 'json' | 'visual')}
                        value={mode}
                    />
                    {isVisual && (
                        <Group className={styles.history} gap={2} wrap="nowrap">
                            <Tooltip label={t('config-visual-editor.undo')} withArrow>
                                <ActionIcon
                                    aria-label={t('config-visual-editor.undo')}
                                    color="gray"
                                    onClick={() =>
                                        editorRef.current?.trigger('visual-editor', 'undo', null)
                                    }
                                    radius={10}
                                    size={36}
                                    variant="subtle"
                                >
                                    <TbArrowBackUp size={18} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t('config-visual-editor.redo')} withArrow>
                                <ActionIcon
                                    aria-label={t('config-visual-editor.redo')}
                                    color="gray"
                                    onClick={() =>
                                        editorRef.current?.trigger('visual-editor', 'redo', null)
                                    }
                                    radius={10}
                                    size={36}
                                    variant="subtle"
                                >
                                    <TbArrowForwardUp size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                </Group>
            )}

            {isVisual && (
                <Box className={styles.visual}>
                    {parsed === null && <LoaderModalShared mih="320px" />}
                    {parsed === undefined && (
                        <Box className={styles.brokenJson}>
                            <TbAlertTriangle size={28} />
                            <Text fw={600}>{t('config-visual-editor.broken-json')}</Text>
                            <Text c="dimmed" maw={420} size="sm" ta="center">
                                {t('config-visual-editor.broken-json-description')}
                            </Text>
                            <Button color="teal" onClick={() => setMode('json')} variant="soft">
                                {t('config-visual-editor.open-json')}
                            </Button>
                        </Box>
                    )}
                    {parsed && (
                        <VisualEditorWidget
                            config={parsed}
                            issue={isConfigValid ? null : result}
                            onChange={applyVisual}
                            snippets={snippets.snippets.map((sn) => sn.name)}
                        />
                    )}
                    {/* Visual mode marks problems on the inputs; the text log stays in JSON mode. */}
                    {(isWasmCrashed || isWasmRestarting) && (
                        <Box className={styles.visualStatus}>{statusBar}</Box>
                    )}
                </Box>
            )}

            <Paper
                className={clsx(
                    styles.editorWrapper,
                    !isFullscreen && editorClasses.editorAttached,
                    isFullscreen && fullscreenClasses.fill
                )}
                p={0}
                pos="relative"
                ref={editorWrapperRef}
                style={{
                    direction: 'ltr',
                    display: isVisual && !isFullscreen ? 'none' : undefined
                }}
                withBorder
            >
                {isFullscreen && (
                    <FullscreenToggleButton
                        isFullscreen={isFullscreen}
                        onToggle={toggleFullscreen}
                    />
                )}

                <CodeEditor
                    footer={statusBar}
                    className={styles.monacoEditor}
                    defaultLanguage="json"
                    loading={<LoaderModalShared mih="100%" />}
                    onChange={() => {
                        if (!isWasmCrashed && !isWasmRestarting) {
                            ConfigValidationFeature.validate(
                                editorRef,
                                setResult,
                                setIsConfigValid,
                                snippetMap
                            )
                        }

                        checkForChanges()
                        setText(editorRef.current?.getValue() ?? null)
                    }}
                    onMount={(editor) => {
                        editorRef.current = editor
                        setText(editor.getValue())

                        editor.getAction('editor.foldLevel7')?.run()

                        ConfigValidationFeature.validate(
                            editorRef,
                            setResult,
                            setIsConfigValid,
                            snippetMap
                        )
                    }}
                    options={{
                        stickyScroll: { enabled: false }
                    }}
                    path="xray-config://*"
                    value={JSON.stringify(configProfile.config, null, 2)}
                />
            </Paper>

            {!isFullscreen && (
                <EditorFooter className={clsx(isVisual && styles.visualFooter)} ref={footerRef}>
                    {!isVisual && (
                        <FullscreenToggleButton
                            floating={false}
                            isFullscreen={isFullscreen}
                            onToggle={toggleFullscreen}
                            size={36}
                        />
                    )}

                    <ConfigEditorActionsFeature
                        configProfile={configProfile}
                        editorRef={editorRef}
                        hasUnsavedChanges={hasUnsavedChanges}
                        isConfigValid={isConfigValid}
                        isVisual={isVisual}
                        originalValue={originalValue}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                        setIsConfigValid={setIsConfigValid}
                        setOriginalValue={setOriginalValue}
                        setResult={setResult}
                    />
                </EditorFooter>
            )}
        </Box>
    )
}

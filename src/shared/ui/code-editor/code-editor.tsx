import type { editor } from 'monaco-editor'

import { Box, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import Editor, { EditorProps, OnMount } from '@monaco-editor/react'
import clsx from 'clsx'
import { TFunction } from 'i18next'
import { parse } from 'jsonc-parser'
import { Fragment, ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BASE_MONACO_OPTIONS, MONACO_THEME_NAME } from '@shared/constants/monaco-theme'
import { describeJsonPath } from '@shared/utils/monaco/json-path'
import { RepairResult, repairJsonInEditor } from '@shared/utils/monaco/repair-json'

import { LoaderModalShared } from '../loader-modal/loader-model.shared'
import styles from './CodeEditor.module.css'

const REPAIR_ACTION_ID = 'umiji.repairJson'

const getResultColors = (
    t: TFunction
): Record<RepairResult, { color: string; message: string }> => ({
    failed: { color: 'red', message: t('code-editor.could-not-repair-this-json') },
    repaired: { color: 'teal', message: t('code-editor.json-repaired') },
    unchanged: { color: 'gray', message: t('code-editor.nothing-to-repair') }
})

interface Props extends Omit<EditorProps, 'wrapperProps'> {
    footer?: ReactNode
    withJsonPath?: boolean
    wrapperProps?: Record<string, unknown> & { className?: string }
}

export function CodeEditor(props: Props) {
    const { t } = useTranslation()
    const {
        defaultLanguage,
        footer,
        language,
        onMount,
        options,
        withJsonPath,
        wrapperProps,
        ...rest
    } = props

    const [jsonPath, setJsonPath] = useState<string[]>([])
    const documentTextRef = useRef('')
    const documentValueRef = useRef<unknown>(undefined)

    const isJson = (language ?? defaultLanguage) === 'json'
    const showJsonPath = withJsonPath ?? isJson

    const syncDocumentSnapshot = (instance: editor.IStandaloneCodeEditor) => {
        const model = instance.getModel()

        if (!model) return

        const text = model.getValue()

        documentTextRef.current = text
        documentValueRef.current = parse(text)
    }

    const updateJsonPath = (instance: editor.IStandaloneCodeEditor) => {
        const model = instance.getModel()
        const [firstVisibleRange] = instance.getVisibleRanges()

        if (!model || !firstVisibleRange) {
            setJsonPath([])
            return
        }

        const topLine = firstVisibleRange.startLineNumber

        const offset = model.getOffsetAt({
            lineNumber: topLine,
            column: model.getLineMaxColumn(topLine)
        })

        const nextPath = describeJsonPath(documentTextRef.current, offset, documentValueRef.current)

        setJsonPath((currentPath) =>
            currentPath.length === nextPath.length &&
            currentPath.every((segment, index) => segment === nextPath[index])
                ? currentPath
                : nextPath
        )
    }

    const handleMount: OnMount = (instance, monaco) => {
        if (isJson) {
            instance.addAction({
                id: REPAIR_ACTION_ID,
                label: t('code-editor.repair-json'),
                contextMenuGroupId: '1_modification',
                contextMenuOrder: 1.32,
                run: (target) => {
                    const result = repairJsonInEditor(target as editor.IStandaloneCodeEditor)

                    notifications.show({
                        color: getResultColors(t)[result].color,
                        message: getResultColors(t)[result].message,
                        title: t('code-editor.repair-json')
                    })
                }
            })
        }

        if (showJsonPath) {
            syncDocumentSnapshot(instance)
            updateJsonPath(instance)

            instance.onDidScrollChange(() => updateJsonPath(instance))
            instance.onDidChangeModelContent(() => {
                syncDocumentSnapshot(instance)
                updateJsonPath(instance)
            })
        }

        onMount?.(instance, monaco)
    }

    return (
        <Box className={styles.root}>
            {showJsonPath && (
                <Box className={styles.pathBar}>
                    <Text c="dimmed" ff="monospace" size="xs" truncate="end">
                        {jsonPath.map((segment, index) => (
                            <Fragment key={`${index}-${segment}`}>
                                {index > 0 && <span className={styles.pathSeparator}> › </span>}
                                <span
                                    className={
                                        index === jsonPath.length - 1
                                            ? styles.pathSegmentActive
                                            : undefined
                                    }
                                >
                                    {segment}
                                </span>
                            </Fragment>
                        ))}
                    </Text>
                </Box>
            )}

            <Editor
                defaultLanguage={defaultLanguage}
                language={language}
                loading={<LoaderModalShared mih="100%" />}
                onMount={handleMount}
                theme={MONACO_THEME_NAME}
                {...rest}
                options={{ ...BASE_MONACO_OPTIONS, ...options }}
                wrapperProps={{
                    ...wrapperProps,
                    className: clsx(styles.editorWrapper, wrapperProps?.className)
                }}
            />

            {footer}
        </Box>
    )
}

export { styles as editorClasses }

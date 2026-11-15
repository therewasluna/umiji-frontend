import { ActionIcon, Badge, Button, Collapse, Group, Text, Textarea, Tooltip } from '@mantine/core'
import {
    BROKER_BOT_LANG_NAMES,
    BROKER_BOT_RTL_LANGS,
    BROKER_BOT_TEXT_MAX,
    BROKER_BOT_TEXTS,
    TBrokerBotTextError
} from '@umiji/backend-contract'
import { ParseKeys, TFunction } from 'i18next'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbArrowBackUp,
    TbBold,
    TbCode,
    TbEyeOff,
    TbItalic,
    TbLink,
    TbQuote,
    TbStrikethrough,
    TbUnderline
} from 'react-icons/tb'

import classes from './bot-texts.module.css'
import { Key, kindOf, Lang, varsOf } from './bot-texts.utils'
import { GROUP_ICONS, KIND_ICONS } from './text-icons'

interface IProps {
    defaultText: string
    edited: (lang: Lang) => boolean
    error: TBrokerBotTextError | undefined
    erroredLangs: Set<Lang>
    lang: Lang
    langs: Lang[]
    onChange: (text: string) => void
    onLang: (lang: Lang) => void
    onReset: () => void
    textKey: Key
    value: string
}

const FORMATS = [
    { icon: TbBold, id: 'bold', open: '<b>', close: '</b>', hotkey: 'b' },
    { icon: TbItalic, id: 'italic', open: '<i>', close: '</i>', hotkey: 'i' },
    { icon: TbUnderline, id: 'underline', open: '<u>', close: '</u>', hotkey: 'u' },
    { icon: TbStrikethrough, id: 'strike', open: '<s>', close: '</s>' },
    { icon: TbCode, id: 'code', open: '<code>', close: '</code>' },
    { icon: TbEyeOff, id: 'spoiler', open: '<tg-spoiler>', close: '</tg-spoiler>' },
    { icon: TbQuote, id: 'quote', open: '<blockquote>', close: '</blockquote>' },
    { icon: TbLink, id: 'link', open: '<a href="https://">', close: '</a>' }
] as const

export function errorText(t: TFunction, e: TBrokerBotTextError): string {
    switch (e.code) {
        case 'tooLong':
            return t('broker-bot-texts.errors.tooLong', { max: e.max })
        case 'unknownVar':
            return t('broker-bot-texts.errors.unknownVar', { name: `{${e.name}}` })
        case 'badAttr':
        case 'nested':
        case 'unclosed':
        case 'unexpectedClose':
            return t(`broker-bot-texts.errors.${e.code}`, { tag: e.tag })
        default:
            return t(`broker-bot-texts.errors.${e.code}`)
    }
}

export function TextField(props: IProps) {
    const { defaultText, edited, error, erroredLangs, lang, langs, onChange, onLang, onReset } =
        props
    const { textKey, value } = props
    const { t } = useTranslation()
    const ref = useRef<HTMLTextAreaElement>(null)
    const [showDefault, setShowDefault] = useState(false)

    const kind = kindOf(textKey)
    const isHtml = kind === 'message'
    const max = BROKER_BOT_TEXT_MAX[kind]
    const vars = varsOf(textKey)
    const isEdited = edited(lang)
    const dir = BROKER_BOT_RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
    const KindIcon = KIND_ICONS[kind]
    const GroupIcon = GROUP_ICONS[BROKER_BOT_TEXTS[textKey].group]

    // Edits through the toolbar keep the selection, so formatting can be stacked.
    const replaceSelection = (open: string, close = '', placeholder = '') => {
        const el = ref.current
        if (!el) return
        const { selectionEnd: end, selectionStart: start } = el
        const picked = value.slice(start, end) || placeholder
        onChange(value.slice(0, start) + open + picked + close + value.slice(end))
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(start + open.length, start + open.length + picked.length)
        })
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isHtml || !(e.metaKey || e.ctrlKey)) return
        const format = FORMATS.find((f) => 'hotkey' in f && f.hotkey === e.key.toLowerCase())
        if (format) {
            e.preventDefault()
            replaceSelection(format.open, format.close)
        }
    }

    const count = value.length
    const countState = count > max ? 'over' : count > max * 0.9 ? 'near' : undefined

    return (
        <div className={classes.field}>
            <div className={classes.fieldHead}>
                <div className={classes.fieldIcon}>
                    <GroupIcon size={22} />
                </div>
                <div className={classes.fieldTitle}>
                    <Group gap={8} wrap="nowrap">
                        <Text fw={600} fz={17} lh={1.25}>
                            {t(`broker-bot-texts.keys.${textKey}.label`)}
                        </Text>
                        <Badge
                            color="gray"
                            leftSection={<KindIcon size={12} />}
                            radius="sm"
                            size="sm"
                            tt="none"
                            variant="soft"
                        >
                            {t(`broker-bot-texts.kinds.${kind}`)}
                        </Badge>
                    </Group>
                    <Text c="dimmed" size="sm">
                        {t(`broker-bot-texts.keys.${textKey}.hint`)}
                    </Text>
                </div>
            </div>

            <div
                aria-label={t('broker-bot-texts.languages.title')}
                className={classes.langTabs}
                role="tablist"
            >
                {langs.map((l) => (
                    <button
                        aria-selected={l === lang}
                        className={classes.langTab}
                        data-active={l === lang || undefined}
                        key={l}
                        onClick={() => onLang(l)}
                        role="tab"
                        type="button"
                    >
                        <span className={classes.langTabCode}>{l.toUpperCase()}</span>
                        {BROKER_BOT_LANG_NAMES[l]}
                        {erroredLangs.has(l) ? (
                            <span className={classes.dot} data-tone="error" />
                        ) : (
                            edited(l) && <span className={classes.dot} />
                        )}
                    </button>
                ))}
            </div>

            <div className={classes.editorBox} data-error={!!error || undefined}>
                {isHtml && (
                    <div className={classes.toolbar}>
                        {FORMATS.map((f) => (
                            <Tooltip
                                key={f.id}
                                label={t(`broker-bot-texts.format.${f.id}`)}
                                openDelay={300}
                                withArrow
                            >
                                <ActionIcon
                                    aria-label={t(`broker-bot-texts.format.${f.id}`)}
                                    color="gray"
                                    onClick={() =>
                                        replaceSelection(
                                            f.open,
                                            f.close,
                                            f.id === 'link'
                                                ? t('broker-bot-texts.format.link-text')
                                                : ''
                                        )
                                    }
                                    onMouseDown={(e) => e.preventDefault()}
                                    size={30}
                                    variant="subtle"
                                >
                                    <f.icon size={17} />
                                </ActionIcon>
                            </Tooltip>
                        ))}
                    </div>
                )}

                <Textarea
                    autosize
                    classNames={{ input: classes.textInput }}
                    dir={dir}
                    maxRows={kind === 'message' ? 22 : 3}
                    minRows={kind === 'message' ? 6 : 1}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    onKeyDown={onKeyDown}
                    ref={ref}
                    spellCheck={false}
                    value={value}
                    variant="unstyled"
                />

                {vars.length > 0 && (
                    <div className={classes.varBar}>
                        <Text c="dimmed" fz={11} fw={600} tt="uppercase" lts={0.6}>
                            {t('broker-bot-texts.insert-variable')}
                        </Text>
                        {vars.map((v) => (
                            <Tooltip
                                key={v}
                                label={t(`broker-bot-texts.vars.${v}` as ParseKeys)}
                                openDelay={200}
                                withArrow
                            >
                                <button
                                    className={classes.varChip}
                                    onClick={() => replaceSelection(`{${v}}`)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    type="button"
                                >
                                    {`{${v}}`}
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                )}
            </div>

            <div className={classes.fieldFoot}>
                <Group gap="xs" miw={0} wrap="nowrap">
                    {error ? (
                        <Text c="red.4" size="sm">
                            {errorText(t, error)}
                        </Text>
                    ) : isEdited ? (
                        <Badge color="rose" radius="sm" size="sm" variant="soft">
                            {t('broker-bot-texts.edited')}
                        </Badge>
                    ) : (
                        <Text c="dimmed" size="sm">
                            {t('broker-bot-texts.using-default')}
                        </Text>
                    )}
                </Group>
                <Group gap="xs" wrap="nowrap">
                    <Text
                        className={classes.counter}
                        data-state={countState}
                        ff="monospace"
                        size="xs"
                    >
                        {count} / {max}
                    </Text>
                    {isEdited && (
                        <>
                            <Button
                                color="gray"
                                onClick={() => setShowDefault((v) => !v)}
                                size="compact-sm"
                                variant="subtle"
                            >
                                {showDefault
                                    ? t('broker-bot-texts.hide-default')
                                    : t('broker-bot-texts.show-default')}
                            </Button>
                            <Button
                                color="gray"
                                leftSection={<TbArrowBackUp size={15} />}
                                onClick={onReset}
                                size="compact-sm"
                                variant="soft"
                            >
                                {t('broker-bot-texts.reset')}
                            </Button>
                        </>
                    )}
                </Group>
            </div>

            <Collapse expanded={isEdited && showDefault}>
                <div className={classes.defaultBox} dir={dir}>
                    {defaultText}
                </div>
            </Collapse>
        </div>
    )
}

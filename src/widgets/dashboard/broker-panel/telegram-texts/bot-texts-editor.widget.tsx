import { Button, Select, Stack, Text } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import {
    BROKER_BOT_LANG_NAMES,
    BROKER_BOT_TEXT_GROUPS,
    BROKER_BOT_TEXT_KEYS,
    BROKER_BOT_TEXTS
} from '@umiji/backend-contract'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbInfoCircle } from 'react-icons/tb'
import { useBlocker } from 'react-router'

import { useUpdateBrokerBotTexts } from '@shared/api/hooks'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'

import classes from './bot-texts.module.css'
import {
    bodyOf,
    countChanges,
    Draft,
    draftFrom,
    errorsOf,
    isEdited,
    Key,
    Lang,
    TextsData,
    textOf,
    withText
} from './bot-texts.utils'
import { LanguagesCard } from './languages-card'
import { TelegramPreview } from './telegram-preview'
import { TextField } from './text-field'
import { TextRail } from './text-rail'

interface IProps {
    botName: null | string
    data: TextsData
}

export function BotTextsEditorWidget({ botName, data }: IProps) {
    const { t } = useTranslation()

    const saved = useMemo(() => draftFrom(data), [data])
    const [draft, setDraft] = useState<Draft>(saved)
    // A save answers with the stored texts: start over from them.
    const [savedSeen, setSavedSeen] = useState(saved)
    if (savedSeen !== saved) {
        setSavedSeen(saved)
        setDraft(saved)
    }

    const [selected, setSelected] = useState<Key>('greeting')
    const [pickedLang, setPickedLang] = useState<Lang>(data.defaultLang)
    const lang = draft.langs.includes(pickedLang) ? pickedLang : draft.defaultLang

    const changes = countChanges(draft, saved)
    const errors = useMemo(() => errorsOf(draft), [draft])
    const isDirty = changes > 0

    const edited = useMemo(
        () =>
            new Set(
                BROKER_BOT_TEXT_KEYS.filter((k) => draft.langs.some((l) => isEdited(draft, l, k)))
            ),
        [draft]
    )
    const errored = useMemo(
        () => new Set([...errors.keys()].map((id) => id.split('.')[1] as Key)),
        [errors]
    )
    const erroredLangs = new Set(draft.langs.filter((l) => errors.has(`${l}.${selected}`)))

    const { mutate, isPending } = useUpdateBrokerBotTexts({
        mutationFns: {
            onSuccess: () =>
                notifications.show({ color: 'teal', message: t('broker-bot-texts.saved') })
        }
    })

    const save = () => {
        if (!isDirty || errors.size || isPending) return
        mutate({ variables: bodyOf(draft) })
    }

    // Works inside the text box too.
    useHotkeys([['mod+S', save]], [])

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    )
    useEffect(() => {
        if (blocker.state !== 'blocked') return
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
            confirmProps: { color: 'red', variant: 'soft' },
            cancelProps: { variant: 'light' },
            onConfirm: () => blocker.proceed(),
            onCancel: () => blocker.reset()
        })
    }, [blocker])

    useEffect(() => {
        if (!isDirty) return undefined
        const warn = (e: BeforeUnloadEvent) => e.preventDefault()
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    const isStaff = BROKER_BOT_TEXTS[selected].group === 'staff'
    const pickerData = BROKER_BOT_TEXT_GROUPS.map((group) => ({
        group: t(`broker-bot-texts.groups.${group}`),
        items: BROKER_BOT_TEXT_KEYS.filter((k) => BROKER_BOT_TEXTS[k].group === group).map((k) => ({
            value: k,
            label: t(`broker-bot-texts.keys.${k}.label`)
        }))
    }))

    return (
        <Stack gap="md">
            <LanguagesCard
                draft={draft}
                onChange={(next) => setDraft((d) => ({ ...d, ...next }))}
            />

            <div className={classes.workspace}>
                <div className={classes.railCol}>
                    <TextRail
                        edited={edited}
                        errored={errored}
                        onSelect={setSelected}
                        selected={selected}
                        textOf={(key) => textOf(draft, data.defaults, lang, key)}
                    />
                </div>

                <div className={classes.editorCol}>
                    <Select
                        allowDeselect={false}
                        className={classes.mobilePicker}
                        data={pickerData}
                        maxDropdownHeight={360}
                        onChange={(v) => v && setSelected(v as Key)}
                        searchable
                        size="md"
                        value={selected}
                    />
                    <SettingsCardShared.Container>
                        <TextField
                            defaultText={data.defaults[lang][selected]}
                            edited={(l) => isEdited(draft, l, selected)}
                            error={errors.get(`${lang}.${selected}`)}
                            erroredLangs={erroredLangs}
                            key={selected}
                            lang={lang}
                            langs={draft.langs}
                            onChange={(text) =>
                                setDraft((d) => withText(d, data.defaults, lang, selected, text))
                            }
                            onLang={setPickedLang}
                            onReset={() =>
                                setDraft((d) =>
                                    withText(
                                        d,
                                        data.defaults,
                                        lang,
                                        selected,
                                        data.defaults[lang][selected]
                                    )
                                )
                            }
                            textKey={selected}
                            value={textOf(draft, data.defaults, lang, selected)}
                        />
                        {isStaff && lang !== draft.defaultLang && (
                            <div className={classes.note}>
                                <TbInfoCircle size={16} />
                                <Text size="sm">
                                    {t('broker-bot-texts.staff-note', {
                                        lang: BROKER_BOT_LANG_NAMES[draft.defaultLang]
                                    })}
                                </Text>
                            </div>
                        )}
                    </SettingsCardShared.Container>
                </div>

                <div className={classes.previewCol}>
                    <div className={classes.previewHead}>
                        <Text fw={600} size="sm">
                            {t('broker-bot-texts.preview.title')}
                        </Text>
                        <Text c="dimmed" size="xs">
                            {t('broker-bot-texts.preview.hint')}
                        </Text>
                    </div>
                    <TelegramPreview
                        botName={botName}
                        defaults={data.defaults}
                        draft={draft}
                        lang={lang}
                        selected={selected}
                    />
                </div>
            </div>

            {isDirty && (
                <div className={classes.saveBar} role="status">
                    <span
                        className={classes.saveDot}
                        data-tone={errors.size ? 'error' : undefined}
                    />
                    <Text className={classes.saveText} size="sm">
                        {errors.size
                            ? t('broker-bot-texts.fix-errors', { count: errors.size })
                            : t('broker-bot-texts.unsaved', { count: changes })}
                    </Text>
                    <Button color="gray" onClick={() => setDraft(saved)} variant="soft">
                        {t('broker-bot-texts.discard')}
                    </Button>
                    <Button
                        color="teal"
                        disabled={errors.size > 0}
                        loading={isPending}
                        onClick={save}
                        variant="soft"
                    >
                        {t('broker-bot-texts.save')}
                    </Button>
                </div>
            )}
        </Stack>
    )
}

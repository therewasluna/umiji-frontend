import {
    BROKER_BOT_LANGS,
    BROKER_BOT_TEXT_KEYS,
    BROKER_BOT_TEXTS,
    checkBrokerBotText,
    GetBrokerBotTextsCommand,
    TBrokerBotLang,
    TBrokerBotTextError,
    TBrokerBotTextKey
} from '@umiji/backend-contract'

export type Lang = TBrokerBotLang
export type Key = TBrokerBotTextKey
export type TextsData = GetBrokerBotTextsCommand.Response['response']
export type Defaults = TextsData['defaults']
export type Overrides = Partial<Record<Lang, Partial<Record<Key, string>>>>

export interface Draft {
    defaultLang: Lang
    langs: Lang[]
    texts: Overrides
}

export const kindOf = (key: Key) => BROKER_BOT_TEXTS[key].kind

export const varsOf = (key: Key): readonly string[] =>
    (BROKER_BOT_TEXTS[key] as { vars?: readonly string[] }).vars ?? []

/** Overrides that differ from the default, like the API keeps them. */
export function cleanTexts(texts: Overrides, defaults: Defaults): Overrides {
    const out: Overrides = {}
    for (const lang of BROKER_BOT_LANGS) {
        for (const key of BROKER_BOT_TEXT_KEYS) {
            const text = texts[lang]?.[key]
            if (text !== undefined && text !== defaults[lang][key]) {
                ;(out[lang] ??= {})[key] = text
            }
        }
    }
    return out
}

export const draftFrom = (data: TextsData): Draft => ({
    defaultLang: data.defaultLang,
    langs: data.langs,
    texts: cleanTexts(data.texts, data.defaults)
})

export const textOf = (draft: Draft, defaults: Defaults, lang: Lang, key: Key): string =>
    draft.texts[lang]?.[key] ?? defaults[lang][key]

export const isEdited = (draft: Draft, lang: Lang, key: Key) =>
    draft.texts[lang]?.[key] !== undefined

/** One change per text that differs, plus one each for the language list and the default. */
export function countChanges(draft: Draft, saved: Draft): number {
    let n = 0
    if (draft.langs.join() !== saved.langs.join()) n++
    if (draft.defaultLang !== saved.defaultLang) n++
    for (const lang of BROKER_BOT_LANGS) {
        for (const key of BROKER_BOT_TEXT_KEYS) {
            if (draft.texts[lang]?.[key] !== saved.texts[lang]?.[key]) n++
        }
    }
    return n
}

/** Problems in the languages the bot speaks. A switched-off language can't be fixed on screen. */
export function errorsOf(draft: Draft): Map<string, TBrokerBotTextError> {
    const errors = new Map<string, TBrokerBotTextError>()
    for (const lang of draft.langs) {
        for (const [key, text] of Object.entries(draft.texts[lang] ?? {})) {
            const error = checkBrokerBotText(key as Key, text ?? '')
            if (error) errors.set(`${lang}.${key}`, error)
        }
    }
    return errors
}

/** Sets a text; the default value clears the override. */
export function withText(
    draft: Draft,
    defaults: Defaults,
    lang: Lang,
    key: Key,
    text: string
): Draft {
    const byKey = { ...draft.texts[lang] }
    if (text === defaults[lang][key]) delete byKey[key]
    else byKey[key] = text
    return { ...draft, texts: { ...draft.texts, [lang]: byKey } }
}

/** What to save: a switched-off language keeps its texts, minus any the API would refuse. */
export function bodyOf(draft: Draft): Draft {
    const texts: Overrides = {}
    for (const [lang, byKey] of Object.entries(draft.texts) as [Lang, Overrides[Lang]][]) {
        const on = draft.langs.includes(lang)
        for (const [key, text] of Object.entries(byKey ?? {}) as [Key, string][]) {
            if (on || !checkBrokerBotText(key, text)) (texts[lang] ??= {})[key] = text
        }
    }
    return { ...draft, texts }
}

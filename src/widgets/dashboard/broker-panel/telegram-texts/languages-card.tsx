import { Badge, Button, Switch, Text, Tooltip } from '@mantine/core'
import { BROKER_BOT_LANG_NAMES, BROKER_BOT_LANGS } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbCheck, TbStarFilled } from 'react-icons/tb'

import { SettingsCardShared } from '@shared/ui/settings-card'

import classes from './bot-texts.module.css'
import { Draft, Lang } from './bot-texts.utils'

interface IProps {
    draft: Draft
    onChange: (next: Pick<Draft, 'defaultLang' | 'langs'>) => void
}

export function LanguagesCard({ draft, onChange }: IProps) {
    const { t } = useTranslation()

    const toggle = (lang: Lang) => {
        const on = draft.langs.includes(lang)
        // Keeps the bot's language order fixed, whatever order they were switched on in.
        const langs = on
            ? draft.langs.filter((l) => l !== lang)
            : BROKER_BOT_LANGS.filter((l) => l === lang || draft.langs.includes(l))
        onChange({ langs, defaultLang: draft.defaultLang })
    }

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('broker-bot-texts.languages.description')}
                title={t('broker-bot-texts.languages.title')}
            />
            <SettingsCardShared.Content>
                <div className={classes.langGrid}>
                    {BROKER_BOT_LANGS.map((lang) => {
                        const enabled = draft.langs.includes(lang)
                        const isDefault = draft.defaultLang === lang
                        const edits = Object.keys(draft.texts[lang] ?? {}).length
                        return (
                            <div
                                className={classes.langTile}
                                data-default={isDefault || undefined}
                                data-enabled={enabled || undefined}
                                key={lang}
                            >
                                <div className={classes.langTileTop}>
                                    <span className={classes.langCode}>{lang.toUpperCase()}</span>
                                    <div className={classes.langNames}>
                                        <Text fw={600} lh={1.25} size="sm">
                                            {BROKER_BOT_LANG_NAMES[lang]}
                                        </Text>
                                        <Text c="dimmed" lh={1.3} size="xs">
                                            {t(`broker-bot-texts.languages.names.${lang}`)}
                                        </Text>
                                    </div>
                                    {isDefault ? (
                                        <Tooltip
                                            label={t('broker-bot-texts.languages.default-locked')}
                                            multiline
                                            w={220}
                                            withArrow
                                        >
                                            <span className={classes.langLocked}>
                                                <TbCheck size={14} />
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        <Switch
                                            aria-label={BROKER_BOT_LANG_NAMES[lang]}
                                            checked={enabled}
                                            onChange={() => toggle(lang)}
                                            size="sm"
                                        />
                                    )}
                                </div>
                                <div className={classes.langTileFoot}>
                                    {isDefault ? (
                                        <Badge
                                            color="rose"
                                            leftSection={<TbStarFilled size={10} />}
                                            radius="sm"
                                            size="sm"
                                            variant="soft"
                                        >
                                            {t('broker-bot-texts.languages.default')}
                                        </Badge>
                                    ) : (
                                        <Button
                                            color="gray"
                                            disabled={!enabled}
                                            onClick={() =>
                                                onChange({ langs: draft.langs, defaultLang: lang })
                                            }
                                            size="compact-xs"
                                            variant="subtle"
                                        >
                                            {t('broker-bot-texts.languages.make-default')}
                                        </Button>
                                    )}
                                    {edits > 0 && (
                                        <Text className={classes.langEdits} size="xs">
                                            {t('broker-bot-texts.languages.edited', {
                                                count: edits
                                            })}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

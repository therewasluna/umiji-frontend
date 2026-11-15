import { Chip, CloseButton, Text, TextInput } from '@mantine/core'
import {
    BROKER_BOT_TEXT_GROUPS,
    BROKER_BOT_TEXT_KEYS,
    BROKER_BOT_TEXTS
} from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbSearch } from 'react-icons/tb'

import classes from './bot-texts.module.css'
import { Key, kindOf } from './bot-texts.utils'
import { GROUP_ICONS, KIND_ICONS } from './text-icons'

interface IProps {
    /** Texts edited in any language. */
    edited: Set<Key>
    errored: Set<Key>
    onSelect: (key: Key) => void
    selected: Key
    /** The text in the language being edited, so a search finds words, not only names. */
    textOf: (key: Key) => string
}

export function TextRail({ edited, errored, onSelect, selected, textOf }: IProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')
    const [editedOnly, setEditedOnly] = useState(false)

    const q = query.trim().toLowerCase()
    const matches = (key: Key) =>
        (!editedOnly || edited.has(key)) &&
        (!q ||
            t(`broker-bot-texts.keys.${key}.label`).toLowerCase().includes(q) ||
            key.toLowerCase().includes(q) ||
            textOf(key).toLowerCase().includes(q))

    const groups = BROKER_BOT_TEXT_GROUPS.map((group) => ({
        group,
        keys: BROKER_BOT_TEXT_KEYS.filter((k) => BROKER_BOT_TEXTS[k].group === group && matches(k))
    })).filter((g) => g.keys.length)

    return (
        <nav aria-label={t('broker-bot-texts.title')} className={classes.rail}>
            <div className={classes.railTools}>
                <TextInput
                    leftSection={<TbSearch size={15} />}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    placeholder={t('broker-bot-texts.search')}
                    rightSection={query && <CloseButton onClick={() => setQuery('')} size="sm" />}
                    size="sm"
                    value={query}
                />
                <Chip
                    checked={editedOnly}
                    color="rose"
                    disabled={!edited.size && !editedOnly}
                    onChange={setEditedOnly}
                    size="xs"
                    variant="light"
                >
                    {t('broker-bot-texts.edited-only', { count: edited.size })}
                </Chip>
            </div>

            <div className={classes.railList}>
                {groups.length === 0 && (
                    <Text c="dimmed" p="md" size="sm" ta="center">
                        {t('broker-bot-texts.nothing-found')}
                    </Text>
                )}
                {groups.map(({ group, keys }) => {
                    const GroupIcon = GROUP_ICONS[group]
                    return (
                        <div className={classes.railGroup} key={group}>
                            <div className={classes.railGroupHead}>
                                <GroupIcon size={14} />
                                {t(`broker-bot-texts.groups.${group}`)}
                            </div>
                            {keys.map((key) => {
                                const KindIcon = KIND_ICONS[kindOf(key)]
                                return (
                                    <button
                                        aria-current={key === selected || undefined}
                                        className={classes.railItem}
                                        data-active={key === selected || undefined}
                                        key={key}
                                        onClick={() => onSelect(key)}
                                        type="button"
                                    >
                                        <KindIcon className={classes.railKind} size={14} />
                                        <span className={classes.railLabel}>
                                            {t(`broker-bot-texts.keys.${key}.label`)}
                                        </span>
                                        {errored.has(key) ? (
                                            <span className={classes.dot} data-tone="error" />
                                        ) : (
                                            edited.has(key) && <span className={classes.dot} />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}

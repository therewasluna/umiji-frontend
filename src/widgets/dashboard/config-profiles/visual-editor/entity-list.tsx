import {
    ActionIcon,
    Box,
    Button,
    Collapse,
    Group,
    Text,
    Tooltip,
    UnstyledButton
} from '@mantine/core'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbArrowDown,
    TbArrowUp,
    TbChevronRight,
    TbCopy,
    TbPlus,
    TbPuzzle,
    TbTrash
} from 'react-icons/tb'

import { IssueDot } from './fields'
import { asObj, Obj } from './schema/types'
import classes from './visual-editor.module.css'

export interface EntityHead {
    // A required field is empty somewhere inside, or Xray's last error is about this item.
    invalid?: boolean
    meta?: (string | undefined)[]
    tile: ReactNode
    title: string
}

interface Props {
    addLabel: string
    empty: string
    head: (item: Obj, index: number) => EntityHead
    items: unknown[]
    // Call reveal() once the new item is appended so it opens.
    onAdd: (reveal: () => void) => void
    onChange: (items: unknown[]) => void
    onSnippet?: () => void
    renderBody: (item: Obj, onItemChange: (next: unknown) => void, index: number) => ReactNode
    // Shown left of the add buttons; the section heading for top-level lists, a small title otherwise.
    heading?: ReactNode
    title?: string
}

// Collapsible cards for the big lists (inbounds, outbounds, rules...). New items open on arrival.
export function EntityList(props: Props) {
    const { addLabel, empty, head, heading, items, onAdd, onChange, onSnippet, renderBody, title } =
        props
    const { t } = useTranslation()
    const [open, setOpen] = useState<Set<number>>(new Set())
    const reveal = () => setOpen((o) => new Set([...o, items.length]))
    const add = () => onAdd(reveal)

    const toggle = (i: number) => {
        const next = new Set(open)
        if (next.has(i)) next.delete(i)
        else next.add(i)
        setOpen(next)
    }

    const move = (i: number, d: number) => {
        const next = [...items]
        ;[next[i], next[i + d]] = [next[i + d], next[i]]
        const o = new Set([...open].map((x) => (x === i ? i + d : x === i + d ? i : x)))
        setOpen(o)
        onChange(next)
    }

    const remove = (i: number) => {
        setOpen(new Set([...open].filter((x) => x !== i).map((x) => (x > i ? x - 1 : x))))
        onChange(items.filter((_, j) => j !== i))
    }

    const duplicate = (i: number) => {
        const copy = structuredClone(items[i])
        if (copy && typeof copy === 'object' && 'tag' in copy) {
            ;(copy as Obj).tag = `${(copy as Obj).tag}_copy`
        }
        reveal()
        onChange([...items, copy])
    }

    return (
        <Box>
            <Group
                align="center"
                className={classes.listHeader}
                justify="space-between"
                mb="md"
                wrap="wrap"
            >
                {heading ??
                    (title ? (
                        <Group gap={8}>
                            <Text fw={600} size="md">
                                {title}
                            </Text>
                            <span className={classes.count}>{items.length}</span>
                        </Group>
                    ) : (
                        <span />
                    ))}
                <Group gap="xs">
                    {onSnippet && (
                        <Button
                            color="gray"
                            leftSection={<TbPuzzle size={16} />}
                            onClick={() => {
                                reveal()
                                onSnippet()
                            }}
                            variant="soft"
                        >
                            {t('config-visual-editor.insert-snippet')}
                        </Button>
                    )}
                    <Button
                        color="teal"
                        leftSection={<TbPlus size={16} />}
                        onClick={add}
                        variant="soft"
                    >
                        {addLabel}
                    </Button>
                </Group>
            </Group>

            {items.length === 0 && (
                <UnstyledButton className={classes.empty} onClick={add}>
                    <TbPlus size={20} />
                    <Text size="sm">{empty}</Text>
                </UnstyledButton>
            )}

            <div className={classes.list}>
                {items.map((item, i) => {
                    const o = asObj(item)
                    const h = head(o, i)
                    const isOpen = open.has(i)
                    return (
                        <div
                            className={classes.entity}
                            data-invalid={h.invalid || undefined}
                            data-open={isOpen || undefined}
                            key={i}
                        >
                            <div className={classes.entityHead}>
                                <UnstyledButton
                                    aria-expanded={isOpen}
                                    className={classes.entityToggle}
                                    onClick={() => toggle(i)}
                                >
                                    <span className={classes.tile}>{h.tile}</span>
                                    <Box miw={0} style={{ flex: 1 }}>
                                        <Text className={classes.entityTitle} truncate>
                                            {h.title}
                                        </Text>
                                        <div className={classes.meta}>
                                            {h.meta?.filter(Boolean).map((m) => (
                                                <span className={classes.chip} key={m}>
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </Box>
                                    {h.invalid && <IssueDot />}
                                    <TbChevronRight className={classes.chevron} size={18} />
                                </UnstyledButton>
                                <Group className={classes.entityActions} gap={2} wrap="nowrap">
                                    <Tooltip label={t('config-visual-editor.move-up')} withArrow>
                                        <ActionIcon
                                            aria-label={t('config-visual-editor.move-up')}
                                            color="gray"
                                            disabled={i === 0}
                                            onClick={() => move(i, -1)}
                                            variant="subtle"
                                        >
                                            <TbArrowUp size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label={t('config-visual-editor.move-down')} withArrow>
                                        <ActionIcon
                                            aria-label={t('config-visual-editor.move-down')}
                                            color="gray"
                                            disabled={i === items.length - 1}
                                            onClick={() => move(i, 1)}
                                            variant="subtle"
                                        >
                                            <TbArrowDown size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label={t('config-visual-editor.duplicate')} withArrow>
                                        <ActionIcon
                                            aria-label={t('config-visual-editor.duplicate')}
                                            color="gray"
                                            onClick={() => duplicate(i)}
                                            variant="subtle"
                                        >
                                            <TbCopy size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label={t('config-visual-editor.remove')} withArrow>
                                        <ActionIcon
                                            aria-label={t('config-visual-editor.remove')}
                                            color="red"
                                            onClick={() => remove(i)}
                                            variant="subtle"
                                        >
                                            <TbTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </div>
                            <Collapse expanded={isOpen}>
                                {isOpen && (
                                    <div className={classes.entityBody}>
                                        {renderBody(
                                            o,
                                            (next) =>
                                                onChange(items.map((x, j) => (j === i ? next : x))),
                                            i
                                        )}
                                    </div>
                                )}
                            </Collapse>
                        </div>
                    )
                })}
            </div>
        </Box>
    )
}

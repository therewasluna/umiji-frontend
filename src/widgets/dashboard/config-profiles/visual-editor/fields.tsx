import {
    ActionIcon,
    Autocomplete,
    Box,
    Button,
    Collapse,
    Group,
    NumberInput,
    Select,
    Switch,
    TagsInput,
    Text,
    Textarea,
    TextInput,
    Tooltip,
    UnstyledButton
} from '@mantine/core'
import { createContext, ReactNode, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbArrowDown,
    TbArrowUp,
    TbChevronRight,
    TbInfoCircle,
    TbPlus,
    TbSparkles,
    TbTrash,
    TbX
} from 'react-icons/tb'

import { generateValue } from './generators'
import {
    asList,
    asObj,
    Field,
    isObj,
    Obj,
    Option,
    OptionSource,
    resolveFields
} from './schema/types'
import classes from './visual-editor.module.css'

export interface IEditorContext {
    sources: Record<OptionSource, string[]>
}

export const EditorContext = createContext<IEditorContext>({
    sources: { balancerTags: [], inboundTags: [], outboundTags: [], snippets: [] }
})

// The key Xray's last error names, set only inside the inbound/outbound that error is about.
export const IssueContext = createContext<string | undefined>(undefined)

const ACRONYMS: Record<string, string> = {
    alpn: 'ALPN',
    dns: 'DNS',
    ech: 'ECH',
    grpc: 'gRPC',
    http: 'HTTP',
    id: 'ID',
    ids: 'IDs',
    ip: 'IP',
    ips: 'IPs',
    ipv4: 'IPv4',
    ipv6: 'IPv6',
    mptcp: 'MPTCP',
    mtu: 'MTU',
    rtt: 'RTT',
    sni: 'SNI',
    sse: 'SSE',
    tcp: 'TCP',
    tls: 'TLS',
    ttl: 'TTL',
    udp: 'UDP',
    url: 'URL',
    uuid: 'UUID',
    xudp: 'XUDP',
    udp443: 'UDP443'
}

export const humanize = (key: string) =>
    key
        .replace(/_/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(' ')
        .map((w, i) => {
            const lower = w.toLowerCase()
            if (ACRONYMS[lower]) return ACRONYMS[lower]
            return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower
        })
        .join(' ')

const isEmpty = (v: unknown) =>
    v === undefined ||
    v === null ||
    v === '' ||
    (Array.isArray(v) && v.length === 0) ||
    (isObj(v) && Object.keys(v).length === 0)

// True when a field here (or in a nested object or list item) is required but empty, or is the flagged key.
// An absent object only counts when its show() makes it apply (security "reality" needs realitySettings);
// an optional one nobody filled in, like a rule's webhook, does not.
export const hasMissing = (fields: Field[], value: Obj, flagged?: string): boolean =>
    fields.some((f) => {
        if (f.show && !f.show(value)) return false
        const v = value[f.key]
        if ((f.req && isEmpty(v)) || f.key === flagged) return true
        if (f.kind === 'object' && (isObj(v) || f.show)) {
            const o = asObj(v)
            return hasMissing(resolveFields(f, o, value), o, flagged)
        }
        if (f.kind === 'list') {
            return asList(v).some(
                (item) => isObj(item) && hasMissing(resolveFields(f, item, item), item, flagged)
            )
        }
        return false
    })

export function IssueDot() {
    const { t } = useTranslation()
    return (
        <span
            aria-label={t('config-visual-editor.needs-attention')}
            className={classes.dot}
            role="img"
        />
    )
}

// Empty values are removed so the JSON stays as small as a hand-written one.
export const setKey = (o: Obj, key: string, v: unknown): Obj => {
    const next = { ...o }
    if (isEmpty(v)) delete next[key]
    else next[key] = v
    return next
}

const toScalar = (s: string): unknown => {
    const t = s.trim()
    if (t === '') return undefined
    if (/^-?\d+$/.test(t) && t.length < 16) return Number(t)
    if (t === 'true' || t === 'false') return t === 'true'
    return s
}

const BELOW: ('description' | 'error' | 'input' | 'label')[] = [
    'label',
    'input',
    'description',
    'error'
]

const FULL_KINDS = new Set(['json', 'lines', 'list', 'managed', 'map', 'object'])

const isFull = (f: Field) => f.full || FULL_KINDS.has(f.kind)

const order = (f: Field) => (isFull(f) ? 2 : f.kind === 'bool' ? 1 : 0)

function useOptions(options: Option[] | OptionSource | undefined, current?: unknown) {
    const { sources } = useContext(EditorContext)
    const base = typeof options === 'string' ? sources[options] : (options ?? [])
    const data = base.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
    // Keep a value the list does not know about selectable, so existing configs still display.
    for (const v of Array.isArray(current) ? current : [current]) {
        if (typeof v === 'string' && v !== '' && !data.some((d) => d.value === v)) {
            data.push({ value: v, label: v })
        }
    }
    return data
}

function Label(props: { field: Field }) {
    const { field } = props
    const label = field.label ?? humanize(field.key)
    return (
        <span className={classes.label}>
            {label}
            {label.replace(/\W/g, '').toLowerCase() !==
                field.key.replace(/\W/g, '').toLowerCase() && (
                <span className={classes.key}>{field.key}</span>
            )}
        </span>
    )
}

function GenerateButton(props: { onGenerate: () => void }) {
    const { t } = useTranslation()
    return (
        <Tooltip label={t('config-visual-editor.generate')} withArrow>
            <ActionIcon
                aria-label={t('config-visual-editor.generate')}
                color="gray"
                onClick={props.onGenerate}
                variant="subtle"
            >
                <TbSparkles size={16} />
            </ActionIcon>
        </Tooltip>
    )
}

interface ControlProps {
    field: Field
    invalid?: boolean
    onChange: (v: unknown) => void
    parent: Obj
    // Inside an optional object nobody has filled in, so its required fields are not missing yet.
    quiet?: boolean
    value: unknown
}

function SelectControl(props: ControlProps & { field: Extract<Field, { kind: 'select' }> }) {
    const { field, invalid, value, onChange } = props
    const data = useOptions(field.options, value === undefined ? undefined : String(value))
    const common = {
        description: field.hint,
        error: invalid,
        inputWrapperOrder: BELOW,
        label: <Label field={field} />,
        placeholder: field.placeholder,
        withAsterisk: field.req
    }

    if (field.free) {
        return (
            <Autocomplete
                {...common}
                data={data}
                onChange={(v) => onChange(v === '' ? undefined : v)}
                value={value === undefined ? '' : String(value)}
            />
        )
    }

    return (
        <Select
            {...common}
            allowDeselect={false}
            clearable={!field.req}
            comboboxProps={{ withinPortal: true }}
            data={data}
            onChange={(v) => onChange(v ?? undefined)}
            searchable={data.length > 8}
            value={value === undefined ? null : String(value)}
        />
    )
}

function TagsControl(props: ControlProps & { field: Extract<Field, { kind: 'tags' }> }) {
    const { field, invalid, value, onChange } = props
    const current = asList(value).map(String)
    const data = useOptions(field.options).map((d) => d.value)
    const gen = field.gen
    return (
        <TagsInput
            classNames={{ inputField: classes.tagsField }}
            clearable
            data={data}
            description={field.hint}
            error={invalid}
            inputWrapperOrder={BELOW}
            label={<Label field={field} />}
            onChange={(v) =>
                onChange(field.numeric ? v.map(Number).filter((n) => !Number.isNaN(n)) : v)
            }
            rightSection={
                gen ? (
                    <GenerateButton onGenerate={() => onChange([...current, generateValue(gen)])} />
                ) : undefined
            }
            splitChars={[',', ' ']}
            value={current}
            withAsterisk={field.req}
        />
    )
}

function JsonControl(props: ControlProps & { onRemove?: () => void }) {
    const { field, invalid, value, onChange, onRemove } = props
    const { t } = useTranslation()
    const pretty = value === undefined ? '' : JSON.stringify(value, null, 2)
    const [draft, setDraft] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const commit = () => {
        if (draft === null) return
        try {
            onChange(draft.trim() === '' ? undefined : JSON.parse(draft))
            setDraft(null)
            setError(null)
        } catch {
            setError(t('config-visual-editor.invalid-json'))
        }
    }

    return (
        <Textarea
            autosize
            classNames={{ input: classes.mono }}
            description={field.hint}
            error={error ?? invalid}
            label={
                <Group gap={6} wrap="nowrap">
                    <Label field={field} />
                    {onRemove && (
                        <ActionIcon color="gray" onClick={onRemove} size="xs" variant="subtle">
                            <TbX size={12} />
                        </ActionIcon>
                    )}
                </Group>
            }
            maxRows={14}
            minRows={2}
            onBlur={commit}
            onChange={(e) => setDraft(e.currentTarget.value)}
            placeholder={'placeholder' in field ? field.placeholder : undefined}
            value={draft ?? pretty}
        />
    )
}

function MapControl(props: ControlProps & { field: Extract<Field, { kind: 'map' }> }) {
    const { field, invalid, value, onChange } = props
    const { t } = useTranslation()
    const entries = Object.entries(asObj(value))
    const write = (next: [string, unknown][]) => onChange(Object.fromEntries(next))

    return (
        <Box className={classes.group} data-invalid={invalid || undefined}>
            <Group justify="space-between" mb={entries.length ? 'xs' : 0} wrap="nowrap">
                <Box>
                    <Label field={field} />
                    {field.hint && (
                        <Text c="dimmed" size="xs">
                            {field.hint}
                        </Text>
                    )}
                </Box>
                <Button
                    color="gray"
                    leftSection={<TbPlus size={14} />}
                    onClick={() =>
                        write([
                            ...entries,
                            [`key${entries.length + 1}`, field.values === 'tags' ? [] : '']
                        ])
                    }
                    size="compact-sm"
                    variant="soft"
                >
                    {t('config-visual-editor.add')}
                </Button>
            </Group>
            {entries.map(([k, v], i) => (
                <Group align="flex-start" gap="xs" key={i} mt={6} wrap="nowrap">
                    <TextInput
                        aria-label={t('config-visual-editor.key')}
                        classNames={{ input: classes.mono }}
                        onChange={(e) =>
                            write(
                                entries.map((en, j) =>
                                    j === i ? [e.currentTarget.value, en[1]] : en
                                )
                            )
                        }
                        style={{ flex: '0 0 38%' }}
                        value={k}
                    />
                    {field.values === 'tags' ? (
                        <TagsInput
                            aria-label={t('config-visual-editor.value')}
                            classNames={{ inputField: classes.tagsField }}
                            onChange={(nv) =>
                                write(entries.map((en, j) => (j === i ? [en[0], nv] : en)))
                            }
                            splitChars={[',', ' ']}
                            style={{ flex: 1 }}
                            value={asList(v).map(String)}
                        />
                    ) : (
                        <TextInput
                            aria-label={t('config-visual-editor.value')}
                            onChange={(e) =>
                                write(
                                    entries.map((en, j) =>
                                        j === i ? [en[0], e.currentTarget.value] : en
                                    )
                                )
                            }
                            style={{ flex: 1 }}
                            value={String(v ?? '')}
                        />
                    )}
                    <ActionIcon
                        aria-label={t('config-visual-editor.remove')}
                        color="gray"
                        mt={6}
                        onClick={() => write(entries.filter((_, j) => j !== i))}
                        variant="subtle"
                    >
                        <TbTrash size={16} />
                    </ActionIcon>
                </Group>
            ))}
        </Box>
    )
}

function ObjectControl(props: ControlProps & { field: Extract<Field, { kind: 'object' }> }) {
    const { field, invalid, value, parent, onChange } = props
    const flagged = useContext(IssueContext)
    const current = asObj(value)
    const count = Object.keys(current).length
    const fields = resolveFields(field, current, parent)
    const quiet = !field.show && isEmpty(value)
    const bad = invalid || (!quiet && hasMissing(fields, current, flagged))
    // Opens on arrival when it needs filling in, like REALITY right after picking it.
    const [open, setOpen] = useState(!isEmpty(value) || bad)

    return (
        <Box
            className={classes.group}
            data-invalid={bad || undefined}
            data-open={open || undefined}
        >
            <UnstyledButton
                aria-expanded={open}
                className={classes.groupHeader}
                onClick={() => setOpen((o) => !o)}
            >
                <TbChevronRight className={classes.chevron} size={16} />
                <Box miw={0} style={{ flex: 1 }}>
                    <Label field={field} />
                    {field.hint && (
                        <Text c="dimmed" size="xs">
                            {field.hint}
                        </Text>
                    )}
                </Box>
                {bad && <IssueDot />}
                {count > 0 && <span className={classes.count}>{count}</span>}
            </UnstyledButton>
            <Collapse expanded={open}>
                <Box pt="sm">
                    <FieldsGrid
                        fields={fields}
                        onChange={(v) => onChange(v)}
                        quiet={quiet}
                        value={current}
                    />
                </Box>
            </Collapse>
        </Box>
    )
}

function ListControl(props: ControlProps & { field: Extract<Field, { kind: 'list' }> }) {
    const { field, invalid, value, onChange } = props
    const { t } = useTranslation()
    const flagged = useContext(IssueContext)
    const items = asList(value)
    const write = (next: unknown[]) => onChange(next)
    const itemBad = items.map(
        (item) => isObj(item) && hasMissing(resolveFields(field, item, item), item, flagged)
    )
    const move = (i: number, d: number) => {
        const next = [...items]
        ;[next[i], next[i + d]] = [next[i + d], next[i]]
        write(next)
    }

    return (
        <Box
            className={classes.group}
            data-invalid={invalid || itemBad.includes(true) || undefined}
        >
            <Group justify="space-between" wrap="nowrap">
                <Box miw={0}>
                    <Label field={field} />
                    {field.hint && (
                        <Text c="dimmed" size="xs">
                            {field.hint}
                        </Text>
                    )}
                </Box>
                <Button
                    color="gray"
                    leftSection={<TbPlus size={14} />}
                    onClick={() => write([...items, field.create?.() ?? {}])}
                    size="compact-sm"
                    variant="soft"
                >
                    {t('config-visual-editor.add')}
                </Button>
            </Group>
            {items.map((item, i) => {
                const o = asObj(item)
                return (
                    <Box
                        className={classes.listItem}
                        data-invalid={itemBad[i] || undefined}
                        key={i}
                        mt="sm"
                    >
                        <Group gap={4} justify="space-between" mb="xs" wrap="nowrap">
                            <Group gap={8} miw={0} wrap="nowrap">
                                <Text className={classes.itemTitle} truncate>
                                    {field.title?.(o, i) ?? `#${i + 1}`}
                                </Text>
                                {itemBad[i] && <IssueDot />}
                            </Group>
                            <Group gap={2} wrap="nowrap">
                                <ActionIcon
                                    aria-label={t('config-visual-editor.move-up')}
                                    color="gray"
                                    disabled={i === 0}
                                    onClick={() => move(i, -1)}
                                    size="sm"
                                    variant="subtle"
                                >
                                    <TbArrowUp size={14} />
                                </ActionIcon>
                                <ActionIcon
                                    aria-label={t('config-visual-editor.move-down')}
                                    color="gray"
                                    disabled={i === items.length - 1}
                                    onClick={() => move(i, 1)}
                                    size="sm"
                                    variant="subtle"
                                >
                                    <TbArrowDown size={14} />
                                </ActionIcon>
                                <ActionIcon
                                    aria-label={t('config-visual-editor.remove')}
                                    color="red"
                                    onClick={() => write(items.filter((_, j) => j !== i))}
                                    size="sm"
                                    variant="subtle"
                                >
                                    <TbTrash size={14} />
                                </ActionIcon>
                            </Group>
                        </Group>
                        {isObj(item) ? (
                            <FieldsGrid
                                fields={resolveFields(field, o, o)}
                                onChange={(v) => write(items.map((x, j) => (j === i ? v : x)))}
                                value={o}
                            />
                        ) : (
                            <JsonControl
                                field={{ kind: 'json', key: `${field.key}[${i}]` }}
                                onChange={(v) => write(items.map((x, j) => (j === i ? v : x)))}
                                parent={{}}
                                value={item}
                            />
                        )}
                    </Box>
                )
            })}
        </Box>
    )
}

export function FieldControl(props: ControlProps & { onRemove?: () => void }): ReactNode {
    const { field, quiet, value, onChange } = props
    const { t } = useTranslation()
    const flagged = useContext(IssueContext)
    // Red border only: in the visual editor the input itself is the error, no message under it.
    const invalid = (!quiet && !!field.req && isEmpty(value)) || flagged === field.key
    const common = {
        description: field.hint,
        error: invalid,
        inputWrapperOrder: BELOW,
        label: <Label field={field} />,
        withAsterisk: field.req
    }

    switch (field.kind) {
        case 'text': {
            const gen = field.gen
            return (
                <TextInput
                    {...common}
                    onChange={(e) => onChange(e.currentTarget.value)}
                    placeholder={field.placeholder}
                    rightSection={
                        gen ? (
                            <GenerateButton onGenerate={() => onChange(generateValue(gen))} />
                        ) : undefined
                    }
                    value={value === undefined ? '' : String(value)}
                />
            )
        }
        case 'number':
            return (
                <NumberInput
                    {...common}
                    allowDecimal
                    onChange={(v) =>
                        onChange(typeof v === 'number' ? v : v === '' ? undefined : Number(v))
                    }
                    placeholder={field.placeholder}
                    value={
                        typeof value === 'number' ? value : value === undefined ? '' : Number(value)
                    }
                />
            )
        case 'scalar':
            return (
                <TextInput
                    {...common}
                    onChange={(e) => onChange(toScalar(e.currentTarget.value))}
                    placeholder={field.placeholder}
                    value={value === undefined ? '' : String(value)}
                />
            )
        case 'bool': {
            const checked = value === undefined ? !!field.defaultOn : value === true
            return (
                <label className={classes.toggle}>
                    <Box miw={0}>
                        <Label field={field} />
                        {field.hint && (
                            <Text c="dimmed" size="xs">
                                {field.hint}
                            </Text>
                        )}
                    </Box>
                    <Switch
                        checked={checked}
                        onChange={(e) =>
                            onChange(
                                e.currentTarget.checked === !!field.defaultOn
                                    ? undefined
                                    : e.currentTarget.checked
                            )
                        }
                    />
                </label>
            )
        }
        case 'select':
            return <SelectControl {...props} field={field} invalid={invalid} />
        case 'tags':
            return <TagsControl {...props} field={field} invalid={invalid} />
        case 'lines':
            return (
                <Textarea
                    {...common}
                    autosize
                    classNames={{ input: classes.mono }}
                    maxRows={12}
                    minRows={2}
                    onChange={(e) =>
                        onChange(
                            e.currentTarget.value === ''
                                ? undefined
                                : e.currentTarget.value.split('\n')
                        )
                    }
                    placeholder={field.placeholder}
                    value={asList(value).join('\n')}
                />
            )
        case 'json':
            return <JsonControl {...props} invalid={invalid} />
        case 'map':
            return <MapControl {...props} field={field} invalid={invalid} />
        case 'object':
            return <ObjectControl {...props} field={field} invalid={invalid} />
        case 'list':
            return <ListControl {...props} field={field} invalid={invalid} />
        case 'managed':
            return (
                <Group className={classes.managed} gap="sm" wrap="nowrap">
                    <TbInfoCircle size={18} style={{ flexShrink: 0 }} />
                    <Box>
                        <Text fw={600} size="sm">
                            {humanize(field.key)} · {t('config-visual-editor.managed-by-umiji')}
                        </Text>
                        <Text c="dimmed" size="xs">
                            {field.hint}
                        </Text>
                    </Box>
                </Group>
            )
    }
}

interface GridProps {
    fields: Field[]
    // Keys treated as known when listing leftover keys; false hides leftovers.
    known?: false | string[]
    onChange: (v: Obj) => void
    quiet?: boolean
    value: Obj
}

export function FieldsGrid(props: GridProps) {
    const { fields, known, onChange, quiet, value } = props
    const visible = fields
        .filter((f) => !f.show || f.show(value))
        .sort((a, b) => order(a) - order(b))
    const knownKeys = known === false ? null : new Set(known ?? fields.map((f) => f.key))
    const extras = knownKeys ? Object.keys(value).filter((k) => !knownKeys.has(k)) : []

    const update = (f: Field, v: unknown) => {
        if (f.kind === 'select' && f.apply) onChange(f.apply(value, v as string | undefined))
        else onChange(setKey(value, f.key, v))
    }

    return (
        <div className={classes.grid}>
            {visible.map((f) => (
                <div
                    className={isFull(f) ? classes.full : undefined}
                    data-kind={f.kind}
                    key={f.key}
                >
                    <FieldControl
                        field={f}
                        onChange={(v) => update(f, v)}
                        parent={value}
                        quiet={quiet}
                        value={value[f.key]}
                    />
                </div>
            ))}
            {extras.map((k) => (
                <div className={classes.full} key={`extra-${k}`}>
                    <JsonControl
                        field={{ kind: 'json', key: k, label: k, hint: undefined }}
                        onChange={(v) => onChange(setKey(value, k, v))}
                        onRemove={() => onChange(setKey(value, k, undefined))}
                        parent={value}
                        value={value[k]}
                    />
                </div>
            ))}
        </div>
    )
}

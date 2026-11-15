import { Box, Modal, SimpleGrid, Tabs, Text, Title, UnstyledButton } from '@mantine/core'
import { ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import {
    TbAdjustmentsHorizontal,
    TbArrowBarToDown,
    TbArrowBarUp,
    TbDatabase,
    TbFileText,
    TbMask,
    TbRadar,
    TbRoute,
    TbShieldCheck,
    TbWorldSearch
} from 'react-icons/tb'

import { EntityList } from './entity-list'
import {
    EditorContext,
    FieldsGrid,
    hasMissing,
    humanize,
    IssueContext,
    IssueDot,
    setKey
} from './fields'
import {
    INBOUND_GENERAL,
    INBOUND_KEYS,
    INBOUND_PROTOCOLS,
    INBOUND_SOCKOPT,
    inboundMeta,
    inboundSettingsFields,
    MTPROTO_SOCKOPT,
    newInbound,
    SNIFFING_FIELDS
} from './schema/inbounds'
import {
    newOutbound,
    OUTBOUND_GENERAL,
    OUTBOUND_KEYS,
    OUTBOUND_PROTOCOLS,
    outboundMeta,
    outboundSettingsFields,
    PROXY_OUTBOUNDS,
    uniqueTag
} from './schema/outbounds'
import {
    ADVANCED_FIELDS,
    BALANCER_FIELDS,
    BURST_OBSERVATORY_FIELDS,
    DNS_FIELDS,
    DNS_SERVER_FIELDS,
    FAKEDNS_FIELDS,
    GEODATA_FIELDS,
    KNOWN_ROOT_KEYS,
    LOG_FIELDS,
    OBSERVATORY_FIELDS,
    POLICY_LEVEL_FIELDS,
    ROUTING_FIELDS,
    RULE_FIELDS,
    ruleSummary,
    SNIPPET_FIELDS
} from './schema/sections'
import {
    FINALMASK_FIELDS,
    securityTab,
    Side,
    SOCKOPT_FIELDS,
    STREAM_KEYS,
    transportTab
} from './schema/stream'
import { asList, asObj, Field, Obj } from './schema/types'
import { ScrollEdges, useScrollEdges } from './scroll-edges'
import classes from './visual-editor.module.css'

type SectionId =
    | 'advanced'
    | 'dns'
    | 'fakedns'
    | 'geodata'
    | 'inbounds'
    | 'log'
    | 'observatory'
    | 'outbounds'
    | 'policy'
    | 'routing'

const SECTIONS: { icon: IconType; id: SectionId }[] = [
    { id: 'inbounds', icon: TbArrowBarToDown },
    { id: 'outbounds', icon: TbArrowBarUp },
    { id: 'routing', icon: TbRoute },
    { id: 'dns', icon: TbWorldSearch },
    { id: 'log', icon: TbFileText },
    { id: 'policy', icon: TbShieldCheck },
    { id: 'observatory', icon: TbRadar },
    { id: 'fakedns', icon: TbMask },
    { id: 'geodata', icon: TbDatabase },
    { id: 'advanced', icon: TbAdjustmentsHorizontal }
]

// Sections that are one big list put their heading next to the add button.
const LIST_SECTIONS = new Set<SectionId>(['inbounds', 'outbounds', 'fakedns'])

const PORTS = [443, 8443, 2053, 2083, 2087, 2096, 8880]

const tagsOf = (list: unknown) =>
    asList(list)
        .map((x) => asObj(x).tag)
        .filter((t): t is string => typeof t === 'string' && t !== '')

const tile = (protocol: string) => {
    const short: Record<string, string> = {
        blackhole: 'BH',
        block: 'BH',
        direct: 'FR',
        'dokodemo-door': 'TN',
        freedom: 'FR',
        http: 'HT',
        hysteria: 'HY2',
        mixed: 'MX',
        mtproto: 'TG',
        httpupgrade: 'HU',
        loopback: 'LB',
        shadowsocks: 'SS',
        socks: 'S5',
        trojan: 'TJ',
        tunnel: 'TN',
        vless: 'VL',
        vmess: 'VM',
        wireguard: 'WG'
    }
    return short[protocol] ?? protocol.slice(0, 3).toUpperCase()
}

interface Issue {
    key?: string
    section?: SectionId
    tag?: string
}

// Xray errors read like 'failed to build inbound config with tag X > ... > invalid "privateKey": zzz'.
// Point the editor at what they name: the section, the inbound/outbound by tag, and the quoted key.
const parseIssue = (message: null | string | undefined): Issue | null => {
    if (!message) return null
    const entity = /(inbound|outbound) config with tag (.+?) >/.exec(message)
    const key = /"(\w+)/.exec(message.split(' > ').at(-1) ?? '')?.[1]
    const lower = message.toLowerCase()
    const section = entity
        ? (`${entity[1]}s` as SectionId)
        : (['routing', 'fakedns', 'dns', 'observatory'] as const).find((id) => lower.includes(id))
    return { key, section, tag: entity?.[2] }
}

const ruleFields = (r: Obj) => (r.snippet !== undefined ? SNIPPET_FIELDS : RULE_FIELDS)
const balancerFields = (b: Obj) => (b.snippet !== undefined ? SNIPPET_FIELDS : BALANCER_FIELDS)
const dnsServer = (raw: unknown) => (typeof raw === 'string' ? { address: raw } : asObj(raw))

interface Props {
    config: Obj
    // Xray's last validation error, if the config is invalid.
    issue?: null | string
    onChange: (next: Obj) => void
    snippets: string[]
}

export function VisualEditorWidget(props: Props) {
    const { config, issue: issueMessage, onChange, snippets } = props
    const { t } = useTranslation()
    const issue = useMemo(() => parseIssue(issueMessage), [issueMessage])
    const [section, setSection] = useState<SectionId>('inbounds')
    const [picker, setPicker] = useState<null | { kind: 'in' | 'out'; reveal: () => void }>(null)

    const routing = asObj(config.routing)
    const dns = asObj(config.dns)
    const inbounds = asList(config.inbounds)
    const outbounds = asList(config.outbounds)

    const context = useMemo(
        () => ({
            sources: {
                inboundTags: tagsOf(config.inbounds),
                outboundTags: tagsOf(config.outbounds),
                balancerTags: tagsOf(asObj(config.routing).balancers),
                snippets
            }
        }),
        [config, snippets]
    )

    const set = (key: string, v: unknown) => onChange(setKey(config, key, v))
    const setIn = (key: string, sub: string, v: unknown) =>
        set(key, setKey(asObj(config[key]), sub, v))

    const flaggedKey = (kind: 'inbounds' | 'outbounds', item: Obj) =>
        issue?.section === kind && issue.tag !== undefined && item.tag === issue.tag
            ? (issue.key ?? '')
            : undefined
    const inboundBad = (ib: Obj) =>
        flaggedKey('inbounds', ib) !== undefined || tabsMissing(inboundTabs(ib), ib)
    const outboundBad = (ob: Obj) =>
        ob.snippet !== undefined
            ? hasMissing(SNIPPET_FIELDS, ob)
            : flaggedKey('outbounds', ob) !== undefined || tabsMissing(outboundTabs(ob), ob)

    const sectionBad: Record<SectionId, boolean> = {
        inbounds: inbounds.some((ib) => inboundBad(asObj(ib))),
        outbounds: outbounds.some((ob) => outboundBad(asObj(ob))),
        routing:
            hasMissing(ROUTING_FIELDS, routing) ||
            asList(routing.rules).some((r) => hasMissing(ruleFields(asObj(r)), asObj(r))) ||
            asList(routing.balancers).some((b) => hasMissing(balancerFields(asObj(b)), asObj(b))),
        dns:
            hasMissing(DNS_FIELDS, dns) ||
            asList(dns.servers).some((sv) => hasMissing(DNS_SERVER_FIELDS, dnsServer(sv))),
        log: hasMissing(LOG_FIELDS, asObj(config.log)),
        policy: hasMissing(POLICY_LEVEL_FIELDS, asObj(asObj(asObj(config.policy).levels)['0'])),
        observatory:
            hasMissing(OBSERVATORY_FIELDS, asObj(config.observatory)) ||
            hasMissing(BURST_OBSERVATORY_FIELDS, asObj(config.burstObservatory)),
        fakedns: asList(config.fakedns).some((p) => hasMissing(FAKEDNS_FIELDS, asObj(p))),
        geodata: hasMissing(GEODATA_FIELDS, asObj(config.geodata)),
        advanced: hasMissing(ADVANCED_FIELDS, config)
    }

    const counts: Partial<Record<SectionId, number>> = {
        inbounds: inbounds.length,
        outbounds: outbounds.length,
        routing: asList(routing.rules).length,
        dns: asList(dns.servers).length
    }

    const addEntity = (kind: 'in' | 'out', protocol: string) => {
        if (kind === 'in') {
            const usedPorts = new Set(inbounds.map((i) => Number(asObj(i).port)))
            const port = PORTS.find((p) => !usedPorts.has(p)) ?? 10000 + inbounds.length
            const tag = uniqueTag(
                `${protocol.toUpperCase()}_${port}`,
                new Set(context.sources.inboundTags)
            )
            set('inbounds', [...inbounds, newInbound(protocol, tag, port)])
        } else {
            set('outbounds', [
                ...outbounds,
                newOutbound(protocol, new Set(context.sources.outboundTags))
            ])
        }
        picker?.reveal()
        setPicker(null)
    }

    const snippetHead = (item: Obj) => ({
        invalid: hasMissing(SNIPPET_FIELDS, item),
        tile: '{ }',
        title: String(item.snippet || t('config-visual-editor.choose-snippet')),
        meta: [t('config-visual-editor.snippet')]
    })

    const { edges: railEdges, ref: railRef, scroll: scrollRail } = useScrollEdges<HTMLElement>()
    const current = SECTIONS.find((s) => s.id === section)!
    const heading = (
        <Box className={classes.sectionHead}>
            <span className={classes.sectionIcon}>
                <current.icon size={22} />
            </span>
            <Box miw={0}>
                <Title fw={600} fz={20} order={3}>
                    {t(`config-visual-editor.section.${section}`)}
                </Title>
                <Text c="dimmed" size="sm">
                    {t(`config-visual-editor.section-description.${section}`)}
                </Text>
            </Box>
        </Box>
    )

    const body = (() => {
        switch (section) {
            case 'inbounds':
                return (
                    <EntityList
                        addLabel={t('config-visual-editor.new-inbound')}
                        heading={heading}
                        empty={t('config-visual-editor.no-inbounds')}
                        head={(ib) => {
                            const m = inboundMeta(ib)
                            return {
                                invalid: inboundBad(ib),
                                tile: tile(m.protocol),
                                title: String(ib.tag ?? t('config-visual-editor.untagged')),
                                meta: [
                                    m.protocol,
                                    m.port !== undefined ? `:${m.port}` : undefined,
                                    m.network,
                                    m.security
                                ]
                            }
                        }}
                        items={inbounds}
                        onAdd={(reveal) => setPicker({ kind: 'in', reveal })}
                        onChange={(v) => set('inbounds', v)}
                        renderBody={(ib, change) => (
                            <TabbedEntity
                                flagged={flaggedKey('inbounds', ib)}
                                key={String(ib.protocol)}
                                onChange={change}
                                tabs={inboundTabs(ib)}
                                value={ib}
                            />
                        )}
                    />
                )
            case 'outbounds':
                return (
                    <EntityList
                        addLabel={t('config-visual-editor.new-outbound')}
                        heading={heading}
                        empty={t('config-visual-editor.no-outbounds')}
                        head={(ob) => {
                            if (ob.snippet !== undefined) return snippetHead(ob)
                            const m = outboundMeta(ob)
                            return {
                                invalid: outboundBad(ob),
                                tile: tile(m.protocol),
                                title: String(ob.tag ?? t('config-visual-editor.untagged')),
                                meta: [m.protocol, m.target]
                            }
                        }}
                        items={outbounds}
                        onAdd={(reveal) => setPicker({ kind: 'out', reveal })}
                        onChange={(v) => set('outbounds', v)}
                        onSnippet={() => set('outbounds', [...outbounds, { snippet: '' }])}
                        renderBody={(ob, change) =>
                            ob.snippet !== undefined ? (
                                <FieldsGrid fields={SNIPPET_FIELDS} onChange={change} value={ob} />
                            ) : (
                                <TabbedEntity
                                    flagged={flaggedKey('outbounds', ob)}
                                    key={String(ob.protocol)}
                                    onChange={change}
                                    tabs={outboundTabs(ob)}
                                    value={ob}
                                />
                            )
                        }
                    />
                )
            case 'routing':
                return (
                    <Box className={classes.stack}>
                        <Panel>
                            <FieldsGrid
                                fields={ROUTING_FIELDS}
                                known={['domainStrategy', 'rules', 'balancers']}
                                onChange={(v) => set('routing', v)}
                                value={routing}
                            />
                        </Panel>
                        <EntityList
                            addLabel={t('config-visual-editor.new-rule')}
                            empty={t('config-visual-editor.no-rules')}
                            head={(r, i) => {
                                if (r.snippet !== undefined) return snippetHead(r)
                                const s = ruleSummary(r)
                                return {
                                    invalid: hasMissing(RULE_FIELDS, r),
                                    tile: String(i + 1),
                                    title: String(
                                        r.ruleTag ??
                                            (s.matchers.slice(0, 3).join(' · ') ||
                                                t('config-visual-editor.match-all'))
                                    ),
                                    meta: [
                                        s.target
                                            ? `→ ${s.viaBalancer ? '⚖ ' : ''}${s.target}`
                                            : undefined,
                                        ...(r.ruleTag ? s.matchers.slice(0, 3) : [])
                                    ]
                                }
                            }}
                            items={asList(routing.rules)}
                            onAdd={(reveal) => {
                                reveal()
                                setIn('routing', 'rules', [
                                    ...asList(routing.rules),
                                    { outboundTag: context.sources.outboundTags[0] ?? '' }
                                ])
                            }}
                            onChange={(v) => setIn('routing', 'rules', v)}
                            onSnippet={() =>
                                setIn('routing', 'rules', [
                                    ...asList(routing.rules),
                                    { snippet: '' }
                                ])
                            }
                            renderBody={(r, change) => (
                                <FieldsGrid fields={ruleFields(r)} onChange={change} value={r} />
                            )}
                            title={t('config-visual-editor.rules')}
                        />
                        <EntityList
                            addLabel={t('config-visual-editor.new-balancer')}
                            empty={t('config-visual-editor.no-balancers')}
                            head={(b) =>
                                b.snippet !== undefined
                                    ? snippetHead(b)
                                    : {
                                          invalid: hasMissing(BALANCER_FIELDS, b),
                                          tile: 'LB',
                                          title: String(
                                              b.tag ?? t('config-visual-editor.untagged')
                                          ),
                                          meta: [
                                              String(asObj(b.strategy).type ?? 'random'),
                                              ...asList(b.selector).map(String).slice(0, 3)
                                          ]
                                      }
                            }
                            items={asList(routing.balancers)}
                            onAdd={(reveal) => {
                                reveal()
                                setIn('routing', 'balancers', [
                                    ...asList(routing.balancers),
                                    {
                                        tag: uniqueTag(
                                            'balancer',
                                            new Set(context.sources.balancerTags)
                                        ),
                                        selector: []
                                    }
                                ])
                            }}
                            onChange={(v) => setIn('routing', 'balancers', v)}
                            onSnippet={() =>
                                setIn('routing', 'balancers', [
                                    ...asList(routing.balancers),
                                    { snippet: '' }
                                ])
                            }
                            renderBody={(b, change) => (
                                <FieldsGrid
                                    fields={balancerFields(b)}
                                    onChange={change}
                                    value={b}
                                />
                            )}
                            title={t('config-visual-editor.balancers')}
                        />
                    </Box>
                )
            case 'dns':
                return (
                    <Box className={classes.stack}>
                        <Panel>
                            <FieldsGrid
                                fields={DNS_FIELDS}
                                known={[...DNS_FIELDS.map((f) => f.key), 'servers']}
                                onChange={(v) => set('dns', v)}
                                value={dns}
                            />
                        </Panel>
                        <EntityList
                            addLabel={t('config-visual-editor.new-server')}
                            empty={t('config-visual-editor.no-servers')}
                            head={(s, i) => {
                                const raw = asList(dns.servers)[i]
                                const invalid = hasMissing(DNS_SERVER_FIELDS, dnsServer(raw))
                                return typeof raw === 'string'
                                    ? { invalid, tile: String(i + 1), title: raw }
                                    : {
                                          invalid,
                                          tile: String(i + 1),
                                          title: String(s.address ?? ''),
                                          meta: [
                                              ...asList(s.domains).map(String).slice(0, 3),
                                              s.tag as string | undefined
                                          ]
                                      }
                            }}
                            items={asList(dns.servers)}
                            onAdd={(reveal) => {
                                reveal()
                                setIn('dns', 'servers', [...asList(dns.servers), { address: '' }])
                            }}
                            onChange={(v) => setIn('dns', 'servers', v)}
                            renderBody={(s, change, i) => {
                                const raw = asList(dns.servers)[i]
                                // Plain string servers become objects on first edit; the address field keeps the value.
                                const value = typeof raw === 'string' ? dnsServer(raw) : s
                                return (
                                    <FieldsGrid
                                        fields={DNS_SERVER_FIELDS}
                                        onChange={(v) =>
                                            change(
                                                Object.keys(v).length === 1 &&
                                                    typeof v.address === 'string'
                                                    ? v.address
                                                    : v
                                            )
                                        }
                                        value={value}
                                    />
                                )
                            }}
                            title={t('config-visual-editor.servers')}
                        />
                    </Box>
                )
            case 'log':
                return (
                    <Panel>
                        <FieldsGrid
                            fields={LOG_FIELDS}
                            onChange={(v) => set('log', v)}
                            value={asObj(config.log)}
                        />
                    </Panel>
                )
            case 'policy': {
                const policy = asObj(config.policy)
                const levels = asObj(policy.levels)
                return (
                    <Panel note={t('config-visual-editor.policy-note')}>
                        <FieldsGrid
                            fields={POLICY_LEVEL_FIELDS}
                            onChange={(v) =>
                                set('policy', setKey(policy, 'levels', setKey(levels, '0', v)))
                            }
                            value={asObj(levels['0'])}
                        />
                    </Panel>
                )
            }
            case 'observatory':
                return (
                    <Box className={classes.stack}>
                        <Panel
                            title={t('config-visual-editor.observatory')}
                            description={t('config-visual-editor.observatory-description')}
                        >
                            <FieldsGrid
                                fields={OBSERVATORY_FIELDS}
                                onChange={(v) => set('observatory', v)}
                                value={asObj(config.observatory)}
                            />
                        </Panel>
                        <Panel
                            title={t('config-visual-editor.burst-observatory')}
                            description={t('config-visual-editor.burst-observatory-description')}
                        >
                            <FieldsGrid
                                fields={BURST_OBSERVATORY_FIELDS}
                                onChange={(v) => set('burstObservatory', v)}
                                value={asObj(config.burstObservatory)}
                            />
                        </Panel>
                    </Box>
                )
            case 'fakedns':
                return (
                    <EntityList
                        addLabel={t('config-visual-editor.new-pool')}
                        heading={heading}
                        empty={t('config-visual-editor.no-pools')}
                        head={(p, i) => ({
                            invalid: hasMissing(FAKEDNS_FIELDS, p),
                            tile: String(i + 1),
                            title: String(p.ipPool ?? ''),
                            meta: [p.poolSize !== undefined ? `${p.poolSize}` : undefined]
                        })}
                        items={asList(config.fakedns)}
                        onAdd={(reveal) => {
                            reveal()
                            set('fakedns', [
                                ...asList(config.fakedns),
                                { ipPool: '198.18.0.0/15', poolSize: 65535 }
                            ])
                        }}
                        onChange={(v) => set('fakedns', v)}
                        renderBody={(p, change) => (
                            <FieldsGrid fields={FAKEDNS_FIELDS} onChange={change} value={p} />
                        )}
                    />
                )
            case 'geodata':
                return (
                    <Panel>
                        <FieldsGrid
                            fields={GEODATA_FIELDS}
                            onChange={(v) => set('geodata', v)}
                            value={asObj(config.geodata)}
                        />
                    </Panel>
                )
            case 'advanced': {
                const known = new Set([...KNOWN_ROOT_KEYS, ...ADVANCED_FIELDS.map((f) => f.key)])
                return (
                    <Box className={classes.stack}>
                        <Panel>
                            <FieldsGrid
                                fields={ADVANCED_FIELDS}
                                known={[...known]}
                                onChange={onChange}
                                value={config}
                            />
                        </Panel>
                        <Panel
                            note={t('config-visual-editor.managed-root-note')}
                            title={t('config-visual-editor.managed-title')}
                        >
                            <div className={classes.meta}>
                                {[
                                    'api',
                                    'stats',
                                    'metrics',
                                    'policy.system',
                                    'policy.levels.0.stats*'
                                ].map((k) => (
                                    <span className={classes.chip} key={k}>
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </Panel>
                    </Box>
                )
            }
        }
    })()

    return (
        <EditorContext.Provider value={context}>
            <div className={classes.layout}>
                <div className={classes.railWrap}>
                    <nav
                        aria-label={t('config-visual-editor.sections')}
                        className={classes.rail}
                        ref={railRef}
                    >
                        {SECTIONS.map(({ id, icon: Icon }) => (
                            <UnstyledButton
                                aria-current={section === id ? 'page' : undefined}
                                className={classes.railItem}
                                data-active={section === id || undefined}
                                key={id}
                                onClick={(e) => {
                                    setSection(id)
                                    e.currentTarget.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'nearest',
                                        inline: 'nearest'
                                    })
                                }}
                            >
                                <Icon size={18} />
                                <span className={classes.railLabel}>
                                    {t(`config-visual-editor.section.${id}`)}
                                </span>
                                {(sectionBad[id] || issue?.section === id) && <IssueDot />}
                                {counts[id] !== undefined && (
                                    <span className={classes.railCount}>{counts[id]}</span>
                                )}
                            </UnstyledButton>
                        ))}
                    </nav>
                    <ScrollEdges edges={railEdges} scroll={scrollRail} />
                </div>

                <Box miw={0}>
                    {!LIST_SECTIONS.has(section) && heading}
                    {body}
                </Box>
            </div>

            <Modal
                centered
                onClose={() => setPicker(null)}
                opened={picker !== null}
                size="xl"
                title={
                    <Box>
                        <Text fw={600}>
                            {t(
                                picker?.kind === 'out'
                                    ? 'config-visual-editor.new-outbound'
                                    : 'config-visual-editor.new-inbound'
                            )}
                        </Text>
                        <Text c="dimmed" size="sm">
                            {t('config-visual-editor.choose-protocol')}
                        </Text>
                    </Box>
                }
            >
                <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
                    {(picker?.kind === 'out' ? OUTBOUND_PROTOCOLS : INBOUND_PROTOCOLS).map((p) => (
                        <UnstyledButton
                            className={classes.protocolCard}
                            key={p.value}
                            onClick={() => addEntity(picker!.kind, p.value)}
                        >
                            <span className={classes.tile}>{tile(p.value)}</span>
                            <Box miw={0}>
                                <Text fw={600} size="sm">
                                    {p.label}
                                </Text>
                                <Text c="dimmed" size="xs">
                                    {t(
                                        `config-visual-editor.blurb-${picker?.kind ?? 'in'}.${p.value}` as never
                                    )}
                                </Text>
                            </Box>
                        </UnstyledButton>
                    ))}
                </SimpleGrid>
            </Modal>
        </EditorContext.Provider>
    )
}

function Panel(props: {
    children: ReactNode
    description?: string
    note?: string
    title?: string
}) {
    const { children, description, note, title } = props
    return (
        <Box className={classes.panel}>
            {title && (
                <Box mb="md">
                    <Text fw={600}>{title}</Text>
                    {description && (
                        <Text c="dimmed" size="sm">
                            {description}
                        </Text>
                    )}
                </Box>
            )}
            {note && (
                <Text className={classes.note} mb="md" size="sm">
                    {note}
                </Text>
            )}
            {children}
        </Box>
    )
}

interface TabDef {
    fields: Field[]
    id: string
    key?: string
    known?: false | string[]
    // Edit a nested object (settings, sniffing...) instead of the entity itself.
    path?: string[]
}

const readPath = (value: Obj, path: string[] = []) => path.reduce<Obj>((o, k) => asObj(o[k]), value)

const tabsMissing = (tabs: TabDef[], value: Obj, flagged?: string) =>
    tabs.some((tab) => hasMissing(tab.fields, readPath(value, tab.path), flagged))

function TabbedEntity(props: {
    // Key named by Xray's error when that error is about this entity ('' when it names no key).
    flagged?: string
    onChange: (v: Obj) => void
    tabs: TabDef[]
    value: Obj
}) {
    const { flagged, onChange, tabs, value } = props
    const { t } = useTranslation()
    const { edges: listEdges, ref: listRef, scroll: scrollList } = useScrollEdges<HTMLDivElement>()

    const read = (path?: string[]) => readPath(value, path)
    const write = (path: string[] = [], v: Obj): Obj => {
        if (path.length === 0) return v
        const [head, ...rest] = path
        const inner = asObj(value[head])
        return setKey(value, head, rest.length ? setKey(inner, rest[0], v) : v)
    }

    return (
        <IssueContext.Provider value={flagged || undefined}>
            <Tabs
                classNames={{ list: classes.tabList, tab: classes.tab }}
                defaultValue={tabs[0].id}
                keepMounted={false}
                variant="pills"
            >
                <div className={classes.tabWrap}>
                    <Tabs.List ref={listRef}>
                        {tabs.map((tab) => (
                            <Tabs.Tab
                                key={tab.id}
                                onClick={(e) =>
                                    e.currentTarget.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'nearest',
                                        inline: 'nearest'
                                    })
                                }
                                rightSection={
                                    hasMissing(tab.fields, read(tab.path), flagged || undefined) ? (
                                        <IssueDot />
                                    ) : undefined
                                }
                                value={tab.id}
                            >
                                {t(`config-visual-editor.tab.${tab.id}`, {
                                    defaultValue: humanize(tab.id)
                                })}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    <ScrollEdges edges={listEdges} scroll={scrollList} />
                </div>
                {tabs.map((tab) => (
                    <Tabs.Panel key={tab.id} pt="md" value={tab.id}>
                        {tab.fields.length === 0 && Object.keys(read(tab.path)).length === 0 ? (
                            <Text c="dimmed" size="sm">
                                {t('config-visual-editor.nothing-to-set')}
                            </Text>
                        ) : (
                            <FieldsGrid
                                fields={tab.fields}
                                known={tab.known}
                                onChange={(v) => onChange(write(tab.path, v))}
                                value={read(tab.path)}
                            />
                        )}
                    </Tabs.Panel>
                ))}
            </Tabs>
        </IssueContext.Provider>
    )
}

const streamTabs = (side: Side, withTransport: boolean): TabDef[] => [
    ...(withTransport
        ? [
              {
                  id: 'transport',
                  fields: transportTab(side),
                  path: ['streamSettings'],
                  known: STREAM_KEYS
              },
              {
                  id: 'security',
                  fields: securityTab(side),
                  path: ['streamSettings'],
                  known: false as const
              }
          ]
        : []),
    { id: 'sockopt', fields: SOCKOPT_FIELDS(side), path: ['streamSettings', 'sockopt'] },
    { id: 'finalmask', fields: FINALMASK_FIELDS, path: ['streamSettings', 'finalmask'] }
]

const inboundTabs = (inbound: Obj): TabDef[] => {
    const protocol = String(inbound.protocol ?? '')
    const tabs: TabDef[] = [
        { id: 'general', fields: INBOUND_GENERAL, known: INBOUND_KEYS },
        { id: 'settings', fields: inboundSettingsFields(protocol), path: ['settings'] },
        ...streamTabs('in', !['mtproto', 'tun', 'wireguard'].includes(protocol)).map((tab) =>
            tab.id === 'sockopt'
                ? { ...tab, fields: protocol === 'mtproto' ? MTPROTO_SOCKOPT : INBOUND_SOCKOPT }
                : tab
        ),
        { id: 'sniffing', fields: SNIFFING_FIELDS, path: ['sniffing'] }
    ]

    // Telegram's apps can't undo a final mask, and with encrypted traffic going to a known
    // address there's nothing to sniff.
    return protocol === 'mtproto'
        ? tabs.filter(({ id }) => id !== 'finalmask' && id !== 'sniffing')
        : tabs
}

const outboundTabs = (outbound: Obj): TabDef[] => {
    const protocol = String(outbound.protocol ?? '')
    return [
        { id: 'general', fields: OUTBOUND_GENERAL, known: OUTBOUND_KEYS },
        { id: 'settings', fields: outboundSettingsFields(protocol), path: ['settings'] },
        ...streamTabs('out', PROXY_OUTBOUNDS.has(protocol))
    ]
}

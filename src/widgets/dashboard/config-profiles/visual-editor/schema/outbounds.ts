import { generateValue } from '../generators'
import { SNIFFING_FIELDS } from './inbounds'
import { DOMAIN_STRATEGIES } from './stream'
import { bool, Field, list, map, num, Obj, obj, scalar, select, tags, text } from './types'

export const OUTBOUND_PROTOCOLS = [
    { value: 'freedom', label: 'Freedom' },
    { value: 'blackhole', label: 'Blackhole' },
    { value: 'dns', label: 'DNS' },
    { value: 'vless', label: 'VLESS' },
    { value: 'trojan', label: 'Trojan' },
    { value: 'shadowsocks', label: 'Shadowsocks' },
    { value: 'vmess', label: 'VMess' },
    { value: 'hysteria', label: 'Hysteria 2' },
    { value: 'wireguard', label: 'WireGuard' },
    { value: 'socks', label: 'SOCKS' },
    { value: 'http', label: 'HTTP' },
    { value: 'loopback', label: 'Loopback' }
]

const server = (o: { port?: number } = {}): Field[] => [
    text('address', { req: true }),
    num('port', { req: true, placeholder: String(o.port ?? 443) })
]

const userBits: Field[] = [num('level'), text('email')]

const SS_CLIENT_METHODS = [
    '2022-blake3-aes-128-gcm',
    '2022-blake3-aes-256-gcm',
    '2022-blake3-chacha20-poly1305',
    'aes-128-gcm',
    'aes-256-gcm',
    'chacha20-poly1305',
    'xchacha20-poly1305',
    'none'
]

const NETWORK_LIST = ['tcp', 'udp', 'tcp,udp']

const SETTINGS: Record<string, Field[]> = {
    freedom: [
        select('domainStrategy', DOMAIN_STRATEGIES, {
            hint: 'How domains are resolved before connecting.'
        }),
        text('redirect', {
            hint: 'Send everything to this address:port instead.',
            placeholder: '127.0.0.1:3366'
        }),
        num('proxyProtocol', { hint: 'PROXY protocol version to send (1 or 2).' }),
        num('userLevel'),
        obj('fragment', [
            text('packets', { placeholder: 'tlshello', hint: '"tlshello" or a range like "1-3".' }),
            scalar('length', { placeholder: '100-200' }),
            scalar('interval', { placeholder: '10-20' }),
            scalar('maxSplit')
        ]),
        list(
            'noises',
            [
                select('type', ['rand', 'str', 'base64', 'hex', 'array']),
                scalar('packet', { placeholder: '10-20' }),
                scalar('delay', { placeholder: '10-16' }),
                select('applyTo', ['ip', 'ipv4', 'ipv6'])
            ],
            { title: (n, i) => `${n.type ?? 'noise'} ${n.packet ?? ''}`.trim() || `Noise ${i + 1}` }
        ),
        tags('ipsBlocked', {
            label: 'IPs blocked',
            hint: 'Refuse to connect to these IPs or CIDRs.'
        }),
        list(
            'finalRules',
            [
                select('action', ['allow', 'block'], { req: true }),
                select('network', NETWORK_LIST),
                scalar('port'),
                tags('ip', { label: 'IP' }),
                scalar('blockDelay')
            ],
            {
                title: (r, i) =>
                    `${r.action ?? 'rule'} ${(r.ip as string[] | undefined)?.join(', ') ?? ''}`.trim() ||
                    `Rule ${i + 1}`
            }
        )
    ],
    blackhole: [obj('response', [select('type', ['none', 'http'], { placeholder: 'none' })])],
    dns: [
        select('rewriteNetwork', ['tcp', 'udp'], { label: 'Network' }),
        text('rewriteAddress', { label: 'Address' }),
        num('rewritePort', { label: 'Port' }),
        select('nonIPQuery', ['reject', 'drop', 'skip'], { label: 'Non-IP queries' }),
        tags('blockTypes', { numeric: true, hint: 'DNS record type numbers to block.' }),
        num('userLevel'),
        list(
            'rules',
            [
                select('action', ['direct', 'hijack', 'drop', 'return'], { req: true }),
                scalar('qType', { label: 'Query type', hint: 'Number or range, like 1 or 28.' }),
                tags('domain'),
                num('rCode', { label: 'Response code' })
            ],
            { title: (r, i) => `${r.action ?? 'rule'} ${r.qType ?? ''}`.trim() || `Rule ${i + 1}` }
        )
    ],
    loopback: [
        select('inboundTag', 'inboundTags', { free: true, req: true }),
        obj('sniffing', SNIFFING_FIELDS)
    ],
    vless: [
        ...server(),
        text('id', { label: 'UUID', gen: 'uuid', req: true }),
        text('encryption', { placeholder: 'none', req: true }),
        select('flow', ['xtls-rprx-vision', 'xtls-rprx-vision-udp443']),
        ...userBits,
        num('testpre', { hint: 'Connections to open ahead of time. Experimental.' }),
        tags('testseed', { numeric: true, hint: 'Vision padding seeds. Leave empty.' }),
        text('seed'),
        obj('reverse', [text('tag'), obj('sniffing', SNIFFING_FIELDS)], {
            hint: 'VLESS reverse proxy: this outbound becomes a bridge.'
        })
    ],
    vmess: [
        ...server(),
        text('id', { label: 'UUID', gen: 'uuid', req: true }),
        select('security', ['auto', 'aes-128-gcm', 'chacha20-poly1305', 'none', 'zero']),
        text('experiments'),
        ...userBits
    ],
    trojan: [...server(), text('password', { req: true }), ...userBits],
    shadowsocks: [
        ...server(),
        select('method', SS_CLIENT_METHODS, { req: true, free: true }),
        text('password', { req: true }),
        ...userBits
    ],
    hysteria: [num('version', { placeholder: '2' }), ...server()],
    wireguard: [
        text('secretKey', { gen: 'x25519', req: true }),
        tags('address', { hint: 'Interface addresses, like 172.16.0.2/32.' }),
        list(
            'peers',
            [
                text('endpoint', { req: true, placeholder: 'engage.cloudflareclient.com:2408' }),
                text('publicKey', { req: true }),
                text('preSharedKey'),
                tags('allowedIPs', { label: 'Allowed IPs' }),
                num('keepAlive')
            ],
            {
                title: (p, i) => (p.endpoint as string) || `Peer ${i + 1}`,
                create: () => ({ endpoint: '', publicKey: '' })
            }
        ),
        num('mtu', { placeholder: '1420' }),
        tags('reserved', { numeric: true, hint: 'Three bytes, used by WARP.' }),
        select('domainStrategy', [
            'ForceIP',
            'ForceIPv4',
            'ForceIPv6',
            'ForceIPv4v6',
            'ForceIPv6v4'
        ]),
        bool('noKernelTun')
    ],
    socks: [...server({ port: 1080 }), text('user'), text('pass'), ...userBits],
    http: [
        ...server({ port: 8080 }),
        text('user'),
        text('pass'),
        map('headers', 'text'),
        ...userBits
    ]
}
SETTINGS.direct = SETTINGS.freedom
SETTINGS.block = SETTINGS.blackhole

const TEMPLATES: Record<string, () => Obj> = {
    freedom: () => ({}),
    blackhole: () => ({}),
    dns: () => ({}),
    loopback: () => ({ settings: { inboundTag: '' } }),
    vless: () => ({
        settings: { address: '', port: 443, id: generateValue('uuid'), encryption: 'none' },
        streamSettings: {
            network: 'raw',
            security: 'reality',
            realitySettings: { serverName: '', password: '', fingerprint: 'chrome' }
        }
    }),
    vmess: () => ({
        settings: { address: '', port: 443, id: generateValue('uuid'), security: 'auto' }
    }),
    trojan: () => ({
        settings: { address: '', port: 443, password: '' },
        streamSettings: { network: 'raw', security: 'tls' }
    }),
    shadowsocks: () => ({
        settings: { address: '', port: 8388, method: '2022-blake3-aes-256-gcm', password: '' }
    }),
    hysteria: () => ({
        settings: { version: 2, address: '', port: 443 },
        streamSettings: {
            network: 'hysteria',
            security: 'tls',
            hysteriaSettings: { version: 2, auth: '' },
            tlsSettings: { alpn: ['h3'] }
        }
    }),
    wireguard: () => ({
        settings: {
            secretKey: generateValue('x25519'),
            address: [],
            peers: [{ endpoint: '', publicKey: '' }],
            mtu: 1420
        }
    }),
    socks: () => ({ settings: { address: '', port: 1080 } }),
    http: () => ({ settings: { address: '', port: 8080 } })
}

const DEFAULT_TAGS: Record<string, string> = {
    freedom: 'DIRECT',
    blackhole: 'BLOCK',
    dns: 'DNS_OUT'
}

export const newOutbound = (protocol: string, taken: Set<string>): Obj => ({
    tag: uniqueTag(DEFAULT_TAGS[protocol] ?? protocol.toUpperCase(), taken),
    protocol,
    ...TEMPLATES[protocol]?.()
})

export const uniqueTag = (base: string, taken: Set<string>) => {
    if (!taken.has(base)) return base
    let n = 2
    while (taken.has(`${base}_${n}`)) n++
    return `${base}_${n}`
}

export const outboundSettingsFields = (protocol: unknown): Field[] =>
    SETTINGS[String(protocol)] ?? []

export const OUTBOUND_GENERAL: Field[] = [
    text('tag', { req: true, hint: 'Routing rules send traffic here by this name.' }),
    select(
        'protocol',
        OUTBOUND_PROTOCOLS.map(({ value, label }) => ({ value, label })),
        {
            req: true,
            apply: (o, v) => ({
                ...o,
                protocol: v,
                settings: v ? (TEMPLATES[v]?.().settings ?? {}) : {}
            })
        }
    ),
    text('sendThrough', { hint: 'Local IP to send from. "origin" uses the inbound IP.' }),
    select('targetStrategy', DOMAIN_STRATEGIES, { hint: 'How domain targets are resolved.' }),
    obj('proxySettings', [select('tag', 'outboundTags', { free: true }), bool('transportLayer')], {
        hint: 'Old way to chain outbounds. Prefer sockopt → dialerProxy.'
    }),
    obj('mux', [
        bool('enabled'),
        num('concurrency', { placeholder: '8', hint: '-1 turns TCP mux off.' }),
        num('xudpConcurrency', { placeholder: '16' }),
        select('xudpProxyUDP443', ['reject', 'allow', 'skip'])
    ])
]

export const OUTBOUND_KEYS = [
    'tag',
    'protocol',
    'sendThrough',
    'targetStrategy',
    'proxySettings',
    'mux',
    'settings',
    'streamSettings'
]

// Protocols that talk to a remote peer and so have transport settings.
export const PROXY_OUTBOUNDS = new Set([
    'vless',
    'vmess',
    'trojan',
    'shadowsocks',
    'hysteria',
    'socks',
    'http'
])

export const outboundMeta = (o: Obj) => {
    const s = (o.settings ?? {}) as Obj
    const vnext = ((s.vnext ?? s.servers) as Obj[] | undefined)?.[0]
    const address = (s.address ?? vnext?.address) as string | undefined
    const port = s.port ?? vnext?.port
    return {
        protocol: String(o.protocol ?? '?'),
        target: address ? `${address}${port ? `:${port}` : ''}` : undefined
    }
}

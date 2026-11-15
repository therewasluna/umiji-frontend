import { generateValue } from '../generators'
import { SOCKOPT_FIELDS } from './stream'
import { bool, Field, list, managed, map, num, Obj, obj, scalar, select, tags, text } from './types'

const USERS_MANAGED =
    'Umiji adds a client for every user with access to this inbound when it builds the node config. Anything here is replaced.'

// Mirrors the backend's allowed inbound protocols (xray-config.validator.ts).
export const INBOUND_PROTOCOLS = [
    { value: 'vless', label: 'VLESS' },
    { value: 'trojan', label: 'Trojan' },
    { value: 'shadowsocks', label: 'Shadowsocks' },
    { value: 'hysteria', label: 'Hysteria 2' },
    { value: 'mtproto', label: 'MTProto (Telegram)' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'http', label: 'HTTP' },
    { value: 'tunnel', label: 'Tunnel' },
    { value: 'wireguard', label: 'WireGuard' },
    { value: 'tun', label: 'TUN' }
]

const SS_METHODS = [
    '2022-blake3-aes-256-gcm',
    'aes-128-gcm',
    'aes-256-gcm',
    'chacha20-ietf-poly1305'
]

const NETWORK_LIST = ['tcp', 'udp', 'tcp,udp']

const fallbacks = list(
    'fallbacks',
    [
        scalar('dest', { hint: 'Port, address:port or a unix socket path.', req: true }),
        text('name', { hint: 'Match the TLS SNI.' }),
        text('alpn', { label: 'ALPN' }),
        text('path', { hint: 'Match the HTTP path, starting with "/".' }),
        select('type', ['tcp', 'unix', 'serve']),
        num('xver', { hint: 'PROXY protocol version (0, 1, 2).' })
    ],
    {
        hint: 'Where to send connections that are not VLESS/Trojan.',
        title: (f, i) => `${f.name || f.path || f.alpn || `Fallback ${i + 1}`} → ${f.dest ?? '?'}`,
        create: () => ({ dest: 80 })
    }
)

const accounts = (key: string) =>
    list(key, [text('user', { req: true }), text('pass', { gen: 'password' })], {
        title: (a, i) => (a.user as string) || `Account ${i + 1}`,
        create: () => ({ user: '', pass: generateValue('password') })
    })

const SETTINGS: Record<string, Field[]> = {
    vless: [
        managed('clients', USERS_MANAGED),
        text('decryption', {
            hint: '"none", or an ML-KEM-768 encryption string from "xray vlessenc".',
            placeholder: 'none',
            req: true
        }),
        select('flow', ['xtls-rprx-vision'], {
            hint: 'Umiji sets the flow per user. Only REALITY/TLS over RAW supports Vision.'
        }),
        fallbacks,
        tags('testseed', { numeric: true, hint: 'Vision padding seeds. Leave empty.' })
    ],
    trojan: [managed('clients', USERS_MANAGED), fallbacks],
    shadowsocks: [
        managed('clients', USERS_MANAGED),
        // Optional: the backend falls back to chacha20-ietf-poly1305 when it adds users, and Xray accepts it unset.
        select('method', SS_METHODS, { placeholder: 'chacha20-ietf-poly1305' }),
        text('password', {
            gen: 'ss2022',
            hint: 'Server key for 2022 ciphers: base64 that decodes to 32 bytes.',
            show: (s) => String(s.method ?? '').startsWith('2022-')
        }),
        select('network', NETWORK_LIST, { placeholder: 'tcp' }),
        num('level'),
        text('email')
    ],
    hysteria: [managed('clients', USERS_MANAGED), num('version', { placeholder: '2' })],
    mtproto: [
        managed('clients', USERS_MANAGED),
        text('domain', {
            req: true,
            placeholder: 'www.microsoft.com',
            hint: 'The site clients claim to visit. Pick one that serves TLS 1.3. It is part of every user’s link, so changing it means users need new links.'
        }),
        text('target', {
            placeholder: 'domain:443',
            hint: 'Where anything that isn’t a valid client gets forwarded, so this port looks like that site. Set it if the domain points at this server.'
        }),
        text('adTag', {
            placeholder: '32 hex characters',
            hint: 'Sponsored channel for this inbound, from @MTProxybot. Needs a direct outbound and outbound port 8888 open. If Telegram’s middle proxies can’t be used, users stay connected without the channel.'
        }),
        text('publicIp', {
            placeholder: 'Taken from the network interface',
            hint: 'This node’s public IPv4. Only needed when its network interface has a private address, as on AWS or Oracle Cloud.',
            show: (s) => Boolean(s.adTag)
        })
    ],
    mixed: [
        select('auth', ['noauth', 'password'], { placeholder: 'noauth' }),
        { ...accounts('accounts'), show: (s) => s.auth === 'password' },
        bool('udp', { label: 'UDP' }),
        text('ip', {
            label: 'UDP IP',
            hint: 'Address announced for UDP relay.',
            show: (s) => !!s.udp
        }),
        num('userLevel')
    ],
    socks: [
        select('auth', ['noauth', 'password'], { placeholder: 'noauth' }),
        { ...accounts('accounts'), show: (s) => s.auth === 'password' },
        bool('udp', { label: 'UDP' }),
        text('ip', { label: 'UDP IP', show: (s) => !!s.udp }),
        num('userLevel')
    ],
    http: [accounts('accounts'), bool('allowTransparent'), num('userLevel')],
    tunnel: [
        text('rewriteAddress', { hint: 'Where traffic goes. Empty keeps the original target.' }),
        num('rewritePort'),
        select('allowedNetwork', NETWORK_LIST, { placeholder: 'tcp' }),
        map('portMap', 'text', { hint: 'Listen port → target address:port.' }),
        bool('followRedirect', { hint: 'Use the original destination (transparent proxy).' }),
        num('userLevel')
    ],
    wireguard: [
        text('secretKey', { gen: 'x25519', req: true }),
        list(
            'peers',
            [
                text('publicKey', { req: true }),
                text('preSharedKey'),
                tags('allowedIPs', { label: 'Allowed IPs' }),
                num('keepAlive', { hint: 'Seconds.' }),
                num('level'),
                text('email')
            ],
            {
                title: (p, i) => (p.email as string) || `Peer ${i + 1}`,
                create: () => ({ publicKey: '' })
            }
        ),
        num('mtu', { placeholder: '1420' }),
        bool('noKernelTun')
    ],
    tun: [
        text('name', { placeholder: 'xray0' }),
        text('desc'),
        num('mtu', { placeholder: '1500' }),
        tags('gateway'),
        tags('dns', { label: 'DNS' }),
        tags('autoSystemRoutingTable'),
        text('autoOutboundsInterface', { placeholder: 'auto' }),
        num('userLevel')
    ]
}
SETTINGS['dokodemo-door'] = SETTINGS.tunnel

export const SNIFFING_FIELDS: Field[] = [
    bool('enabled'),
    tags('destOverride', { options: ['http', 'tls', 'quic', 'fakedns'] }),
    bool('routeOnly', { hint: 'Use the sniffed domain only for routing, keep the IP as target.' }),
    bool('metadataOnly', { hint: 'Do not read traffic, use connection metadata only.' }),
    tags('domainsExcluded'),
    tags('ipsExcluded', { label: 'IPs excluded' })
]

const TEMPLATES: Record<string, () => Obj> = {
    vless: () => ({
        settings: { clients: [], decryption: 'none' },
        streamSettings: {
            network: 'raw',
            security: 'reality',
            realitySettings: {
                target: '',
                serverNames: [],
                privateKey: generateValue('x25519'),
                shortIds: [generateValue('shortId')]
            }
        }
    }),
    trojan: () => ({
        settings: { clients: [] },
        streamSettings: {
            network: 'raw',
            security: 'tls',
            tlsSettings: { certificates: [{ certificateFile: '', keyFile: '' }] }
        }
    }),
    shadowsocks: () => ({
        settings: {
            clients: [],
            method: '2022-blake3-aes-256-gcm',
            password: generateValue('ss2022'),
            network: 'tcp,udp'
        }
    }),
    hysteria: () => ({
        settings: { version: 2, clients: [] },
        streamSettings: {
            network: 'hysteria',
            security: 'tls',
            hysteriaSettings: { version: 2 },
            tlsSettings: { alpn: ['h3'], certificates: [{ certificateFile: '', keyFile: '' }] }
        }
    }),
    mtproto: () => ({ settings: { clients: [], domain: 'www.microsoft.com' } }),
    mixed: () => ({ listen: '127.0.0.1', settings: { auth: 'noauth', udp: true } }),
    http: () => ({ listen: '127.0.0.1', settings: {} }),
    tunnel: () => ({ settings: { allowedNetwork: 'tcp,udp' } }),
    wireguard: () => ({ settings: { secretKey: generateValue('x25519'), peers: [], mtu: 1420 } }),
    tun: () => ({ settings: { name: 'xray0', mtu: 1500 } })
}

const SNIFF_ON = { enabled: true, destOverride: ['http', 'tls', 'quic'] }

export const newInbound = (protocol: string, tag: string, port: number): Obj => {
    const { settings, ...rest } = TEMPLATES[protocol]?.() ?? {}
    return {
        tag,
        protocol,
        listen: '0.0.0.0',
        port,
        settings,
        ...rest,
        // Traffic to Telegram is encrypted and its destination already known, so there's nothing to sniff.
        ...(protocol === 'mtproto' ? {} : { sniffing: SNIFF_ON })
    }
}

export const inboundSettingsFields = (protocol: unknown): Field[] =>
    SETTINGS[String(protocol)] ?? []

// Server-side TCP tuning the app never sees. The rest of sockopt locks the app out or does nothing here.
const MTPROTO_SOCKOPT_KEYS = [
    'mark',
    'tcpFastOpen',
    'tcpCongestion',
    'tcpKeepAliveIdle',
    'tcpKeepAliveInterval',
    'tcpUserTimeout',
    'tcpWindowClamp',
    'tcpMaxSeg',
    'tcpMptcp',
    'interface',
    'v6only',
    'customSockopt'
]

export const INBOUND_GENERAL: Field[] = [
    text('tag', { req: true, hint: 'Unique name. Hosts and squads point at it.' }),
    select(
        'protocol',
        [
            ...INBOUND_PROTOCOLS.map(({ value, label }) => ({ value, label })),
            { value: 'dokodemo-door', label: 'dokodemo-door (old tunnel)' }
        ],
        {
            req: true,
            apply: (inbound, v) => {
                const switched: Obj = {
                    ...inbound,
                    protocol: v,
                    settings: v ? (TEMPLATES[v]?.().settings ?? {}) : {}
                }
                if (v !== 'mtproto') return switched

                // The Telegram app can't use these, and their tabs are gone, so nobody could remove them.
                const { sniffing: _sniffing, streamSettings, ...rest } = switched
                const sockopt = Object.entries(
                    ((streamSettings as Obj | undefined)?.sockopt ?? {}) as Obj
                ).filter(([key]) => MTPROTO_SOCKOPT_KEYS.includes(key))

                return sockopt.length > 0
                    ? { ...rest, streamSettings: { sockopt: Object.fromEntries(sockopt) } }
                    : rest
            }
        }
    ),
    text('listen', { placeholder: '0.0.0.0', hint: 'Address or unix socket to listen on.' }),
    scalar('port', { req: true, hint: 'A port, a range like 1000-2000, or "env:NAME".' })
]

export const INBOUND_SOCKOPT = SOCKOPT_FIELDS('in')

export const MTPROTO_SOCKOPT = INBOUND_SOCKOPT.filter(({ key }) =>
    MTPROTO_SOCKOPT_KEYS.includes(key)
)

// Every top-level key the inbound tabs render; anything else shows up as raw JSON on the General tab.
export const INBOUND_KEYS = [
    'tag',
    'protocol',
    'listen',
    'port',
    'settings',
    'streamSettings',
    'sniffing'
]

export const SETTINGS_FIELD = (inbound: Obj) =>
    obj('settings', () => inboundSettingsFields(inbound.protocol))

export const SNIFFING_FIELD = obj('sniffing', SNIFFING_FIELDS)

export { SETTINGS as INBOUND_SETTINGS }

export const inboundMeta = (inbound: Obj) => {
    const stream = (inbound.streamSettings ?? {}) as Obj
    return {
        protocol: String(inbound.protocol ?? '?'),
        port: inbound.port,
        network:
            (stream.network as string) ??
            (['vless', 'trojan', 'shadowsocks'].includes(String(inbound.protocol))
                ? 'raw'
                : undefined),
        security: stream.security as string | undefined
    }
}

import {
    bool,
    Field,
    json,
    lines,
    list,
    map,
    num,
    Obj,
    obj,
    scalar,
    select,
    tags,
    text
} from './types'

export type Side = 'in' | 'out'

export const NETWORKS = [
    { value: 'raw', label: 'RAW (TCP)' },
    { value: 'xhttp', label: 'XHTTP' },
    { value: 'grpc', label: 'gRPC' },
    { value: 'ws', label: 'WebSocket' },
    { value: 'httpupgrade', label: 'HTTPUpgrade' },
    { value: 'kcp', label: 'mKCP' },
    { value: 'hysteria', label: 'Hysteria' },
    { value: 'tcp', label: 'tcp (old name of raw)' }
]

const NETWORK_SETTINGS: Record<string, string> = {
    raw: 'rawSettings',
    tcp: 'rawSettings',
    xhttp: 'xhttpSettings',
    grpc: 'grpcSettings',
    ws: 'wsSettings',
    httpupgrade: 'httpupgradeSettings',
    kcp: 'kcpSettings',
    hysteria: 'hysteriaSettings'
}

const ALL_NETWORK_KEYS = [
    ...new Set(Object.values(NETWORK_SETTINGS)),
    'tcpSettings',
    'splithttpSettings'
]

const net = (s: Obj) => (s.network as string | undefined) ?? 'raw'
const onNet =
    (...names: string[]) =>
    (s: Obj) =>
        names.includes(net(s))

export const DOMAIN_STRATEGIES = [
    'AsIs',
    'UseIP',
    'UseIPv4',
    'UseIPv6',
    'UseIPv4v6',
    'UseIPv6v4',
    'ForceIP',
    'ForceIPv4',
    'ForceIPv6',
    'ForceIPv4v6',
    'ForceIPv6v4'
]

export const FINGERPRINTS = [
    'chrome',
    'firefox',
    'safari',
    'ios',
    'android',
    'edge',
    '360',
    'qq',
    'random',
    'randomized',
    'randomizednoalpn',
    'unsafe'
]

const ALPN = ['h3', 'h2', 'http/1.1']

const sockoptFields = (side: Side): Field[] => [
    select('domainStrategy', DOMAIN_STRATEGIES, {
        hint: 'How domain targets are resolved before dialing.',
        show: () => side === 'out'
    }),
    select('dialerProxy', 'outboundTags', {
        free: true,
        hint: 'Send this connection through another outbound (chaining).',
        show: () => side === 'out'
    }),
    bool('acceptProxyProtocol', { show: () => side === 'in' }),
    tags('trustedXForwardedFor', {
        label: 'Trusted X-Forwarded-For',
        hint: 'Headers to trust for the real client IP.',
        show: () => side === 'in'
    }),
    select('tproxy', ['off', 'redirect', 'tproxy'], {
        label: 'TProxy',
        hint: 'Transparent proxy mode (Linux).'
    }),
    num('mark', { hint: 'SO_MARK on outgoing packets (Linux).' }),
    scalar('tcpFastOpen', { hint: 'true, false or a queue length.', placeholder: 'true' }),
    select('tcpCongestion', ['bbr', 'cubic', 'reno'], { free: true }),
    num('tcpKeepAliveIdle', { hint: 'Seconds.' }),
    num('tcpKeepAliveInterval', { hint: 'Seconds.' }),
    num('tcpUserTimeout', { hint: 'Milliseconds.' }),
    num('tcpWindowClamp'),
    num('tcpMaxSeg'),
    bool('tcpMptcp', { label: 'TCP MPTCP' }),
    text('interface', { hint: 'Bind to a network interface by name.' }),
    bool('v6only', { label: 'IPv6 only' }),
    bool('penetrate'),
    select(
        'addressPortStrategy',
        [
            'none',
            'SrvPortOnly',
            'SrvAddressOnly',
            'SrvPortAndAddress',
            'TxtPortOnly',
            'TxtAddressOnly',
            'TxtPortAndAddress'
        ],
        { show: () => side === 'out' }
    ),
    obj(
        'happyEyeballs',
        [
            num('tryDelayMs'),
            bool('prioritizeIPv6', { label: 'Prioritize IPv6' }),
            num('interleave'),
            num('maxConcurrentTry')
        ],
        { show: () => side === 'out' }
    ),
    list(
        'customSockopt',
        [
            select('system', ['linux', 'windows', 'darwin']),
            select('network', ['tcp', 'udp']),
            text('level', { placeholder: '6' }),
            text('opt', { placeholder: '13' }),
            text('value'),
            select('type', ['int', 'str'])
        ],
        { title: (i) => `${i.opt ?? 'option'}${i.value !== undefined ? ` = ${i.value}` : ''}` }
    )
]

export const SOCKOPT_FIELDS = sockoptFields

const rangeHint = 'A number or a "from-to" range.'

const xmuxFields: Field[] = [
    scalar('maxConcurrency', { hint: rangeHint, placeholder: '16-32' }),
    scalar('maxConnections', { hint: rangeHint }),
    scalar('cMaxReuseTimes', { hint: rangeHint }),
    scalar('hMaxRequestTimes', { hint: rangeHint, placeholder: '600-900' }),
    scalar('hMaxReusableSecs', { hint: rangeHint, placeholder: '1800-3000' }),
    num('hKeepAlivePeriod')
]

const PLACEMENTS = ['path', 'cookie', 'header', 'query']

const xhttpFields = (side: Side): Field[] => [
    text('host'),
    text('path', { placeholder: '/' }),
    select('mode', ['auto', 'packet-up', 'stream-up', 'stream-one'], { placeholder: 'auto' }),
    map('headers', 'text', { hint: 'Do not put "host" here, use the host field.' }),
    scalar('xPaddingBytes', { hint: rangeHint, placeholder: '100-1000' }),
    bool('xPaddingObfsMode', { label: 'Padding obfs mode' }),
    text('xPaddingKey', { label: 'Padding key' }),
    text('xPaddingHeader', { label: 'Padding header' }),
    select('xPaddingPlacement', ['cookie', 'header', 'query', 'queryInHeader'], {
        label: 'Padding placement'
    }),
    select('xPaddingMethod', ['repeat-x', 'tokenish'], { label: 'Padding method' }),
    select('uplinkHTTPMethod', ['POST', 'PUT', 'PATCH', 'GET'], {
        free: true,
        label: 'Uplink HTTP method',
        hint: 'GET only works in packet-up mode.'
    }),
    select('sessionIDPlacement', PLACEMENTS, { label: 'Session ID placement' }),
    text('sessionIDKey', { label: 'Session ID key' }),
    text('sessionIDTable', { label: 'Session ID table' }),
    scalar('sessionIDLength', { label: 'Session ID length', hint: rangeHint }),
    select('seqPlacement', PLACEMENTS),
    text('seqKey'),
    select('uplinkDataPlacement', ['auto', 'body', 'cookie', 'header'], {
        hint: 'Cookie and header only work in packet-up mode.'
    }),
    text('uplinkDataKey'),
    scalar('uplinkChunkSize', { hint: rangeHint }),
    bool('noGRPCHeader', { label: 'No gRPC header', show: () => side === 'out' }),
    bool('noSSEHeader', { label: 'No SSE header', show: () => side === 'in' }),
    scalar('scMaxEachPostBytes', { hint: rangeHint, placeholder: '1000000' }),
    scalar('scMinPostsIntervalMs', { hint: rangeHint, placeholder: '30' }),
    num('scMaxBufferedPosts', { placeholder: '30' }),
    scalar('scStreamUpServerSecs', { hint: rangeHint, placeholder: '20-80' }),
    num('serverMaxHeaderBytes', { show: () => side === 'in' }),
    obj('xmux', xmuxFields, { show: () => side === 'out' }),
    obj('downloadSettings', () => DOWNLOAD_FIELDS, {
        hint: 'Separate stream settings for the download direction.',
        show: () => side === 'out'
    }),
    json('extra', { hint: 'Raw XHTTP extra object, shared with clients.' })
]

const httpHeaderFields: Field[] = [
    select('type', ['none', 'http'], { placeholder: 'none' }),
    obj(
        'request',
        [
            text('version', { placeholder: '1.1' }),
            text('method', { placeholder: 'GET' }),
            tags('path'),
            map('headers', 'tags')
        ],
        { show: (h) => h.type === 'http' }
    ),
    obj(
        'response',
        [
            text('version', { placeholder: '1.1' }),
            text('status', { placeholder: '200' }),
            text('reason', { placeholder: 'OK' }),
            map('headers', 'tags')
        ],
        { show: (h) => h.type === 'http' }
    )
]

const masqueradeFields: Field[] = [
    select('type', ['file', 'proxy', 'string']),
    text('dir', { show: (m) => m.type === 'file' }),
    text('url', { show: (m) => m.type === 'proxy' }),
    bool('rewriteHost', { show: (m) => m.type === 'proxy' }),
    bool('insecure', { show: (m) => m.type === 'proxy' }),
    text('content', { show: (m) => m.type === 'string' }),
    map('headers', 'text', { show: (m) => m.type === 'string' }),
    num('statusCode', { show: (m) => m.type === 'string' })
]

const transportFields = (side: Side): Field[] => [
    obj(
        'rawSettings',
        [
            bool('acceptProxyProtocol', { show: () => side === 'in' }),
            obj('header', httpHeaderFields, { hint: 'HTTP header obfuscation.' })
        ],
        { show: onNet('raw', 'tcp') }
    ),
    obj('xhttpSettings', xhttpFields(side), { show: onNet('xhttp') }),
    obj(
        'grpcSettings',
        [
            text('serviceName', { req: true }),
            text('authority'),
            bool('multiMode', { show: () => side === 'out' }),
            text('user_agent', { label: 'User agent', show: () => side === 'out' }),
            num('idle_timeout', {
                label: 'Idle timeout',
                hint: 'Seconds.',
                show: () => side === 'out'
            }),
            num('health_check_timeout', {
                label: 'Health check timeout',
                hint: 'Seconds.',
                show: () => side === 'out'
            }),
            bool('permit_without_stream', {
                label: 'Permit without stream',
                show: () => side === 'out'
            }),
            num('initial_windows_size', {
                label: 'Initial window size',
                show: () => side === 'out'
            })
        ],
        { show: onNet('grpc') }
    ),
    obj(
        'wsSettings',
        [
            text('path', { placeholder: '/' }),
            text('host'),
            map('headers', 'text'),
            bool('acceptProxyProtocol', { show: () => side === 'in' }),
            num('heartbeatPeriod', { hint: 'Seconds between pings. 0 turns it off.' })
        ],
        { show: onNet('ws') }
    ),
    obj(
        'httpupgradeSettings',
        [
            text('path', { placeholder: '/' }),
            text('host'),
            map('headers', 'text'),
            bool('acceptProxyProtocol', { show: () => side === 'in' })
        ],
        { show: onNet('httpupgrade') }
    ),
    obj(
        'kcpSettings',
        [
            num('mtu', { placeholder: '1350' }),
            num('tti', { placeholder: '50' }),
            num('uplinkCapacity', { placeholder: '5' }),
            num('downlinkCapacity', { placeholder: '20' }),
            num('cwndMultiplier', { placeholder: '1' }),
            num('maxSendingWindow', { placeholder: '2097152' })
        ],
        { show: onNet('kcp') }
    ),
    obj(
        'hysteriaSettings',
        [
            num('version', { placeholder: '2' }),
            text('auth', { show: () => side === 'out' }),
            num('udpIdleTimeout', { hint: 'Seconds.' }),
            obj('masquerade', masqueradeFields, {
                hint: 'What the server answers to non-Hysteria visitors.',
                show: () => side === 'in'
            })
        ],
        { show: onNet('hysteria') }
    )
]

const certificateFields: Field[] = [
    text('certificateFile', { placeholder: '/path/to/fullchain.pem' }),
    text('keyFile', { placeholder: '/path/to/privkey.pem' }),
    lines('certificate', { hint: 'PEM lines, used instead of a file.' }),
    lines('key', { hint: 'PEM lines, used instead of a file.' }),
    select('usage', ['encipherment', 'verify', 'issue'], { placeholder: 'encipherment' }),
    num('ocspStapling', { hint: 'Seconds between OCSP refreshes.' }),
    bool('oneTimeLoading'),
    bool('buildChain')
]

const tlsFields = (side: Side): Field[] => [
    text('serverName', { label: 'Server name (SNI)' }),
    tags('alpn', { label: 'ALPN', options: ALPN }),
    select('fingerprint', FINGERPRINTS, { free: true, show: () => side === 'out' }),
    select('minVersion', ['1.0', '1.1', '1.2', '1.3']),
    select('maxVersion', ['1.0', '1.1', '1.2', '1.3']),
    bool('rejectUnknownSni', { label: 'Reject unknown SNI', show: () => side === 'in' }),
    text('verifyPeerCertByName', { show: () => side === 'out' }),
    text('pinnedPeerCertSha256', { label: 'Pinned peer cert SHA-256', show: () => side === 'out' }),
    bool('enableSessionResumption', { show: () => side === 'out' }),
    bool('disableSystemRoot', { show: () => side === 'out' }),
    text('cipherSuites', { hint: 'Colon-separated Go cipher suite names.' }),
    tags('curvePreferences', { options: ['X25519MLKEM768', 'X25519', 'CurveP256', 'CurveP384'] }),
    list('certificates', certificateFields, {
        title: (c, i) => (c.certificateFile as string) || `Certificate ${i + 1}`,
        create: () => ({ certificateFile: '', keyFile: '' })
    }),
    text('echServerKeys', { label: 'ECH server keys', show: () => side === 'in' }),
    text('echConfigList', { label: 'ECH config list', show: () => side === 'out' }),
    obj('echSockopt', () => sockoptFields('out'), {
        label: 'ECH sockopt',
        show: () => side === 'out'
    }),
    text('masterKeyLog', { hint: 'Path for a TLS key log. Debugging only.' })
]

const limitFields: Field[] = [num('afterBytes'), num('bytesPerSec'), num('burstBytesPerSec')]

const realityFields = (side: Side): Field[] =>
    side === 'in'
        ? [
              scalar('target', {
                  hint: 'The real site REALITY borrows its TLS from, like example.com:443.',
                  placeholder: 'example.com:443',
                  req: true
              }),
              tags('serverNames', { hint: 'SNI values clients may use.', req: true }),
              text('privateKey', { gen: 'x25519', req: true }),
              tags('shortIds', {
                  gen: 'shortId',
                  hint: 'Hex, up to 16 characters. Empty allowed.'
              }),
              num('xver', { hint: 'PROXY protocol version sent to target (0, 1, 2).' }),
              bool('show', { hint: 'Debug output.' }),
              text('minClientVer'),
              text('maxClientVer'),
              num('maxTimeDiff', { hint: 'Milliseconds.' }),
              text('mldsa65Seed', { label: 'ML-DSA-65 seed', gen: 'mldsa65' }),
              obj('limitFallbackUpload', limitFields),
              obj('limitFallbackDownload', limitFields),
              text('masterKeyLog')
          ]
        : [
              text('serverName', { label: 'Server name (SNI)', req: true }),
              text('password', { label: 'Public key (password)', req: true }),
              text('shortId'),
              select('fingerprint', FINGERPRINTS, { free: true, placeholder: 'chrome' }),
              text('mldsa65Verify', { label: 'ML-DSA-65 verify' }),
              text('spiderX', { placeholder: '/' }),
              text('masterKeyLog')
          ]

const QUIC_PARAMS: Field[] = [
    select('congestion', ['reno', 'bbr', 'brutal', 'force-brutal']),
    select('bbrProfile', ['conservative', 'standard', 'aggressive']),
    text('brutalUp', { placeholder: '100 mbps' }),
    text('brutalDown', { placeholder: '100 mbps' }),
    obj('udpHop', [
        scalar('ports', { placeholder: '20000-50000' }),
        scalar('interval', { placeholder: '30' })
    ]),
    num('initStreamReceiveWindow'),
    num('maxStreamReceiveWindow'),
    num('initConnectionReceiveWindow'),
    num('maxConnectionReceiveWindow'),
    num('maxIdleTimeout'),
    num('keepAlivePeriod'),
    bool('disablePathMTUDiscovery', { label: 'Disable path MTU discovery' }),
    num('maxIncomingStreams'),
    bool('debug')
]

const sudokuFields: Field[] = [
    text('password'),
    text('ascii'),
    text('customTable'),
    tags('customTables'),
    num('paddingMin'),
    num('paddingMax')
]

const maskSettings = (_v: Obj, mask: Obj): Field[] => {
    switch (mask.type) {
        case 'fragment':
            return [
                text('packets', { placeholder: 'tlshello' }),
                scalar('length', { hint: rangeHint, placeholder: '100-200' }),
                scalar('delay', { hint: rangeHint, placeholder: '10-20' }),
                json('lengths'),
                json('delays'),
                scalar('maxSplit', { hint: rangeHint })
            ]
        case 'sudoku':
            return sudokuFields
        case 'xmc':
            return [
                text('hostname'),
                text('password'),
                list('profiles', [
                    text('username'),
                    text('uuid', { gen: 'uuid' }),
                    text('texturesValue'),
                    text('texturesSignature')
                ])
            ]
        case 'mkcp-legacy':
            return [
                select('header', ['none', 'dns', 'dtls', 'srtp', 'utp', 'wechat', 'wireguard']),
                text('value', { hint: 'Domain for the dns header.' })
            ]
        case 'noise':
            return [
                scalar('reset', { hint: rangeHint }),
                json('noise', { hint: 'List of noise items.' })
            ]
        case 'salamander':
            return [
                text('password', { gen: 'password' }),
                scalar('packetSize', { hint: rangeHint })
            ]
        case 'xdns':
            return [tags('domains'), tags('resolvers')]
        case 'xicmp':
            return [bool('dgram'), tags('ips', { label: 'IPs' })]
        case 'realm':
            return [text('url'), tags('stunServers', { label: 'STUN servers' }), json('tlsConfig')]
        default:
            return []
    }
}

const maskList = (layer: 'tcp' | 'udp') =>
    list(
        layer,
        (mask) => [
            select(
                'type',
                layer === 'tcp'
                    ? ['fragment', 'sudoku', 'xmc', 'header-custom']
                    : [
                          'noise',
                          'salamander',
                          'mkcp-legacy',
                          'sudoku',
                          'xdns',
                          'xicmp',
                          'realm',
                          'header-custom'
                      ],
                { req: true }
            ),
            mask.type === 'header-custom'
                ? json('settings', { hint: 'Custom header definition.' })
                : obj('settings', maskSettings, { show: (m) => !!m.type })
        ],
        { title: (m, i) => (m.type as string) || `Mask ${i + 1}`, create: () => ({ type: '' }) }
    )

export const FINALMASK_FIELDS: Field[] = [
    maskList('tcp'),
    maskList('udp'),
    obj('quicParams', QUIC_PARAMS, {
        label: 'QUIC params',
        hint: 'For Hysteria and other QUIC transports.'
    })
]

// Switching network or security drops the settings block of the old choice.
const pick = (keys: string[], keep: string | undefined) => (s: Obj) =>
    Object.fromEntries(Object.entries(s).filter(([k]) => !keys.includes(k) || k === keep))

export const transportTab = (side: Side): Field[] => [
    select('network', NETWORKS, {
        placeholder: 'raw',
        apply: (s, v) => ({
            ...pick(ALL_NETWORK_KEYS, NETWORK_SETTINGS[v ?? 'raw'])(s),
            network: v
        })
    }),
    ...transportFields(side)
]

export const securityTab = (side: Side): Field[] => [
    select(
        'security',
        [
            { value: 'none', label: 'None' },
            { value: 'tls', label: 'TLS' },
            { value: 'reality', label: 'REALITY' }
        ],
        {
            placeholder: 'none',
            apply: (s, v) => ({
                ...pick(
                    ['tlsSettings', 'realitySettings'],
                    v === 'none' ? undefined : `${v}Settings`
                )(s),
                security: v
            })
        }
    ),
    obj('tlsSettings', tlsFields(side), { label: 'TLS', show: (s) => s.security === 'tls' }),
    obj('realitySettings', realityFields(side), {
        label: 'REALITY',
        show: (s) => s.security === 'reality'
    })
]

export const streamFields = (side: Side): Field[] => [
    ...transportTab(side),
    ...securityTab(side),
    obj('sockopt', sockoptFields(side)),
    obj('finalmask', FINALMASK_FIELDS)
]

const DOWNLOAD_FIELDS: Field[] = [text('address'), num('port'), ...streamFields('out')]

export const STREAM_KEYS = [
    'network',
    'security',
    'tlsSettings',
    'realitySettings',
    'sockopt',
    'finalmask',
    ...ALL_NETWORK_KEYS
]

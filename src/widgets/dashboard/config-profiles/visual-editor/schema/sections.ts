import { bool, Field, list, map, num, Obj, obj, scalar, select, tags, text } from './types'

const QUERY_STRATEGIES = ['UseIP', 'UseIPv4', 'UseIPv6', 'UseSystem']

export const RULE_FIELDS: Field[] = [
    text('ruleTag', { hint: 'Optional name, shown in logs and used by the torrent blocker.' }),
    select('outboundTag', 'outboundTags', { free: true, hint: 'Where matching traffic goes.' }),
    select('balancerTag', 'balancerTags', {
        free: true,
        hint: 'Or send it to a balancer instead.'
    }),
    tags('domain', { hint: 'domain:, full:, regexp:, keyword: or geosite: entries.', full: true }),
    tags('ip', { label: 'IP', hint: 'IPs, CIDRs or geoip: entries.', full: true }),
    scalar('port', { hint: 'Target port: 53, 1000-2000 or "53,443".' }),
    select('network', ['tcp', 'udp', 'tcp,udp']),
    tags('protocol', {
        options: ['http', 'tls', 'quic', 'bittorrent'],
        hint: 'Needs sniffing on the inbound.'
    }),
    tags('inboundTag', { options: 'inboundTags' }),
    tags('user', { hint: 'User emails. Umiji uses the user ID as the email.' }),
    tags('sourceIP', { label: 'Source IP' }),
    scalar('sourcePort'),
    tags('localIP', { label: 'Local IP' }),
    scalar('localPort'),
    scalar('vlessRoute', {
        label: 'VLESS route',
        hint: 'Bytes 7-8 of the VLESS UUID, as numbers or ranges.'
    }),
    tags('process', { hint: 'Process names or paths (client side only).' }),
    map('attrs', 'text', { hint: 'HTTP header matches, like :method → GET.' }),
    obj(
        'webhook',
        [
            text('url', { req: true }),
            num('deduplication', { hint: 'Seconds.' }),
            map('headers', 'text')
        ],
        {
            hint: 'Call a URL when this rule matches.'
        }
    ),
    select('type', ['field'], { hint: 'Old field, no longer needed.' })
]

export const SNIPPET_FIELDS: Field[] = [select('snippet', 'snippets', { free: true, req: true })]

const STRATEGY_FIELDS: Field[] = [
    select('type', ['random', 'roundRobin', 'leastPing', 'leastLoad'], { placeholder: 'random' }),
    obj(
        'settings',
        [
            num('expected'),
            text('maxRTT', { placeholder: '1s' }),
            num('tolerance', { hint: '0 to 1.' }),
            tags('baselines', { hint: 'Durations, like 300ms.' }),
            list(
                'costs',
                [bool('regexp'), text('match', { req: true }), num('value', { req: true })],
                {
                    title: (c, i) => (c.match as string) || `Cost ${i + 1}`
                }
            )
        ],
        { show: (s) => s.type === 'leastLoad' }
    )
]

export const BALANCER_FIELDS: Field[] = [
    text('tag', { req: true }),
    tags('selector', {
        options: 'outboundTags',
        hint: 'Outbound tags, or prefixes of them.',
        full: true
    }),
    select('fallbackTag', 'outboundTags', { free: true }),
    obj('strategy', STRATEGY_FIELDS)
]

export const ROUTING_FIELDS: Field[] = [
    select('domainStrategy', ['AsIs', 'IPIfNonMatch', 'IPOnDemand'], {
        placeholder: 'AsIs',
        hint: 'When to resolve domains to match IP rules.'
    })
]

export const DNS_SERVER_FIELDS: Field[] = [
    text('address', { req: true, placeholder: 'https://1.1.1.1/dns-query' }),
    num('port'),
    tags('domains', { hint: 'Use this server for these domains.', full: true }),
    tags('expectedIPs', { label: 'Expected IPs', hint: 'Only accept answers in these ranges.' }),
    tags('unexpectedIPs', { label: 'Unexpected IPs' }),
    select('queryStrategy', QUERY_STRATEGIES),
    text('tag'),
    text('clientIp', { label: 'Client IP' }),
    num('timeoutMs', { placeholder: '4000' }),
    bool('skipFallback'),
    bool('finalQuery'),
    bool('disableCache'),
    bool('serveStale'),
    num('serveExpiredTTL', { label: 'Serve expired TTL' })
]

export const DNS_FIELDS: Field[] = [
    select('queryStrategy', QUERY_STRATEGIES, { placeholder: 'UseIP' }),
    text('tag', { hint: 'Inbound tag for DNS queries, usable in routing.' }),
    text('clientIp', { label: 'Client IP', hint: 'Sent as EDNS client subnet.' }),
    num('serveExpiredTTL', { label: 'Serve expired TTL' }),
    bool('disableCache'),
    bool('serveStale'),
    bool('disableFallback'),
    bool('disableFallbackIfMatch'),
    bool('enableParallelQuery'),
    bool('useSystemHosts'),
    map('hosts', 'tags', { hint: 'Domain → IPs or another domain. Supports geosite: keys.' })
]

export const LOG_FIELDS: Field[] = [
    select('loglevel', ['debug', 'info', 'warning', 'error', 'none'], { placeholder: 'warning' }),
    select('maskAddress', ['quarter', 'half', 'full'], { hint: 'Hide parts of IPs in logs.' }),
    text('access', { placeholder: 'none', hint: 'File path, or "none" to turn access logs off.' }),
    text('error', { hint: 'File path. Empty prints to stdout.' }),
    bool('dnsLog', { label: 'DNS log' })
]

export const POLICY_LEVEL_FIELDS: Field[] = [
    num('handshake', { placeholder: '4', hint: 'Seconds to finish a handshake.' }),
    num('connIdle', { placeholder: '300', hint: 'Seconds before an idle connection closes.' }),
    num('uplinkOnly', { placeholder: '2', hint: 'Seconds after the downlink closes.' }),
    num('downlinkOnly', { placeholder: '5', hint: 'Seconds after the uplink closes.' }),
    num('bufferSize', { hint: 'KB per connection. 0 turns buffering off.' })
]

export const OBSERVATORY_FIELDS: Field[] = [
    tags('subjectSelector', {
        options: 'outboundTags',
        hint: 'Outbound tags or prefixes to probe.',
        full: true
    }),
    text('probeURL', { label: 'Probe URL', placeholder: 'https://www.google.com/generate_204' }),
    text('probeInterval', { placeholder: '10s' }),
    bool('enableConcurrency')
]

export const BURST_OBSERVATORY_FIELDS: Field[] = [
    tags('subjectSelector', { options: 'outboundTags', full: true }),
    obj('pingConfig', [
        text('destination', { placeholder: 'https://connectivitycheck.gstatic.com/generate_204' }),
        text('connectivity'),
        text('interval', { placeholder: '1m' }),
        num('sampling', { placeholder: '1' }),
        text('timeout', { placeholder: '5s' }),
        select('httpMethod', ['HEAD', 'GET'], { free: true })
    ])
]

export const FAKEDNS_FIELDS: Field[] = [
    text('ipPool', { req: true, placeholder: '198.18.0.0/15' }),
    num('poolSize', { placeholder: '65535' })
]

export const GEODATA_FIELDS: Field[] = [
    text('cron', { hint: 'When to refresh the files, in cron syntax.', placeholder: '0 4 * * *' }),
    select('outbound', 'outboundTags', { free: true, hint: 'Outbound used to download them.' }),
    list(
        'assets',
        [text('url', { req: true }), text('file', { req: true, placeholder: 'geosite.dat' })],
        {
            title: (a, i) => (a.file as string) || `Asset ${i + 1}`
        }
    )
]

export const ADVANCED_FIELDS: Field[] = [
    tags('snippets', {
        options: 'snippets',
        hint: 'Snippets merged into the top level of this config.',
        full: true
    }),
    map('env', 'text', { hint: 'Environment overrides for Xray.' }),
    obj('version', [text('min'), text('max')], { hint: 'Xray versions this config accepts.' })
]

// Every top-level key the visual editor knows. The rest are listed as raw JSON under Advanced.
export const KNOWN_ROOT_KEYS = [
    'inbounds',
    'outbounds',
    'routing',
    'dns',
    'log',
    'policy',
    'observatory',
    'burstObservatory',
    'fakedns',
    'geodata',
    'snippets',
    'env',
    'version',
    'api',
    'stats',
    'metrics'
]

export const ruleSummary = (rule: Obj) => {
    const matchers = [
        'domain',
        'ip',
        'port',
        'network',
        'protocol',
        'inboundTag',
        'user',
        'sourceIP',
        'sourcePort',
        'localIP',
        'localPort',
        'vlessRoute',
        'process',
        'attrs'
    ]
        .filter((k) => rule[k] !== undefined)
        .map((k) => (Array.isArray(rule[k]) ? `${k} ×${(rule[k] as unknown[]).length}` : k))
    return {
        matchers,
        target: (rule.outboundTag ?? rule.balancerTag) as string | undefined,
        viaBalancer: !rule.outboundTag && !!rule.balancerTag
    }
}

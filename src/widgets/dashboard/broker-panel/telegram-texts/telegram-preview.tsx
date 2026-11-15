import { Text } from '@mantine/core'
import { BROKER_BOT_RTL_LANGS, tokenizeTelegramHtml } from '@umiji/backend-contract'
import { Fragment, ReactNode, useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TbHash, TbMicrophone, TbPaperclip } from 'react-icons/tb'

import classes from './bot-texts.module.css'
import { Defaults, Draft, Key, kindOf, Lang, textOf } from './bot-texts.utils'
import { IButtonSpec, PLAN_A, planVars, screenFor } from './preview-screens'

type Vars = Record<string, number | string>

// Sample values are wrapped in private-use marks, so the preview can underline where variables land.
const VAR_OPEN = ''
const VAR_CLOSE = ''
const VAR_MARKS = /[]/g
const HTML_VARS = new Set(['configs', 'destinations', 'period'])
const ENTITY = /&(amp|lt|gt|quot|#\d{1,7}|#x[\da-f]{1,6});/gi
const SAMPLE_EXPIRY = new Date(Date.now() + 30 * 86_400_000)

const escHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function decodeEntities(s: string): string {
    return s.replace(ENTITY, (m, e: string) => {
        const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"' }
        if (named[e.toLowerCase()]) return named[e.toLowerCase()]
        const code =
            e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
    })
}

function fill(template: string, vars: Vars, html: boolean): string {
    return template.replace(/\{(\w+)\}/g, (m, name: string) => {
        const v = vars[name]
        if (v === undefined) return m
        if (HTML_VARS.has(name)) return String(v)
        return VAR_OPEN + (html ? escHtml(String(v)) : String(v)) + VAR_CLOSE
    })
}

function withVarMarks(text: string): ReactNode {
    if (!text.includes(VAR_OPEN)) return text
    return text.split(VAR_OPEN).map((part, i) => {
        if (i === 0) return part
        const [value, rest = ''] = part.split(VAR_CLOSE)
        return (
            <Fragment key={i}>
                <span className={classes.varMark}>{value}</span>
                {rest}
            </Fragment>
        )
    })
}

interface IHtmlNode {
    attrs: Record<string, string>
    children: (IHtmlNode | string)[]
    tag: string
}

/** Telegram HTML to React, without innerHTML. Unclosed tags close at the end, like a lenient client. */
function renderTelegramHtml(html: string): ReactNode {
    const root: IHtmlNode = { tag: '', attrs: {}, children: [] }
    const stack = [root]
    for (const token of tokenizeTelegramHtml(html)) {
        const top = stack[stack.length - 1]
        if (token.type === 'text') top.children.push(decodeEntities(token.text))
        else if (token.type === 'open') {
            const node = { tag: token.tag, attrs: token.attrs, children: [] }
            top.children.push(node)
            stack.push(node)
        } else {
            const at = stack.map((n) => n.tag).lastIndexOf(token.tag)
            if (at > 0) stack.length = at
        }
    }
    return toReact(root.children)
}

function toReact(nodes: (IHtmlNode | string)[]): ReactNode {
    return nodes.map((node, i) => {
        if (typeof node === 'string') return <Fragment key={i}>{withVarMarks(node)}</Fragment>
        const children = toReact(node.children)
        switch (node.tag) {
            case 'b':
            case 'strong':
                return <strong key={i}>{children}</strong>
            case 'i':
            case 'em':
                return <em key={i}>{children}</em>
            case 'u':
            case 'ins':
                return <u key={i}>{children}</u>
            case 's':
            case 'strike':
            case 'del':
                return <s key={i}>{children}</s>
            case 'code':
                return (
                    <code className={classes.tgCode} key={i}>
                        {children}
                    </code>
                )
            case 'pre':
                return (
                    <pre className={classes.tgPre} key={i}>
                        {children}
                    </pre>
                )
            case 'blockquote':
                return (
                    <blockquote className={classes.tgQuote} key={i}>
                        {children}
                    </blockquote>
                )
            case 'a':
                return (
                    <span
                        className={classes.tgLink}
                        key={i}
                        title={node.attrs.href?.replace(VAR_MARKS, '')}
                    >
                        {children}
                    </span>
                )
            default:
                // tg-spoiler and span.tg-spoiler: hidden until hovered, like a tap reveals it.
                return (
                    <span className={classes.tgSpoiler} key={i} tabIndex={0}>
                        {children}
                    </span>
                )
        }
    })
}

interface IProps {
    botName: null | string
    defaults: Defaults
    draft: Draft
    /** The language being edited. Staff screens always show the default language. */
    lang: Lang
    selected: Key
}

export function TelegramPreview({ botName, defaults, draft, lang, selected }: IProps) {
    const { t } = useTranslation()

    const screen = screenFor(selected, draft.langs, lang)
    const isStaff = screen.chat === 'staff'
    const shown: Lang = isStaff ? draft.defaultLang : lang
    const dir = BROKER_BOT_RTL_LANGS.includes(shown) ? 'rtl' : 'ltr'

    const raw = (key: Key) => textOf(draft, defaults, shown, key)
    const money = (n: number) => `${n.toLocaleString('en-US')} ${raw('currency')}`

    const base: Vars = {
        ...planVars(PLAN_A, raw, money),
        balance: money(120_000),
        amount: money(250_000),
        link: 'https://sub.example.com/7fK2pQx',
        reason: t('broker-bot-texts.samples.reason'),
        number: 2,
        name: 'Premium 30',
        used: '12.40 GiB',
        limit: '50.00 GiB',
        expires: SAMPLE_EXPIRY.toLocaleDateString(shown),
        destinations:
            '💳 <b>Sara Ahmadi</b>\n<code>6037 9912 3456 7890</code>\n\n🪙 <b>USDT (TRC20)</b>\n<code>TQ4xR8…v9kP</code>' +
            '\n\n💸 <b>PayPal</b> · 1 USD = 100,000 Toman\n<code>pay@example.com</code>',
        configs: `\n\n${fill(raw('subConfigs'), {}, true)}\n<code>vless://…@de1.example.com:443#Germany</code>\n<code>vless://…@nl1.example.com:443#Netherlands</code>`,
        text:
            selected === 'supportReply'
                ? t('broker-bot-texts.samples.staff-reply')
                : t('broker-bot-texts.samples.customer-message'),
        id: 1042,
        customer: 'Sara @sara_m',
        tgId: '5550001',
        admin: '@alex',
        error: 'ETIMEDOUT',
        channel: '@your_channel',
        plan: 'Premium 30',
        referrer: 'Ali @ali_r',
        inviteLink: `https://t.me/${botName ?? 'your_bot'}?start=ref1042`,
        percent: 10,
        invited: 4,
        earned: money(35_000),
        date: '2026-11-06',
        newCustomers: 12,
        active: 87,
        referrals: 3,
        sales: 9,
        salesAmount: money(2_250_000),
        topups: 11,
        topupsAmount: money(2_700_000),
        rejected: 1,
        trials: 5,
        rewards: money(270_000),
        customers: 1240,
        buyers: 312,
        wallets: money(4_100_000),
        pending: 2
    }

    // A `period` var names the text that heads a stats block; it is rendered in place.
    const html = (key: Key, vars?: Vars) => {
        const all: Vars = { ...base, ...vars }
        if (vars?.period) all.period = fill(raw(vars.period as Key), base, true)
        return renderTelegramHtml(fill(raw(key), all, true))
    }
    const plain = (key: Key, vars?: Vars) =>
        withVarMarks(fill(raw(key), { ...base, ...vars }, false))

    const button = (spec: IButtonSpec, i: number) => {
        const vars =
            spec.key === 'planButton' && spec.vars ? planVars(spec.vars, raw, money) : spec.vars
        return (
            <div
                className={classes.tgButton}
                data-active={spec.key === selected || undefined}
                data-url={spec.url || undefined}
                key={i}
            >
                {spec.key ? plain(spec.key, vars) : spec.literal}
            </div>
        )
    }

    const topicActive = screen.topic?.key === selected

    // Chats sit at their newest message: show the bottom (and its buttons) when the screen changes.
    const bodyRef = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        const body = bodyRef.current
        if (body) body.scrollTop = body.scrollHeight
    }, [selected, shown])

    return (
        <div className={classes.phone}>
            <div className={classes.phoneScreen}>
                <div className={classes.chatHeader}>
                    <div className={classes.avatar} data-staff={isStaff || undefined}>
                        {isStaff ? '👥' : (botName?.[0] ?? 'B').toUpperCase()}
                    </div>
                    <div className={classes.chatTitle}>
                        <Text fw={600} lh={1.2} size="sm" truncate="end">
                            {isStaff
                                ? t('broker-bot-texts.preview.staff-group')
                                : (botName ?? t('broker-bot-texts.preview.your-bot'))}
                        </Text>
                        <Text c="dimmed" lh={1.2} size="xs">
                            {isStaff
                                ? t('broker-bot-texts.preview.staff-only')
                                : t('broker-bot-texts.preview.bot')}
                        </Text>
                    </div>
                </div>

                {screen.topic && (
                    <div className={classes.topicBar}>
                        <span className={classes.topicPill} data-active={topicActive || undefined}>
                            <TbHash size={13} />
                            {plain(screen.topic.key, screen.topic.vars)}
                        </span>
                    </div>
                )}

                <div className={classes.chatBody} ref={bodyRef}>
                    <div className={classes.chatInner} dir={dir}>
                        {screen.messages.map((m, i) => {
                            const isLast = i === screen.messages.length - 1
                            const active = [m, ...(m.append ?? [])].some(
                                (part) => part.key === selected || part.vars?.period === selected
                            )
                            return (
                                <div className={classes.tgMessage} key={`${m.key}-${i}`}>
                                    <div
                                        className={classes.tgBubble}
                                        data-active={
                                            (active && kindOf(selected) === 'message') || undefined
                                        }
                                    >
                                        {html(m.key, m.vars)}
                                        {m.append?.map((part, p) => (
                                            <Fragment key={p}>
                                                {'\n\n'}
                                                {html(part.key, part.vars)}
                                            </Fragment>
                                        ))}
                                        <span className={classes.tgTime}>12:41</span>
                                    </div>
                                    {isLast && !!screen.keyboard?.length && (
                                        <div className={classes.tgKeyboard}>
                                            {screen.keyboard.map((row, r) => (
                                                <div className={classes.tgRow} key={r}>
                                                    {row.map(button)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {screen.alert && (
                    <div className={classes.tgAlert} dir={dir} key={`${selected}-${shown}`}>
                        {plain(screen.alert)}
                    </div>
                )}

                <div className={classes.composer}>
                    <TbPaperclip size={18} />
                    <span>{t('broker-bot-texts.preview.message')}</span>
                    <TbMicrophone size={18} />
                </div>
            </div>
        </div>
    )
}

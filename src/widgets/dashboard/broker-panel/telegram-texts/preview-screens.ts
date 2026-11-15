import { BROKER_BOT_LANG_NAMES } from '@umiji/backend-contract'

import { Key, kindOf, Lang } from './bot-texts.utils'

type Vars = Record<string, number | string>

export interface IButtonSpec {
    key?: Key
    literal?: string
    url?: boolean
    vars?: Vars
}

/** A text with its sample values. A `period` var names a text whose rendering fills it. */
interface IPart {
    key: Key
    vars?: Vars
}

export interface IScreen {
    chat: 'customer' | 'staff'
    /** Topic of the staff group the messages sit in. */
    topic?: { key: Key; vars?: Vars }
    /** `append`: more texts in the same message, each two lines further down. */
    messages: (IPart & { append?: IPart[] })[]
    keyboard?: IButtonSpec[][]
    /** The pop-up Telegram shows after a tap. */
    alert?: Key
}

const b = (key: Key, extra: Omit<IButtonSpec, 'key'> = {}): IButtonSpec => ({ key, ...extra })
const back = [b('btnBack')]

const PLAN_A: Vars = {
    title: 'Premium 30',
    trafficGb: 50,
    durationDays: 30,
    ipLimit: 2,
    price: 250_000
}
const PLAN_B: Vars = { title: 'Lite 7', trafficGb: 0, durationDays: 7, price: 90_000 }

const CHANNEL: Vars = { title: 'VPN News' }

const REVIEW_TOPIC = { key: 'reviewTopicName' as Key }
const LOGS_TOPIC = { key: 'logsTopicName' as Key }
const TICKET_TOPIC = { key: 'ticketTopicName' as Key, vars: { name: 'Sara' } }

/** The trial and invite buttons only show when the broker switched them on. */
function menuKeyboard(withLanguage: boolean, withExtras = false): IButtonSpec[][] {
    return [
        [b('menuBuy')],
        ...(withExtras ? [[b('menuTrial')]] : []),
        [b('menuSubs'), b('menuWallet')],
        ...(withExtras ? [[b('menuInvite')]] : []),
        [b('menuSupport'), b('menuChannel', { url: true })],
        ...(withLanguage ? [[b('menuLanguage')]] : [])
    ]
}

const STATS_TOTALS: IPart = { key: 'statsTotals' }

const customer = (key: Key, keyboard?: IButtonSpec[][], vars?: Vars): IScreen => ({
    chat: 'customer',
    messages: [{ key, vars }],
    keyboard
})

/** The screen a text shows up on, built the way the bot builds it. */
export function screenFor(key: Key, langs: Lang[], lang: Lang): IScreen {
    const staffReview = (extra: Partial<IScreen> = {}): IScreen => ({
        chat: 'staff',
        topic: REVIEW_TOPIC,
        messages: [{ key: 'topupReview' }],
        keyboard: [[b('btnApprove'), b('btnReject')]],
        ...extra
    })

    switch (key) {
        case 'greeting':
        case 'menuBuy':
        case 'menuSubs':
        case 'menuWallet':
        case 'menuSupport':
        case 'menuChannel':
            return customer('greeting', menuKeyboard(langs.length > 1))
        case 'menuLanguage':
            return customer('greeting', menuKeyboard(true))
        case 'menuTrial':
        case 'menuInvite':
            return customer('greeting', menuKeyboard(langs.length > 1, true))
        case 'useMenu':
            return customer('useMenu', menuKeyboard(langs.length > 1))
        case 'chooseLanguage':
            return customer('chooseLanguage', [
                ...(langs.length > 1 ? langs : [lang, 'fa' as Lang]).map((l) => [
                    { literal: `${l === lang ? '✅ ' : ''}${BROKER_BOT_LANG_NAMES[l]}` }
                ]),
                back
            ])
        case 'chooseCategory':
        case 'catOther':
            return customer('chooseCategory', [[{ literal: '🗓 Monthly' }], [b('catOther')], back])
        case 'choosePlan':
        case 'planButton':
        case 'currency':
        case 'unlimited':
        case 'days':
            return customer('choosePlan', [
                [b('planButton', { vars: PLAN_A })],
                [b('planButton', { vars: PLAN_B })],
                back
            ])
        case 'planReview':
        case 'btnBuyWallet':
            return customer('planReview', [[b('btnBuyWallet')], back], PLAN_A)
        case 'insufficient':
            return customer('insufficient', [[b('btnCharge')], back])
        case 'walletScreen':
        case 'btnCharge':
            return customer('walletScreen', [[b('btnCharge')], back])
        case 'subsPick':
        case 'subFallback':
            return customer('subsPick', [
                [{ literal: 'Premium 30' }],
                [b('subFallback', { vars: { number: 2 } })],
                back
            ])
        case 'subDetail':
        case 'subConfigs':
            return customer('subDetail', [back])
        case 'inviteScreen':
            return customer('inviteScreen', [[b('menuInvite', { url: true })], back])
        case 'trialReview':
        case 'btnTrialClaim':
            return customer('trialReview', [[b('btnTrialClaim')], back], PLAN_A)
        case 'hours':
            return customer('trialReview', [[b('btnTrialClaim')], back], {
                ...PLAN_A,
                durationHours: 6
            })
        case 'trialUsed':
        case 'trialSoldOut':
            return customer(key, [[b('menuBuy')], back])

        case 'statsTitle':
        case 'statsToday':
        case 'stats7d':
        case 'stats30d':
        case 'statsPeriod':
        case 'statsTotals':
            return {
                chat: 'staff',
                messages: [
                    {
                        key: 'statsTitle',
                        append: [
                            { key: 'statsPeriod', vars: { period: 'statsToday' } },
                            { key: 'statsPeriod', vars: { period: 'stats7d' } },
                            { key: 'statsPeriod', vars: { period: 'stats30d' } },
                            STATS_TOTALS
                        ]
                    }
                ]
            }
        case 'dailySummaryTitle':
            return {
                chat: 'staff',
                topic: LOGS_TOPIC,
                messages: [
                    {
                        key: 'statsPeriod',
                        vars: { period: 'dailySummaryTitle' },
                        append: [STATS_TOTALS]
                    }
                ]
            }

        case 'joinRequired':
        case 'btnJoinChannel':
        case 'btnJoined':
            return customer('joinRequired', [
                [b('btnJoinChannel', { url: true, vars: CHANNEL })],
                [b('btnJoined')]
            ])
        case 'notJoinedYet':
            return {
                ...customer('joinRequired', [
                    [b('btnJoinChannel', { url: true, vars: CHANNEL })],
                    [b('btnJoined')]
                ]),
                alert: 'notJoinedYet'
            }

        case 'reviewTopicName':
        case 'reviewTopicIntro':
            return { chat: 'staff', topic: REVIEW_TOPIC, messages: [{ key: 'reviewTopicIntro' }] }
        case 'logsTopicName':
        case 'logsTopicIntro':
            return { chat: 'staff', topic: LOGS_TOPIC, messages: [{ key: 'logsTopicIntro' }] }
        case 'topupReview':
        case 'btnApprove':
        case 'btnReject':
            return staffReview()
        case 'btnRejectNoReason':
        case 'btnRejectWithReason':
        case 'btnStaffBack':
            return staffReview({
                keyboard: [[b('btnRejectNoReason'), b('btnRejectWithReason')], [b('btnStaffBack')]]
            })
        case 'approvedBy':
        case 'rejectedBy':
        case 'rejectedByReason':
            return staffReview({
                messages: [{ key: 'topupReview', append: [{ key }] }],
                keyboard: []
            })
        case 'askRejectReason':
            return staffReview({ messages: [{ key: 'topupReview' }, { key }], keyboard: [] })
        case 'alertApproved':
        case 'alertRejected':
        case 'alertSendReason':
        case 'alertHandled':
        case 'alertNothing':
        case 'alertAdminsOnly':
        case 'alertInactive':
            return staffReview({ alert: key })
        case 'ticketTopicName':
        case 'ticketIntro':
        case 'ticketRelay':
            return {
                chat: 'staff',
                topic: TICKET_TOPIC,
                messages: [{ key: 'ticketIntro', vars: { name: 'Sara' } }, { key: 'ticketRelay' }]
            }
        case 'logTopup':
        case 'logRejected':
        case 'logRejectedReason':
        case 'logError':
        case 'logMembership':
        case 'logNewCustomer':
        case 'logNewReferral':
        case 'logPurchase':
        case 'logTrial':
        case 'logReward':
        case 'logManualTopup':
            return { chat: 'staff', topic: LOGS_TOPIC, messages: [{ key }] }
        case 'groupCaptured':
            return { chat: 'staff', messages: [{ key }] }

        default:
            // Plain screens: the message, with a Back button where the bot shows one.
            return kindOf(key) === 'message'
                ? customer(
                      key,
                      [
                          'noPlans',
                          'unavailable',
                          'approved',
                          'chargePrompt',
                          'topupNoMethods',
                          'tooManyPending',
                          'subsEmpty',
                          'supportPrompt',
                          'supportUnavailable'
                      ].includes(key)
                          ? [back]
                          : undefined
                  )
                : customer('useMenu', menuKeyboard(langs.length > 1))
    }
}

/** Plan sample values, formatted the way the bot formats them. */
export function planVars(
    plan: Vars,
    word: (key: Key) => string,
    money: (n: number) => string
): Vars {
    return {
        title: plan.title,
        traffic: Number(plan.trafficGb) > 0 ? `${plan.trafficGb} GB` : word('unlimited'),
        duration: Number(plan.durationHours)
            ? `${plan.durationHours} ${word('hours')}`
            : `${plan.durationDays} ${word('days')}`,
        devices: Number(plan.ipLimit) > 0 ? `${plan.ipLimit}` : word('unlimited'),
        price: money(Number(plan.price))
    }
}

export { PLAN_A }

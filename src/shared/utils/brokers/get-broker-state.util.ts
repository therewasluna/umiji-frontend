import { GetBrokersCommand } from '@umiji/backend-contract'

type TBroker = Pick<
    GetBrokersCommand.Response['response']['brokers'][number],
    'expireAt' | 'isDisabled' | 'trafficLimitBytes' | 'usedTrafficBytes'
>

export type TBrokerState = 'active' | 'disabled' | 'exhausted' | 'expired'

/** Mirrors the backend rules: disabled brokers can't sign in, expired ones are read-only, exhausted ones can't add or re-enable users. */
export const getBrokerStateUtil = (broker: TBroker): TBrokerState => {
    if (broker.isDisabled) return 'disabled'
    if (broker.expireAt && broker.expireAt <= new Date()) return 'expired'
    if (broker.trafficLimitBytes > 0 && broker.usedTrafficBytes >= broker.trafficLimitBytes) {
        return 'exhausted'
    }
    return 'active'
}

export const BROKER_STATE_COLOR: Record<TBrokerState, string> = {
    active: 'teal',
    disabled: 'gray',
    expired: 'red',
    exhausted: 'orange'
}

export const getUsagePercentUtil = (used: number, limit: number): number =>
    limit > 0 ? Math.min(100, Math.round((used * 100) / limit)) : 0

export const getUsageColorUtil = (percent: number): string => {
    if (percent >= 95) return 'red'
    if (percent >= 80) return 'yellow'
    return 'rose'
}

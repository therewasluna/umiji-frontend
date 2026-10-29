import {
    GetBandwidthStatsCommand,
    GetUmijiHealthCommand,
    GetStatsCommand
} from '@umiji/backend-contract'

export interface IProps {
    bandwidthStats: GetBandwidthStatsCommand.Response['response']
    umijiHealth: GetUmijiHealthCommand.Response['response']
    systemInfo: GetStatsCommand.Response['response']
}

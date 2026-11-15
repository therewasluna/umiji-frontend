import { TFunction } from 'i18next'

import { formatInt, formatPercentage } from '@shared/utils/misc'

import {
    APP_MIN_SHARE,
    MAX_APPS,
    MAX_PLATFORMS,
    PLATFORM_BAR_COLOR
} from './hwid-inspector-metrics.constants'
import { IPlatformApp, IPlatformDatum } from './hwid-inspector-metrics.types'

export const formatCount = (value: number) => formatInt(value, { thousandSeparator: ' ' })

export const formatShare = (value: number, total: number) =>
    formatPercentage(total > 0 ? (value / total) * 100 : 0, { precision: 1 })

export function buildPlatformData(
    byPlatform: { byApp: IPlatformApp[]; count: number; platform: string }[],
    t: TFunction
): IPlatformDatum[] {
    return byPlatform
        .filter((platform) => platform.count > 0)
        .slice(0, MAX_PLATFORMS)
        .map((platform) => {
            const allApps = platform.byApp.map((app) => ({
                app: app.app || t('hwid-inspector-metrics.unknown'),
                count: app.count
            }))

            const apps = allApps
                .filter(
                    (app, appIndex) => appIndex === 0 || app.count >= platform.count * APP_MIN_SHARE
                )
                .slice(0, MAX_APPS)

            return {
                name: platform.platform || t('hwid-inspector-metrics.unknown'),
                value: platform.count,
                color: PLATFORM_BAR_COLOR,
                apps,
                allApps
            }
        })
}

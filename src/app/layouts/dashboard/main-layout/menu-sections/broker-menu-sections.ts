import { TFunction } from 'i18next'
import { PiArrowsInCardinalFill, PiUsers } from 'react-icons/pi'
import {
    TbBrandTelegram,
    TbChartBar,
    TbCirclesRelation,
    TbGauge,
    TbHexagon,
    TbLanguage,
    TbLink,
    TbReceipt,
    TbSettings,
    TbTool,
    TbUsersGroup,
    TbWebhook
} from 'react-icons/tb'

import { ROUTES } from '@shared/constants'

import { MenuItem } from './interfaces'

/**
 * Brokers manage their own users and subscription branding; everything else stays with the owner.
 * The same groups as the owner's menu, so a section header never just repeats its single link.
 */
export const BROKER_MENU_SECTIONS = (t: TFunction): MenuItem[] => [
    {
        header: t('constants.overview'),
        id: 'broker-overview',
        icon: TbGauge,
        section: [
            {
                name: t('brokers.panel.status'),
                href: ROUTES.DASHBOARD.BROKER.OVERVIEW,
                icon: TbGauge,
                id: 'broker-status'
            }
        ]
    },
    {
        header: t('constants.management'),
        id: 'broker-management',
        icon: TbUsersGroup,
        section: [
            {
                name: t('constants.users'),
                href: ROUTES.DASHBOARD.MANAGEMENT.USERS,
                icon: PiUsers,
                id: 'users'
            },
            {
                name: t('constants.internal-squads'),
                href: ROUTES.DASHBOARD.BROKER.INTERNAL_SQUADS,
                icon: TbCirclesRelation,
                id: 'broker-internal-squads'
            }
        ]
    },
    {
        header: t('constants.subscription'),
        id: 'broker-subscription',
        icon: TbHexagon,
        section: [
            {
                name: t('constants.subscription-page'),
                href: ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_PAGE,
                icon: PiArrowsInCardinalFill,
                id: 'broker-subscription-page'
            },
            {
                name: t('brokers.panel.subscription-settings'),
                href: ROUTES.DASHBOARD.BROKER.SUBSCRIPTION_SETTINGS,
                icon: TbWebhook,
                id: 'broker-subscription-settings'
            }
        ]
    },
    {
        header: t('broker-bot.title'),
        id: 'broker-telegram',
        icon: TbBrandTelegram,
        section: [
            {
                name: t('broker-bot.nav-settings'),
                href: ROUTES.DASHBOARD.BROKER.TELEGRAM_BOT,
                icon: TbSettings,
                id: 'broker-telegram-bot'
            },
            {
                name: t('broker-bot.stats.nav'),
                href: ROUTES.DASHBOARD.BROKER.TELEGRAM_STATS,
                icon: TbChartBar,
                id: 'broker-telegram-stats'
            },
            {
                name: t('broker-bot-texts.nav'),
                href: ROUTES.DASHBOARD.BROKER.TELEGRAM_TEXTS,
                icon: TbLanguage,
                id: 'broker-telegram-texts'
            },
            {
                name: t('broker-bot.orders.title'),
                href: ROUTES.DASHBOARD.BROKER.TELEGRAM_ORDERS,
                icon: TbReceipt,
                id: 'broker-telegram-orders'
            }
        ]
    },
    {
        header: t('constants.tools'),
        id: 'broker-tools',
        icon: TbTool,
        section: [
            {
                name: t('constants.quick-open'),
                href: ROUTES.DASHBOARD.TOOLS.QUICK_OPEN,
                icon: TbLink,
                id: 'quick-open'
            }
        ]
    }
]

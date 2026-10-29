import { TFunction } from 'i18next'
import { PiArrowsInCardinalFill, PiUsers } from 'react-icons/pi'
import {
    TbBrandTelegram,
    TbCirclesRelation,
    TbGauge,
    TbHexagon,
    TbLink,
    TbReceipt,
    TbSettings,
    TbWebhook
} from 'react-icons/tb'

import { ROUTES } from '@shared/constants'

import { MenuItem } from './interfaces'

/** Brokers manage their own users and subscription branding; everything else stays with the owner. */
export const BROKER_MENU_SECTIONS = (t: TFunction): MenuItem[] => [
    {
        header: t('brokers.panel.status'),
        id: 'broker-status',
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
        header: t('constants.users'),
        id: 'users',
        icon: PiUsers,
        section: [
            {
                name: t('constants.users'),
                href: ROUTES.DASHBOARD.MANAGEMENT.USERS,
                icon: PiUsers,
                id: 'users'
            }
        ]
    },
    {
        header: t('constants.internal-squads'),
        id: 'broker-internal-squads',
        icon: TbCirclesRelation,
        section: [
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
                name: t('broker-bot.orders.title'),
                href: ROUTES.DASHBOARD.BROKER.TELEGRAM_ORDERS,
                icon: TbReceipt,
                id: 'broker-telegram-orders'
            }
        ]
    },
    {
        header: t('constants.quick-open'),
        id: 'quick-open',
        icon: TbLink,
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

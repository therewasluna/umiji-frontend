import { TFunction } from 'i18next'
export const SWATCHES = [
    'rgb(21, 170, 191)',
    'rgb(167, 139, 250)',
    'rgb(56, 189, 248)',
    'rgb(251, 146, 60)',
    'rgb(52, 211, 153)',
    'rgb(244, 114, 182)',
    'rgb(250, 204, 21)',
    'rgb(239, 68, 68)',
    'rgb(45, 212, 191)',
    'rgb(192, 132, 252)',
    'rgb(251, 191, 36)',
    'rgb(74, 222, 128)',
    'rgb(249, 115, 22)',
    'rgb(236, 72, 153)',
    'rgb(99, 102, 241)',
    'rgb(14, 165, 233)'
]

export type CardSection = 'infra' | 'month' | 'stats'

export const getCardSections = (t: TFunction): { label: string; value: CardSection }[] => [
    { label: t('recap.nodes-traffic'), value: 'stats' },
    { label: t('recap.this-month'), value: 'month' },
    { label: t('recap.infrastructure'), value: 'infra' }
]

export const DEFAULT_SECTIONS: CardSection[] = ['stats', 'month', 'infra']

export type BgStyle = 'dots' | 'gradient' | 'grid' | 'solid'

export const getBgStyles = (t: TFunction): { label: string; value: BgStyle }[] => [
    { label: t('recap.solid'), value: 'solid' },
    { label: t('recap.gradient'), value: 'gradient' },
    { label: t('recap.dots'), value: 'dots' },
    { label: t('recap.grid'), value: 'grid' }
]

export type MaskableField =
    | 'countries'
    | 'cpuCores'
    | 'monthTraffic'
    | 'monthUsers'
    | 'nodes'
    | 'ram'
    | 'totalTraffic'
    | 'totalUsers'

export const getMaskableFields = (t: TFunction): { label: string; value: MaskableField }[] => [
    { label: t('recap.users'), value: 'totalUsers' },
    { label: t('recap.nodes'), value: 'nodes' },
    { label: t('recap.traffic'), value: 'totalTraffic' },
    { label: t('recap.new-users'), value: 'monthUsers' },
    { label: t('recap.month-traffic'), value: 'monthTraffic' },
    { label: t('recap.countries'), value: 'countries' },
    { label: t('recap.cpu-cores'), value: 'cpuCores' },
    { label: 'RAM', value: 'ram' }
]

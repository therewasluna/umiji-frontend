import { TFunction } from 'i18next'
export const SWATCHES = [
    '#FF7DB5',
    '#D23A7C',
    '#E84D92',
    '#B42F69',
    '#B591FF',
    '#9A7BF9',
    '#7C4DEB',
    '#8C36A4',
    '#4680F1',
    '#107DB2',
    '#FF8A5C',
    '#3DD68C'
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

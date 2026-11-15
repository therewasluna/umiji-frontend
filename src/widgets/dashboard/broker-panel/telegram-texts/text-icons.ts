import { TBrokerBotTextGroup, TBrokerBotTextKind } from '@umiji/backend-contract'
import { IconType } from 'react-icons'
import {
    TbAbc,
    TbBellRinging,
    TbGift,
    TbHandClick,
    TbHash,
    TbLayoutGrid,
    TbLetterCase,
    TbMessage,
    TbMessageCircle,
    TbPackage,
    TbShieldCheck,
    TbShoppingCart,
    TbSpeakerphone,
    TbUserPlus,
    TbWallet
} from 'react-icons/tb'

export const GROUP_ICONS: Record<TBrokerBotTextGroup, IconType> = {
    menu: TbLayoutGrid,
    plans: TbShoppingCart,
    wallet: TbWallet,
    subs: TbPackage,
    referral: TbUserPlus,
    trial: TbGift,
    support: TbMessageCircle,
    channels: TbSpeakerphone,
    words: TbLetterCase,
    staff: TbShieldCheck
}

export const KIND_ICONS: Record<TBrokerBotTextKind, IconType> = {
    message: TbMessage,
    button: TbHandClick,
    alert: TbBellRinging,
    topic: TbHash,
    word: TbAbc
}

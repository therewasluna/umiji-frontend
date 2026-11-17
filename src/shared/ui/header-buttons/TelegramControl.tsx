import { rem } from '@mantine/core'
import { TbBrandTelegram } from 'react-icons/tb'

import { HeaderControl } from './HeaderControl'

export function TelegramControl({ link }: { link: string }) {
    return (
        <HeaderControl
            aria-label="Telegram"
            component="a"
            href={link}
            rel="noopener noreferrer"
            target="_blank"
        >
            <TbBrandTelegram style={{ width: rem(22), height: rem(22) }} />
        </HeaderControl>
    )
}

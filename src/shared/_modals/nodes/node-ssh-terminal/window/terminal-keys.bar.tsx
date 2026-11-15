import type { TTerminalKey } from '../ssh-terminal.types'
import type { MouseEvent, ReactNode } from 'react'

import { Button, Group, Scroller } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbArrowDown, TbArrowLeft, TbArrowRight, TbArrowUp } from 'react-icons/tb'

import classes from '../NodeSshTerminal.module.css'

const ARROWS: Record<'down' | 'left' | 'right' | 'up', string> = {
    up: 'A',
    down: 'B',
    right: 'C',
    left: 'D'
}

export const keySequence = (key: TTerminalKey, isAppCursor: boolean): string => {
    if (key === 'esc') return '\x1b'
    if (key === 'tab') return '\t'

    return `${isAppCursor ? '\x1bO' : '\x1b['}${ARROWS[key]}`
}

// Ctrl turns @, A–Z and [\]^_ into control codes 0–31; other characters are sent unchanged.
export const withCtrl = (data: string): string => {
    const code = data.toUpperCase().charCodeAt(0)

    return code >= 64 && code <= 95 ? String.fromCharCode(code - 64) + data.slice(1) : data
}

// Keeps focus in the terminal so the phone keyboard stays open while a key is tapped.
const keepFocus = (event: MouseEvent) => event.preventDefault()

interface IProps {
    isCtrlArmed: boolean
    onKey: (key: TTerminalKey) => void
    onToggleCtrl: () => void
}

export const TerminalKeysBar = (props: IProps) => {
    const { isCtrlArmed, onKey, onToggleCtrl } = props
    const { t } = useTranslation()

    const key = (id: TTerminalKey, label: ReactNode, ariaLabel?: string) => (
        <Button
            aria-label={ariaLabel}
            color="gray"
            key={id}
            onClick={() => onKey(id)}
            onMouseDown={keepFocus}
            size="compact-md"
            variant="light"
        >
            {label}
        </Button>
    )

    return (
        <Scroller className={classes.keysBar}>
            <Group gap={6} p={6} wrap="nowrap">
                {key('esc', 'Esc')}
                {key('tab', 'Tab')}
                <Button
                    aria-pressed={isCtrlArmed}
                    color={isCtrlArmed ? 'cyan' : 'gray'}
                    onClick={onToggleCtrl}
                    onMouseDown={keepFocus}
                    size="compact-md"
                    variant={isCtrlArmed ? 'filled' : 'light'}
                >
                    Ctrl
                </Button>
                {key('left', <TbArrowLeft size={16} />, t('node-ssh.keys.left'))}
                {key('down', <TbArrowDown size={16} />, t('node-ssh.keys.down'))}
                {key('up', <TbArrowUp size={16} />, t('node-ssh.keys.up'))}
                {key('right', <TbArrowRight size={16} />, t('node-ssh.keys.right'))}
            </Group>
        </Scroller>
    )
}

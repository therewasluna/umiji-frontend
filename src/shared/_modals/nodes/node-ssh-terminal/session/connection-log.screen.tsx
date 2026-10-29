import type { TSshStage } from './ssh-connection'

import { Box, Button, Group, Stack, Text } from '@mantine/core'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbPlugConnected, TbSettings } from 'react-icons/tb'

import classes from '../NodeSshTerminal.module.css'

const getStages = (t: TFunction): { label: string; stage: TSshStage }[] => [
    { label: t('connection-log.session-ticket'), stage: 'ticket' },
    { label: t('connection-log.channel'), stage: 'channel' },
    { label: t('connection-log.host-key'), stage: 'verifying' },
    { label: t('connection-log.public-key'), stage: 'authenticating' },
    { label: t('connection-log.shell'), stage: 'ready' }
]

type TRowState = 'active' | 'done' | 'failed' | 'pending'

const GLYPH: Record<TRowState, string> = {
    active: '▸',
    done: '✓',
    failed: '✗',
    pending: '·'
}

interface IProps {
    error: null | string
    onOpenSettings: () => void
    onRetry: () => void
    stage: TSshStage
    target: string
}

export const ConnectionLogScreen = (props: IProps) => {
    const { error, onOpenSettings, onRetry, stage, target } = props
    const { t } = useTranslation()

    const activeIndex = getStages(t).findIndex((item) => item.stage === stage)

    const resolveState = (index: number): TRowState => {
        if (index < activeIndex) return 'done'
        if (index > activeIndex) return 'pending'
        if (error) return 'failed'
        return stage === 'ready' ? 'done' : 'active'
    }

    return (
        <Stack className={classes.log} gap={0} maw={460} mx="auto" w="100%">
            <Text className={classes.logTarget}>{target}</Text>

            <Stack gap={2} mt="xs">
                {getStages(t).map((item, index) => {
                    const state = resolveState(index)

                    return (
                        <Group
                            className={classes.logRow}
                            data-state={state}
                            gap="sm"
                            key={item.stage}
                            wrap="nowrap"
                        >
                            <Box className={classes.logGlyph}>{GLYPH[state]}</Box>
                            <Text inherit>{item.label}</Text>
                            {state === 'active' && <Box className={classes.logPulse} />}
                        </Group>
                    )
                })}
            </Stack>

            {error && (
                <Stack gap="sm" mt="md">
                    <Stack align="center" className={classes.logFailure} gap={6}>
                        <TbAlertTriangle size={18} />
                        <Text className={classes.logError}>{error}</Text>
                    </Stack>

                    <Group className={classes.logActions} gap="xs" grow>
                        <Button
                            color="gray"
                            leftSection={<TbSettings size={16} />}
                            onClick={onOpenSettings}
                            size="sm"
                            variant="soft"
                        >
                            {t('node-ssh.connection-settings')}
                        </Button>
                        <Button
                            leftSection={<TbPlugConnected size={16} />}
                            onClick={onRetry}
                            size="sm"
                            variant="soft"
                        >
                            {t('node-ssh.retry')}
                        </Button>
                    </Group>
                </Stack>
            )}
        </Stack>
    )
}

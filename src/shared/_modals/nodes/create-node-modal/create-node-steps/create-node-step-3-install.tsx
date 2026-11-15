import { Alert, Button, Group, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core'
import {
    NODE_INSTALL_STEP_WEIGHTS,
    TNodeInstallErrorCode,
    TNodeInstallState
} from '@umiji/backend-contract'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbAlertTriangle,
    TbArrowLeft,
    TbCheck,
    TbChevronDown,
    TbExternalLink,
    TbRefresh,
    TbX
} from 'react-icons/tb'

import { useGetNodeInstall } from '@shared/api/hooks'

import classes from './NodeInstall.module.css'

type TStep = TNodeInstallState['steps'][number]

interface IProps {
    installId: string
    isRetrying: boolean
    onBack: () => void
    onClose: () => void
    onOpenNode: (nodeUuid: string) => void
    onRetry: () => void
}

// Done steps count fully; the running one eases toward 90% of its share over its usual duration.
export const getInstallPercent = (steps: TStep[], now: number): number => {
    let percent = 0

    for (const step of steps) {
        const { ms, weight } = NODE_INSTALL_STEP_WEIGHTS[step.id]

        if (step.status === 'done') percent += weight
        if (step.status === 'running' && step.startedAt) {
            const elapsed = Math.max(0, now - step.startedAt)
            percent += weight * 0.9 * (1 - Math.exp(-elapsed / ms))
        }
    }

    return Math.min(100, percent)
}

const formatClock = (ms: number) => {
    const seconds = Math.max(0, Math.floor(ms / 1000))

    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

const formatSpan = (ms: number) => {
    if (ms < 10_000) return `${(Math.max(0, ms) / 1000).toFixed(1)}s`

    const seconds = Math.round(ms / 1000)

    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

const StepMarker = ({ status }: { status: TStep['status'] }) => (
    <span aria-hidden className={classes.marker}>
        {status === 'done' && <TbCheck size={13} strokeWidth={3} />}
        {status === 'failed' && <TbX size={13} strokeWidth={3} />}
    </span>
)

export const CreateNodeStep3Install = (props: IProps) => {
    const { installId, isRetrying, onBack, onClose, onOpenNode, onRetry } = props
    const { t } = useTranslation()

    const { data: install } = useGetNodeInstall({ route: { id: installId } })

    const status = install?.status ?? 'running'

    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        if (status !== 'running') return undefined

        const timer = setInterval(() => setNow(Date.now()), 250)
        return () => clearInterval(timer)
    }, [status])

    // Open while it matters (running or failed); a successful install folds it away unless asked.
    const [outputToggle, setOutputToggle] = useState<boolean | null>(null)
    const outputRef = useRef<HTMLDivElement | null>(null)
    const isPinnedRef = useRef(true)
    const lineCount = install?.log.length ?? 0

    useEffect(() => {
        const output = outputRef.current
        if (output && isPinnedRef.current) output.scrollTop = output.scrollHeight
    }, [lineCount, outputToggle])

    if (!install) {
        return (
            <Stack gap="lg" mih={400}>
                <Skeleton h={112} radius="md" />
                <Skeleton h={220} radius="md" />
            </Stack>
        )
    }

    const isOutputOpen = outputToggle ?? status !== 'success'
    const percent = status === 'success' ? 100 : getInstallPercent(install.steps, now)
    const lastFinish = Math.max(install.updatedAt, ...install.steps.map((s) => s.finishedAt ?? 0))
    const elapsed = (status === 'running' ? now : lastFinish) - install.startedAt
    const errorCode: TNodeInstallErrorCode | undefined = install.error?.code

    const title = {
        failed: t('node-install.failed'),
        running: t('node-install.installing'),
        success: t('node-install.installed')
    }[status]

    return (
        <Stack gap="lg" mih={400}>
            <div className={classes.hero} data-status={status}>
                <Group align="flex-end" gap="md" justify="space-between" wrap="nowrap">
                    <Stack gap={4} miw={0}>
                        <Text className={classes.target} dir="ltr" truncate>
                            {install.name} · {install.address}
                        </Text>
                        <Text className={classes.title}>{title}</Text>
                        <Text c="dimmed" className={classes.clock} size="xs">
                            {
                                {
                                    failed: t('node-install.stopped', {
                                        time: formatClock(elapsed)
                                    }),
                                    running: t('node-install.elapsed', {
                                        time: formatClock(elapsed)
                                    }),
                                    success: t('node-install.took', { time: formatClock(elapsed) })
                                }[status]
                            }
                        </Text>
                    </Stack>

                    <Text aria-hidden className={classes.percent}>
                        {Math.floor(percent)}
                        <span>%</span>
                    </Text>
                </Group>

                <div
                    aria-label={title}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={Math.floor(percent)}
                    className={classes.track}
                    role="progressbar"
                >
                    <div className={classes.fill} style={{ width: `${Math.max(percent, 2)}%` }} />
                </div>
            </div>

            <ol className={classes.timeline}>
                {install.steps.map((step) => {
                    const span =
                        step.startedAt &&
                        (step.finishedAt ?? (step.status === 'running' ? now : null))

                    return (
                        <li className={classes.step} data-status={step.status} key={step.id}>
                            <StepMarker status={step.status} />

                            <div className={classes.stepBody}>
                                <Text className={classes.stepLabel}>
                                    {t(`node-install.steps.${step.id}`)}
                                </Text>
                                {step.detail && (
                                    <Text className={classes.stepDetail} dir="ltr" truncate>
                                        {step.detail}
                                    </Text>
                                )}
                            </div>

                            {span && step.startedAt ? (
                                <Text className={classes.stepTime}>
                                    {formatSpan(span - step.startedAt)}
                                </Text>
                            ) : null}
                        </li>
                    )
                })}
            </ol>

            {status === 'failed' && errorCode && (
                <Alert
                    color="red"
                    icon={<TbAlertTriangle size={20} />}
                    title={t(`node-install.errors.${errorCode}`)}
                    variant="light"
                >
                    <Text className={classes.errorMessage} dir="ltr">
                        {install.error?.message}
                    </Text>
                </Alert>
            )}

            <div className={classes.output} data-open={isOutputOpen || undefined}>
                <UnstyledButton
                    aria-expanded={isOutputOpen}
                    className={classes.outputHeader}
                    onClick={() => setOutputToggle(!isOutputOpen)}
                >
                    <span className={classes.liveDot} data-status={status} />
                    <Text fw={500} size="xs">
                        {t('node-install.output')}
                    </Text>
                    <TbChevronDown className={classes.chevron} size={14} />
                </UnstyledButton>

                {isOutputOpen && (
                    <div
                        className={classes.outputBody}
                        dir="ltr"
                        onScroll={(event) => {
                            const { clientHeight, scrollHeight, scrollTop } = event.currentTarget
                            isPinnedRef.current = scrollHeight - scrollTop - clientHeight < 24
                        }}
                        ref={outputRef}
                    >
                        {install.log.length === 0 ? (
                            <span className={classes.outputEmpty}>
                                {t('node-install.waiting-output')}
                            </span>
                        ) : (
                            install.log.map((line, index) => (
                                <div className={classes.outputLine} key={index}>
                                    {line}
                                </div>
                            ))
                        )}
                        {status === 'running' && <span className={classes.caret} />}
                    </div>
                )}
            </div>

            <Group gap="md" justify="space-between" mt="auto">
                {status === 'failed' ? (
                    <>
                        <Button
                            color="gray"
                            leftSection={<TbArrowLeft size={18} />}
                            onClick={onBack}
                            size="md"
                        >
                            {t('node-install.edit-details')}
                        </Button>
                        <Button
                            color="teal"
                            leftSection={<TbRefresh size={18} />}
                            loading={isRetrying}
                            onClick={onRetry}
                            size="md"
                        >
                            {t('node-install.try-again')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            color="gray"
                            leftSection={<TbX size={18} />}
                            onClick={onClose}
                            size="md"
                        >
                            {t('common.action.close')}
                        </Button>
                        {status === 'success' && install.nodeUuid && (
                            <Button
                                color="teal"
                                leftSection={<TbExternalLink size={18} />}
                                onClick={() => onOpenNode(install.nodeUuid!)}
                                size="md"
                            >
                                {t('create-node-modal.widget.open-node')}
                            </Button>
                        )}
                    </>
                )}
            </Group>
        </Stack>
    )
}

import { ActionIcon, Group } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbArrowsDiagonal, TbArrowsDiagonalMinimize2, TbMinus, TbPlus, TbX } from 'react-icons/tb'

import classes from '../NodeSshTerminal.module.css'

interface IProps {
    isCloseOnly?: boolean
    isMaximized: boolean
    isMinimized: boolean
    onClose: () => void
    onToggleMaximized: () => void
    onToggleMinimized: () => void
}

export const TrafficLights = (props: IProps) => {
    const { isCloseOnly, isMaximized, isMinimized, onClose, onToggleMaximized, onToggleMinimized } =
        props
    const { t } = useTranslation()

    // A full-screen phone window only needs a close button big enough to tap.
    if (isCloseOnly) {
        return (
            <ActionIcon
                aria-label={t('common.action.close')}
                color="gray"
                onClick={onClose}
                size="lg"
                variant="subtle"
            >
                <TbX size={20} />
            </ActionIcon>
        )
    }

    return (
        <Group className={classes.trafficLights} gap={8} wrap="nowrap">
            <ActionIcon
                className={classes.trafficLight}
                color="red"
                onClick={onClose}
                radius={256}
                variant="filled"
            >
                <TbX size={14} />
            </ActionIcon>

            <ActionIcon
                className={classes.trafficLight}
                color="yellow"
                onClick={onToggleMinimized}
                radius={256}
                variant="filled"
            >
                {isMinimized ? <TbPlus size={14} /> : <TbMinus size={14} />}
            </ActionIcon>

            <ActionIcon
                className={classes.trafficLight}
                color="green"
                onClick={onToggleMaximized}
                radius={256}
                variant="filled"
            >
                {isMaximized ? (
                    <TbArrowsDiagonalMinimize2 size={14} />
                ) : (
                    <TbArrowsDiagonal size={14} />
                )}
            </ActionIcon>
        </Group>
    )
}

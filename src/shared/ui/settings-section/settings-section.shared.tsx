import { ActionIcon, Badge, Button, Collapse, Group, Text, ThemeIcon, Title } from '@mantine/core'
import { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TbChevronDown, TbPlus } from 'react-icons/tb'

import classes from './settings-section.module.css'

interface IProps {
    action?: ReactNode
    children?: ReactNode
    count?: string
    hint?: ReactNode
    Icon: ComponentType<{ size?: number | string }>
    /** Lights the tile up: at a glance, what's set up or switched on. */
    isLit?: boolean
    /** Mouse convenience for a row that opens: the toggle in `action` stays the keyboard control. */
    onHeadClick?: () => void
    title: string
}

/** One row of a settings card: icon tile, text, action, with its contents under the text column. */
export function SettingsSection(props: IProps) {
    const { action, children, count, hint, Icon, isLit, onHeadClick, title } = props

    return (
        <section className={classes.section}>
            <div
                className={classes.head}
                data-clickable={onHeadClick ? true : undefined}
                onClick={onHeadClick}
            >
                <ThemeIcon
                    color={isLit ? 'rose' : 'gray'}
                    radius="md"
                    size={40}
                    variant={isLit ? 'light' : 'soft'}
                >
                    <Icon size={20} />
                </ThemeIcon>

                <div className={classes.headText}>
                    <Group gap={8}>
                        <Title fz={15} order={3}>
                            {title}
                        </Title>
                        {count && (
                            <Badge color="gray" size="sm" variant="soft">
                                <bdi>{count}</bdi>
                            </Badge>
                        )}
                    </Group>
                    {hint && (
                        <Text c="dimmed" size="sm">
                            {hint}
                        </Text>
                    )}
                </div>

                {action && (
                    // Controls in here act for themselves; a click on one must not also open the row.
                    <div className={classes.action} onClick={(event) => event.stopPropagation()}>
                        {action}
                    </div>
                )}
            </div>

            {children}
        </section>
    )
}

interface IAddProps {
    disabled?: boolean
    /** The button says "Add"; this names what it adds, for screen readers. */
    label: string
    onClick: () => void
}

export function SettingsSectionAddButton({ disabled, label, onClick }: IAddProps) {
    const { t } = useTranslation()

    return (
        <Button
            aria-label={label}
            color="rose"
            disabled={disabled}
            flex="none"
            leftSection={<TbPlus size={16} />}
            onClick={onClick}
            size="xs"
            variant="light"
        >
            {t('common.action.add')}
        </Button>
    )
}

interface IToggleProps {
    label: string
    onClick: () => void
    opened: boolean
}

export function SettingsSectionToggle({ label, onClick, opened }: IToggleProps) {
    return (
        <ActionIcon
            aria-expanded={opened}
            aria-label={label}
            className={classes.toggle}
            color="gray"
            data-opened={opened || undefined}
            onClick={onClick}
            radius="xl"
            size="lg"
            variant="subtle"
        >
            <TbChevronDown size={18} />
        </ActionIcon>
    )
}

interface IPanelProps {
    children: ReactNode
    opened: boolean
}

/** What a row reveals when it opens, lined up under the row's text. */
export function SettingsSectionPanel({ children, opened }: IPanelProps) {
    return (
        <Collapse expanded={opened}>
            <div className={classes.panel}>{children}</div>
        </Collapse>
    )
}

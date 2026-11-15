import { Box, BoxProps, Group, Text, Title } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import clsx from 'clsx'
import { forwardRef, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import classes from './page-header.module.css'

export interface PageHeaderSharedProps extends BoxProps {
    actions?: ReactNode
    description?: string
    title: ReactNode
    wrapActions?: boolean
}

export const PageHeaderShared = forwardRef<HTMLDivElement, PageHeaderSharedProps>(
    ({ title, description, actions, wrapActions = false, className, ...props }, ref) => {
        const { copy } = useClipboard()
        const { t } = useTranslation()

        const handleCopy = () => {
            if (description) {
                copy(description)
                notifications.show({
                    message: description,
                    title: t('common.message.copied'),
                    color: 'teal'
                })
            }
        }

        return (
            <Box className={clsx(classes.header, className)} mb="lg" ref={ref} {...props}>
                <div className={classes.titleBlock}>
                    <Title className={classes.title} order={1}>
                        {title}
                    </Title>
                    {description && (
                        <Text c="dimmed" fz="sm" onClick={handleCopy} style={{ cursor: 'copy' }}>
                            {description}
                        </Text>
                    )}
                </div>

                {actions && (
                    <Group
                        className={classes.actions}
                        gap="xs"
                        justify="flex-end"
                        wrap={wrapActions ? 'wrap' : 'nowrap'}
                    >
                        {actions}
                    </Group>
                )}
            </Box>
        )
    }
)

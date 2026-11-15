import { Box, CardSection, CardSectionProps, Group, Text, Title } from '@mantine/core'
import { forwardRef, ReactNode } from 'react'

import classes from './table.module.css'

export interface CardTitleProps extends Omit<CardSectionProps, 'c' | 'fw' | 'size' | 'tt'> {
    actions?: ReactNode
    description?: string
    title: ReactNode
}

export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
    ({ title, description, actions, withBorder = false, ...props }, ref) => (
        <CardSection
            className={classes.card}
            data-orientation="vertical"
            inheritPadding
            py="md"
            ref={ref}
            withBorder={withBorder}
            {...props}
        >
            <Box className={classes.headerWrapper}>
                <Box className={classes.contentSection}>
                    <Title className={classes.title} order={2}>
                        {title}
                    </Title>
                    {description && (
                        <Text c="dimmed" fz="sm">
                            {description}
                        </Text>
                    )}
                </Box>

                {actions && (
                    <Group className={classes.actionsSection} gap="xs" wrap="nowrap">
                        {actions}
                    </Group>
                )}
            </Box>
        </CardSection>
    )
)

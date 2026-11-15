import { Card, CardProps } from '@mantine/core'
import clsx from 'clsx'

import classes from './table.module.css'

type TableContainerSharedProps = CardProps

export function TableContainerShared({ children, className, ...props }: TableContainerSharedProps) {
    return (
        <Card
            className={clsx(classes.container, className)}
            padding={0}
            withBorder={false}
            {...props}
        >
            {children}
        </Card>
    )
}

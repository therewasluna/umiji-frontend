import { Card } from '@mantine/core'

import classes from './entity-card.module.css'

interface EntityCardProps {
    children: React.ReactNode
    isActive?: boolean
    onClick?: () => void
}

export function EntityCardRoot(props: EntityCardProps) {
    const { children, isActive = true, onClick } = props

    return (
        <Card
            className={classes.card}
            data-active={isActive || undefined}
            data-clickable={onClick ? true : undefined}
            data-layout="row"
            onClick={onClick}
            onKeyDown={
                onClick
                    ? (event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return
                          if (event.target !== event.currentTarget) return

                          event.preventDefault()
                          onClick()
                      }
                    : undefined
            }
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </Card>
    )
}

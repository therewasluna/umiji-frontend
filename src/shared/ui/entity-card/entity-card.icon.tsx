import { ActionIcon, ActionIconProps, PolymorphicComponentProps } from '@mantine/core'

import classes from './entity-card.module.css'

interface EntityCardIconProps extends PolymorphicComponentProps<'div', ActionIconProps> {
    highlight?: boolean
}

// A quiet glyph, not a tinted tile: rose when the item is in use.
export function EntityCardIcon({ children, highlight = true, ...props }: EntityCardIconProps) {
    return (
        <ActionIcon
            className={classes.icon}
            component="div"
            c={highlight ? 'rose.4' : 'dark.3'}
            size={28}
            variant="transparent"
            {...props}
        >
            {children}
        </ActionIcon>
    )
}

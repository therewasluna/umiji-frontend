import { Card, CardProps, Flex } from '@mantine/core'

import classes from './settings-card.module.css'

type SettingsCardContainerProps = CardProps

export function SettingsCardContainer({ children, ...props }: SettingsCardContainerProps) {
    return (
        <Card className={classes.container} padding="lg" withBorder {...props}>
            {/* flex=1 lets a card stretched by a grid row grow, so Bottom can sit at the foot. */}
            <Flex direction="column" flex={1} gap="xs">
                {children}
            </Flex>
        </Card>
    )
}

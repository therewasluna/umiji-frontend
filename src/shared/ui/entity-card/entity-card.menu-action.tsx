import { ActionIcon, Menu } from '@mantine/core'
import { useDisclosure, useId } from '@mantine/hooks'
import { TbDots } from 'react-icons/tb'

import classes from './entity-card.module.css'

interface MenuActionProps {
    children: React.ReactNode
}

export function EntityCardMenuAction({ children }: MenuActionProps) {
    const uuid = useId()
    const [opened, handlers] = useDisclosure()

    return (
        <Menu
            key={uuid}
            onClose={handlers.close}
            onOpen={handlers.open}
            position="bottom-end"
            radius="md"
            // Not click-hover: a hover menu stays open under a resting pointer, above the dialog its item opened.
            trigger="click"
            withinPortal
        >
            <Menu.Target>
                <ActionIcon
                    className={classes.menuControl}
                    color={opened ? 'cyan' : 'gray'}
                    onClick={(event) => event.stopPropagation()}
                    size="30"
                    variant={opened ? 'light' : 'subtle'}
                >
                    <TbDots size={18} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(event) => event.stopPropagation()}>{children}</Menu.Dropdown>
        </Menu>
    )
}

import { Drawer, DrawerProps, Group, useProps } from '@mantine/core'
import { ReactNode } from 'react'

interface IProps {
    drawerProps: Omit<DrawerProps, 'children' | 'title'>
    children: ReactNode
    title: ReactNode
    buttons?: ReactNode
}

export const CompoundDrawerShared = (props: IProps) => {
    const { drawerProps, children, title, buttons } = props

    const rootProps = useProps('Drawer', {}, drawerProps)

    return (
        <Drawer.Root {...rootProps}>
            <Drawer.Overlay />
            <Drawer.Content>
                <Drawer.Header>
                    <Drawer.Title>{title}</Drawer.Title>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                        {buttons}
                        <Drawer.CloseButton iconSize={18} size="lg" />
                    </Group>
                </Drawer.Header>
                <Drawer.Body>{children}</Drawer.Body>
            </Drawer.Content>
        </Drawer.Root>
    )
}

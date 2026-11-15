import { useDisclosure } from '@mantine/hooks'

import { SidebarShellLayout } from './sidebar-shell.layout'

interface IProps {
    headerControls: React.ReactNode
}

export const SidebarLayout = (props: IProps) => {
    const { headerControls } = props

    const [opened, { close, toggle }] = useDisclosure(false)

    return (
        <SidebarShellLayout
            headerControls={headerControls}
            onNavClose={close}
            opened={opened}
            padding="xl"
            toggle={toggle}
            withFadeIn
        />
    )
}

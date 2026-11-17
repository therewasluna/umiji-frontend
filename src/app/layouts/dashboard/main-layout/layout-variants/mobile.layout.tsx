import { Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { HeaderControls } from '@shared/ui'

import { IUmijiInfo } from '@entities/dashboard/updates-store'

import { DASHBOARD_LINKS } from '../layout-shared'
import { SidebarShellLayout } from './sidebar-shell.layout'

interface IProps {
    headerControls: React.ReactNode
    isLoadingUpdates: boolean
    isSocialButtons: boolean
    umijiInfo: IUmijiInfo
}

export const MobileLayout = (props: IProps) => {
    const { headerControls, isLoadingUpdates, isSocialButtons, umijiInfo } = props

    const [opened, { close, toggle }] = useDisclosure()

    return (
        <SidebarShellLayout
            footer={
                isSocialButtons && (
                    <Group justify="center" mt="md" style={{ flexShrink: 0 }}>
                        <HeaderControls
                            {...DASHBOARD_LINKS}
                            isGithubLoading={isLoadingUpdates}
                            stars={umijiInfo.starsCount || undefined}
                            withLanguage={false}
                            withLogout={false}
                            withTelegram
                            withVersion={false}
                        />
                    </Group>
                )
            }
            headerControls={headerControls}
            onNavClose={close}
            opened={opened}
            padding="md"
            toggle={toggle}
        />
    )
}

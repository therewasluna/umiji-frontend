import { AppShell, Burger, Container, Drawer, Group, ScrollArea } from '@mantine/core'

import { LayoutBrand, LayoutMain } from '../layout-shared'
import classes from '../layout.module.css'
import { MobileNavigation } from '../navbar/mobile-navigation.layout'

interface IProps {
    footer?: React.ReactNode
    headerControls: React.ReactNode
    onNavClose: () => void
    opened: boolean
    padding: string
    toggle: () => void
    withFadeIn?: boolean
}

/** The side nav is a drawer at every width: it opens over the page, so the content never shifts. */
export const SidebarShellLayout = (props: IProps) => {
    const { footer, headerControls, onNavClose, opened, padding, toggle, withFadeIn } = props

    return (
        <AppShell
            className={withFadeIn ? classes.appShellFadeIn : undefined}
            header={{ height: 64, collapsed: false, offset: false }}
            padding={padding}
        >
            <AppShell.Header className={classes.header} withBorder={false}>
                {/* Same side padding as the page, so the burger and header buttons line up with its edges. */}
                <Container fluid px={padding} py="xs">
                    <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
                        <Group style={{ flex: 1, justifyContent: 'flex-start' }}>
                            <Burger
                                onClick={toggle}
                                opened={opened}
                                size="md"
                                // The lines sit half an xs inside the button; pull it out so the lines meet the edge.
                                style={{
                                    marginInlineStart: 'calc(var(--mantine-spacing-xs) / -2)'
                                }}
                            />
                        </Group>
                        <Group style={{ flexShrink: 0 }}>{headerControls}</Group>
                    </Group>
                </Container>
            </AppShell.Header>

            <Drawer
                classNames={{ body: classes.sidebarBody, content: classes.sidebarWrapper }}
                onClose={onNavClose}
                opened={opened}
                // Mantine lays drawers out with flexbox, so 'left' is the start side: right in RTL.
                offset={0}
                position="left"
                radius={0}
                size={300}
                withCloseButton={false}
            >
                <div className={classes.logoSection}>
                    <Burger
                        className={classes.drawerBurger}
                        onClick={onNavClose}
                        opened={opened}
                        size="sm"
                    />
                    <LayoutBrand gap="xs" wrap="nowrap" />
                </div>

                <ScrollArea className={classes.scrollArea} flex={1} scrollbarSize="0.2rem">
                    <MobileNavigation onClose={onNavClose} />
                </ScrollArea>

                {footer && <div className={classes.footerSection}>{footer}</div>}
            </Drawer>

            <LayoutMain
                pb="var(--mantine-spacing-md)"
                pt="calc(var(--app-shell-header-height) + 10px)"
            />
        </AppShell>
    )
}

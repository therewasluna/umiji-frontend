import { Box, Divider, NavLink, Stack, Title } from '@mantine/core'
import { PiArrowRight } from 'react-icons/pi'
import { NavLink as RouterLink, useLocation } from 'react-router'

import { useMobileMenuSections } from '../menu-sections/mobile-menu-sections'
import classes from './mobile-navigation.module.css'

// A page and anything under it (a config profile's own page lights up Config Profiles).
const isCurrent = (pathname: string, href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

interface IProps {
    onClose?: () => void
}

export const MobileNavigation = (props: IProps) => {
    const { onClose } = props
    const { pathname } = useLocation()

    const menu = useMobileMenuSections()

    return (
        <Stack gap="md" pb="md" pt="md">
            {menu.map((item, index) => (
                <Box key={item.id}>
                    {index > 0 && <Divider className={classes.sectionDivider} />}
                    <Title className={classes.sectionTitle} order={6}>
                        {item.header}
                    </Title>

                    <Stack gap={1}>
                        {item.section.map((subItem) =>
                            subItem.dropdownItems ? (
                                <NavLink
                                    active={false}
                                    childrenOffset={0}
                                    className={classes.sectionLink}
                                    defaultOpened={subItem.dropdownItems.some((dropdownItem) =>
                                        isCurrent(pathname, dropdownItem.href)
                                    )}
                                    key={subItem.id}
                                    label={subItem.name}
                                    leftSection={subItem.icon && <subItem.icon />}
                                    variant="light"
                                >
                                    {subItem.dropdownItems?.map((dropdownItem) => (
                                        <NavLink
                                            active={isCurrent(pathname, dropdownItem.href)}
                                            className={classes.sectionDropdownItemLink}
                                            component={RouterLink}
                                            key={dropdownItem.id}
                                            label={dropdownItem.name}
                                            leftSection={
                                                dropdownItem.icon ? (
                                                    <dropdownItem.icon />
                                                ) : (
                                                    <PiArrowRight />
                                                )
                                            }
                                            onClick={onClose}
                                            to={dropdownItem.href}
                                            variant="subtle"
                                        />
                                    ))}
                                </NavLink>
                            ) : (
                                <NavLink
                                    active={!subItem.newTab && isCurrent(pathname, subItem.href)}
                                    className={classes.sectionLink}
                                    component={RouterLink}
                                    key={subItem.id}
                                    label={subItem.name}
                                    leftSection={subItem.icon && <subItem.icon />}
                                    onClick={onClose}
                                    to={subItem.href}
                                    variant="subtle"
                                    {...(subItem.newTab
                                        ? { target: '_blank', rel: 'noopener noreferrer' }
                                        : {})}
                                />
                            )
                        )}
                    </Stack>
                </Box>
            ))}
        </Stack>
    )
}

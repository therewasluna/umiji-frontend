import { useMediaQuery } from '@mantine/hooks'
import { Navigate, useLocation } from 'react-router'

import { OPEN_ENTITY, ROUTES } from '@shared/constants'
import { useIsMobile } from '@shared/hooks'
import { HeaderControls } from '@shared/ui/header-buttons'
import { QuickLauncher } from '@shared/ui/quick-launcher'

import { useIsBroker } from '@entities/auth/session-store'
import { useIsLoadingUmijiUpdates, useUmijiInfo } from '@entities/dashboard/updates-store'
import { useExperimentalFeature } from '@entities/dashboard/view-preferences-store'

import { DASHBOARD_LINKS } from './layout-shared'
import { CompactLayout } from './layout-variants/compact.layout'
import { MobileLayout } from './layout-variants/mobile.layout'
import { SidebarLayout } from './layout-variants/sidebar.layout'
import { useQuickLauncherRoutes } from './menu-sections/use-quick-launcher-routes'

import '@shared/_modals/modal-registry'

const BROKER_PATHS: string[] = [
    ROUTES.DASHBOARD.MANAGEMENT.USERS,
    ROUTES.DASHBOARD.TOOLS.QUICK_OPEN,
    ...Object.values(ROUTES.DASHBOARD.BROKER)
]

const isBrokerPath = (pathname: string) =>
    BROKER_PATHS.includes(pathname) ||
    pathname.startsWith(
        ROUTES.DASHBOARD.OPEN_ENTITY.replace(':entity', OPEN_ENTITY.USER).replace(':id', '')
    )

export function MainLayout() {
    const isLegacyLayoutStyle = useExperimentalFeature('legacyLayoutStyle')

    const isMobile = useIsMobile()

    const isHiResDesktop = useMediaQuery(`(min-width: 2048px)`, undefined, {
        getInitialValueInEffect: false
    })

    const umijiInfo = useUmijiInfo()
    const isLoadingUpdates = useIsLoadingUmijiUpdates()
    const launcherRoutes = useQuickLauncherRoutes()
    const isBroker = useIsBroker()
    const location = useLocation()

    // Brokers stay inside their own pages; their pages call broker-only endpoints, so admins stay out.
    if (isBroker && !isBrokerPath(location.pathname)) {
        return <Navigate replace to={ROUTES.DASHBOARD.BROKER.OVERVIEW} />
    }

    if (!isBroker && location.pathname.startsWith(ROUTES.DASHBOARD.BROKER.ROOT)) {
        return <Navigate replace to={ROUTES.DASHBOARD.HOME} />
    }

    const headerControls = isBroker ? (
        <HeaderControls {...DASHBOARD_LINKS} withGithub={false} withVersion={false} />
    ) : (
        <HeaderControls
            {...DASHBOARD_LINKS}
            isGithubLoading={isLoadingUpdates}
            stars={umijiInfo.starsCount || undefined}
            withGithub={!isMobile}
            withRecap={!isMobile}
        />
    )

    if (isMobile) {
        return (
            <MobileLayout
                headerControls={headerControls}
                isSocialButtons={isMobile && !isBroker}
                isLoadingUpdates={isLoadingUpdates}
                umijiInfo={umijiInfo}
            />
        )
    }

    return (
        <>
            {isLegacyLayoutStyle ? (
                <SidebarLayout headerControls={headerControls} />
            ) : (
                <CompactLayout headerControls={headerControls} isHiResDesktop={isHiResDesktop} />
            )}
            {!isBroker && <QuickLauncher routes={launcherRoutes} />}
        </>
    )
}

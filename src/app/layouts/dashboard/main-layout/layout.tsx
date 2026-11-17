import { Navigate, useLocation } from 'react-router'

import { OPEN_ENTITY, ROUTES } from '@shared/constants'
import { useIsMobile } from '@shared/hooks'
import { HeaderControls } from '@shared/ui/header-buttons'

import { useIsBroker } from '@entities/auth/session-store'
import { useIsLoadingUmijiUpdates, useUmijiInfo } from '@entities/dashboard/updates-store'

import { DASHBOARD_LINKS } from './layout-shared'
import { MobileLayout } from './layout-variants/mobile.layout'
import { SidebarLayout } from './layout-variants/sidebar.layout'

import '@shared/_modals/modal-registry'
import '@shared/utils/setup-monaco/setup-monaco'

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
    const isMobile = useIsMobile()

    const umijiInfo = useUmijiInfo()
    const isLoadingUpdates = useIsLoadingUmijiUpdates()
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
            withTelegram={!isMobile}
        />
    )

    if (isMobile) {
        return (
            <MobileLayout
                headerControls={headerControls}
                isSocialButtons={!isBroker}
                isLoadingUpdates={isLoadingUpdates}
                umijiInfo={umijiInfo}
            />
        )
    }

    return <SidebarLayout headerControls={headerControls} />
}

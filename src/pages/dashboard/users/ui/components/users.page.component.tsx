import { Stack } from '@mantine/core'
import { BrokerAccountAlertsWidget } from '@widgets/dashboard/broker-panel/account-alerts'
import { UsersMetrics } from '@widgets/dashboard/users/users-metrics'
import { UserTableWidget } from '@widgets/dashboard/users/users-table'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingScreen, PageHeaderShared } from '@shared/ui'
import { Page } from '@shared/ui/page'

import { useIsBroker } from '@entities/auth/session-store'

const DeferredUserTableWidget = () => {
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShouldRender(true), 300)
        return () => clearTimeout(timer)
    }, [])

    if (!shouldRender) {
        return <LoadingScreen height="80vh" />
    }

    return (
        <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0, 0.71, 0.2, 1.01] }}
        >
            <UserTableWidget />
        </motion.div>
    )
}

export default function UsersPageComponent() {
    const { t } = useTranslation()
    const isBroker = useIsBroker()

    return (
        <Page title={t('constants.users')}>
            <PageHeaderShared
                description={t('page-descriptions.users')}
                title={t('constants.users')}
            />

            <Stack>
                {isBroker && <BrokerAccountAlertsWidget blockingOnly />}
                <UsersMetrics />

                <DeferredUserTableWidget />
            </Stack>
        </Page>
    )
}

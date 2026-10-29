import { BrokersHeaderActionButtonsFeature } from '@features/ui/dashboard/brokers/header-action-buttons'
import { GetBrokersCommand } from '@umiji/backend-contract'
import { BrokersListWidget } from '@widgets/dashboard/brokers/brokers-list/brokers-list.widget'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { PiHandshake } from 'react-icons/pi'

import { Page } from '@shared/ui/page'
import { PageHeaderShared } from '@shared/ui/page-header/page-header.shared'

interface IProps {
    brokers: GetBrokersCommand.Response['response']['brokers']
}

export const BrokersPageComponent = (props: IProps) => {
    const { t } = useTranslation()
    const { brokers } = props

    return (
        <Page title={t('constants.brokers')}>
            <PageHeaderShared
                actions={<BrokersHeaderActionButtonsFeature />}
                description={t('brokers.page-description')}
                icon={<PiHandshake size={24} />}
                title={t('constants.brokers')}
            />

            <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <BrokersListWidget brokers={brokers} />
            </motion.div>
        </Page>
    )
}

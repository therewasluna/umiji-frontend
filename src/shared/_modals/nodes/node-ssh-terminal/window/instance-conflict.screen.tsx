import { Center } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbBrowserX } from 'react-icons/tb'

import { EmptyPageLayout } from '@shared/ui/layouts/empty-page'

export const InstanceConflictScreen = () => {
    const { t } = useTranslation()
    return (
        <Center flex={1} p="md">
            <EmptyPageLayout
                icon={<TbBrowserX size={32} />}
                title={t('instance-conflict.already-open-in-another-tab')}
            />
        </Center>
    )
}

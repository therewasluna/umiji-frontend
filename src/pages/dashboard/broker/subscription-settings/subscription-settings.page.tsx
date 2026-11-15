import { SimpleGrid, Stack, Text } from '@mantine/core'
import { ClientOptionsCardWidget } from '@widgets/dashboard/broker-panel/subscription-settings/client-options-card.widget'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    PiArrowsDownUpDuotone,
    PiListBulletsDuotone,
    PiSlidersHorizontalDuotone
} from 'react-icons/pi'

import { ExternalSquadsCustomRemarksTabWidget } from '@shared/_modals/external-squads/external-squads-drawer/tabs/external-squads-custom-remarks.widget'
import { ExternalSquadsResponseHeadersTabWidget } from '@shared/_modals/external-squads/external-squads-drawer/tabs/external-squads-response-headers.widget'
import { useGetBrokerMe, useGetExternalSquad } from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { MetricCardShared } from '@shared/ui/metrics/metric-card'

const CLIENT_OPTIONS_COUNT = 3 // ExternalSquadSubscriptionSettingsSchema's fields

/** The parts of its own external squad a broker may change: client options, headers and remarks. */
export function BrokerSubscriptionSettingsPage() {
    const { t } = useTranslation()

    const { data: broker } = useGetBrokerMe()
    const squadUuid = broker?.externalSquad?.uuid

    const { data: externalSquad, isLoading } = useGetExternalSquad({
        route: { uuid: squadUuid ?? '' },
        rQueryParams: { enabled: !!squadUuid, staleTime: 0 }
    })

    // Each card reloads its draft whenever its squad prop changes, and every save replaces the
    // squad. Query data keeps unchanged parts as the same objects, so keying each card's copy
    // on its own fields stops one card's save from wiping another card's unsaved edits.
    const headersSquad = useMemo(
        () => externalSquad,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            externalSquad?.uuid,
            externalSquad?.responseHeadersAdd,
            externalSquad?.responseHeadersRemove
        ]
    )
    const remarksSquad = useMemo(
        () => externalSquad,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [externalSquad?.uuid, externalSquad?.customRemarks]
    )

    if (!broker || (squadUuid && (isLoading || !externalSquad))) return <LoadingScreen />

    const changedOptions = Object.keys(externalSquad?.subscriptionSettings ?? {}).length
    // LTR isolate: in Persian "0 / 3" would read as "3 / 0".
    const changedOptionsText = `\u2066${changedOptions} / ${CLIENT_OPTIONS_COUNT}\u2069`
    const added = Object.keys(externalSquad?.responseHeadersAdd ?? {}).length
    const removed = externalSquad?.responseHeadersRemove.length ?? 0

    return (
        <Page title={t('brokers.panel.subscription-settings')}>
            <PageHeaderShared
                description={t('brokers.panel.subscription-settings-description')}
                title={t('brokers.panel.subscription-settings')}
            />

            {!externalSquad ? (
                <Text c="dimmed" py="xl" ta="center">
                    {t('brokers.panel.no-external-squad')}
                </Text>
            ) : (
                <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                        <MetricCardShared
                            IconComponent={PiSlidersHorizontalDuotone}
                            iconColor="cyan"
                            iconVariant="soft"
                            title={t('brokers.panel.client-options-changed')}
                            value={changedOptionsText}
                        />
                        <MetricCardShared
                            IconComponent={PiArrowsDownUpDuotone}
                            iconColor="indigo"
                            iconVariant="soft"
                            subtitle={t('brokers.panel.headers-summary', { added, removed })}
                            title={t('brokers.panel.header-changes')}
                            value={added + removed}
                        />
                        <MetricCardShared
                            IconComponent={PiListBulletsDuotone}
                            iconColor="grape"
                            iconVariant="soft"
                            subtitle={t(
                                externalSquad.customRemarks
                                    ? 'brokers.panel.remarks-own'
                                    : 'brokers.panel.remarks-default'
                            )}
                            title={t('brokers.panel.remark-lines')}
                            value={Object.values(externalSquad.customRemarks ?? {}).flat().length}
                        />
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                        <Stack gap="md">
                            {/* Remount after a save, so the card starts from what is stored. */}
                            <ClientOptionsCardWidget
                                externalSquad={externalSquad}
                                key={JSON.stringify(externalSquad.subscriptionSettings)}
                            />
                            <ExternalSquadsCustomRemarksTabWidget
                                externalSquad={remarksSquad ?? externalSquad}
                            />
                        </Stack>
                        <ExternalSquadsResponseHeadersTabWidget
                            externalSquad={headersSquad ?? externalSquad}
                        />
                    </SimpleGrid>
                </Stack>
            )}
        </Page>
    )
}

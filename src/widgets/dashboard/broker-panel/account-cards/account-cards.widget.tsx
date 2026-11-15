import { Badge, Group, Progress } from '@mantine/core'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useGetBrokerMe } from '@shared/api/hooks'
import { StatStripShared } from '@shared/ui/stat-strip'
import {
    BROKER_STATE_COLOR,
    getBrokerStateUtil,
    getUsageColorUtil,
    getUsagePercentUtil
} from '@shared/utils/brokers'
import { prettifyBytesUtil } from '@shared/utils/bytes'
import { formatRelativeDateUtil, formatTimeUtil } from '@shared/utils/time-utils'

// The limit sits at the end of its bar, not beside the big number: a value that fills its cell can't
// wrap there and push this cell's bar out of line with the next cell's.
const LimitMeter = ({ limit, percent }: { limit: number | string; percent: number }) => (
    <Group gap={8} wrap="nowrap">
        <Progress
            color={getUsageColorUtil(percent)}
            flex={1}
            radius="xl"
            size="sm"
            value={percent}
        />
        <bdi style={{ whiteSpace: 'nowrap' }}>{limit}</bdi>
    </Group>
)

/** The broker's own limits: traffic quota, users, expiry and account state. */
export function BrokerAccountCardsWidget() {
    const { t, i18n } = useTranslation()

    const { data: broker, isLoading } = useGetBrokerMe()

    const used = broker?.usedTrafficBytes ?? 0
    const limit = broker?.trafficLimitBytes ?? 0
    const quotaPercent = getUsagePercentUtil(used, limit)

    const usersCount = broker?.usersCount ?? 0
    const usersLimit = broker?.usersLimit ?? null
    const usersPercent = usersLimit ? getUsagePercentUtil(usersCount, usersLimit) : 0

    const expireAt = broker?.expireAt ? dayjs(broker.expireAt) : null

    const state = broker ? getBrokerStateUtil(broker) : 'active'

    return (
        <StatStripShared
            cells={[
                {
                    label: t('brokers.traffic-quota'),
                    value: prettifyBytesUtil(used, true),
                    footer: limit ? (
                        <LimitMeter limit={prettifyBytesUtil(limit, true)} percent={quotaPercent} />
                    ) : (
                        t('brokers.unlimited')
                    )
                },
                {
                    label: t('brokers.users'),
                    value: usersCount,
                    footer: usersLimit ? (
                        <LimitMeter limit={usersLimit} percent={usersPercent} />
                    ) : (
                        t('brokers.unlimited')
                    )
                },
                {
                    label: t('brokers.account-expires'),
                    value: expireAt
                        ? formatTimeUtil({
                              time: expireAt.toDate(),
                              template: 'FULL_DATE',
                              language: i18n.language
                          })
                        : t('brokers.never-expires'),
                    footer: expireAt
                        ? formatRelativeDateUtil(expireAt.toDate(), t, i18n.language)
                        : t('brokers.no-expiry')
                },
                {
                    label: t('brokers.panel.account-status'),
                    value: (
                        <Badge color={BROKER_STATE_COLOR[state]} size="lg" variant="light">
                            {t(`brokers.status-${state}`)}
                        </Badge>
                    ),
                    footer: t(`brokers.panel.status-${state}-hint`)
                }
            ]}
            isLoading={isLoading}
            phoneLayout="stack"
        />
    )
}

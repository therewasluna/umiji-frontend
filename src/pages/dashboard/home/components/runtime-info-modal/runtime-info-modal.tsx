import { Code, SimpleGrid, Stack, Text } from '@mantine/core'
import { Trans, useTranslation } from 'react-i18next'
import {
    TbBolt,
    TbBraces,
    TbClock,
    TbCloud,
    TbCpu,
    TbGauge,
    TbPackage,
    TbPlug,
    TbServer,
    TbStack2,
    TbStack3,
    TbStopwatch
} from 'react-icons/tb'

import { MetricEntry } from './metric-entry'
import { ProcessCard } from './process-card'
import classes from './runtime-info-modal.module.css'
import { SectionShell } from './section-shell'

const TRANS_COMPONENTS = { highlight: <Code className={classes.highlight} /> }

export function RuntimeInfoModalContent() {
    const { t } = useTranslation()

    return (
        <Stack gap="lg">
            <Text c="dimmed" lh={1.6} size="sm">
                <Trans components={TRANS_COMPONENTS} i18nKey="home.runtime-info.intro" />
            </Text>

            <SectionShell
                description={t('home.runtime-info.instance-types-description')}
                Icon={TbCpu}
                title={t('home.runtime-info.instance-types-title')}
            >
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <ProcessCard
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.api-description"
                            />
                        }
                        Icon={TbCloud}
                        title="API"
                    />
                    <ProcessCard
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.scheduler-description"
                            />
                        }
                        Icon={TbClock}
                        title={t('runtime-info-modal.scheduler')}
                    />
                    <ProcessCard
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.processor-description"
                            />
                        }
                        Icon={TbStack2}
                        title={t('runtime-info-modal.processor')}
                    />
                </SimpleGrid>
            </SectionShell>

            <SectionShell
                description={t('home.runtime-info.memory-description')}
                Icon={TbServer}
                title={t('runtime-info-modal.memory')}
            >
                <Stack gap="md">
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.heap-description"
                            />
                        }
                        Icon={TbStack3}
                        title={t('runtime-info-modal.heap')}
                    />
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.rss-description"
                            />
                        }
                        Icon={TbServer}
                        title="RSS"
                    />
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.external-description"
                            />
                        }
                        Icon={TbPackage}
                        title={t('runtime-info-modal.external')}
                    />
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.array-buffers-description"
                            />
                        }
                        Icon={TbBraces}
                        title={t('runtime-info-modal.array-buffers')}
                    />
                </Stack>
            </SectionShell>

            <SectionShell
                description={t('home.runtime-info.event-loop-description')}
                Icon={TbBolt}
                title={t('runtime-info-modal.event-loop')}
            >
                <Stack gap="md">
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.delay-description"
                            />
                        }
                        Icon={TbStopwatch}
                        title={t('runtime-info-modal.delay')}
                    />
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.p99-description"
                            />
                        }
                        Icon={TbGauge}
                        title="P99"
                    />
                    <MetricEntry
                        description={
                            <Trans
                                components={TRANS_COMPONENTS}
                                i18nKey="home.runtime-info.active-handles-description"
                            />
                        }
                        Icon={TbPlug}
                        title={t('runtime-info-modal.active-handles')}
                    />
                </Stack>
            </SectionShell>
        </Stack>
    )
}

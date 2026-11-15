import {
    ActionIcon,
    Badge,
    Box,
    Button,
    CopyButton,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Tooltip
} from '@mantine/core'
import { GetMetadataCommand } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import {
    TbBrandGithub,
    TbCalendar,
    TbCheck,
    TbCopy,
    TbGitBranch,
    TbHash,
    TbServer,
    TbWorld
} from 'react-icons/tb'

import { formatTimeUtil } from '@shared/utils/time-utils'

import { CopyableCodeBlock } from '../copyable-code-block'
import { Logo } from '../logo'
import classes from './build-info-modal.module.css'

interface BuildInfoModalProps {
    isNewVersionAvailable: boolean
    umijiMetadata: GetMetadataCommand.Response['response']
}

export function BuildInfoModal({ umijiMetadata, isNewVersionAvailable }: BuildInfoModalProps) {
    const { t } = useTranslation()

    return (
        <Stack gap="md">
            {isNewVersionAvailable && (
                <Paper className={classes.updateCard} p="md" radius="md">
                    <Group align="center" gap="md" wrap="wrap">
                        <Group gap="sm" wrap="nowrap">
                            <Box className={classes.updateIconBox}>
                                <Logo color="var(--mantine-color-teal-4)" size={24} />
                            </Box>
                            <Stack className={classes.updateTextWrapper} gap={4}>
                                <Text c="teal.4" fw={600} size="sm">
                                    {t('build-info-modal.update-available')}
                                </Text>
                                <Text c="dimmed" size="xs">
                                    {t('build-info-modal.a-new-version-is-available')}
                                </Text>
                            </Stack>
                        </Group>

                        <Button
                            color="teal"
                            component="a"
                            href="https://github.com/therewasluna/umiji/releases"
                            leftSection={<TbBrandGithub size={14} />}
                            ml="auto"
                            radius="md"
                            size="xs"
                            target="_blank"
                            variant="light"
                        >
                            {t('build-info-modal.check-out')}
                        </Button>
                    </Group>
                </Paper>
            )}

            <Paper className={classes.mainCard} p="md">
                <Stack gap="md">
                    <Group justify="space-between">
                        <Group gap="sm">
                            <Badge
                                color="cyan"
                                leftSection={<Logo size={16} />}
                                size="lg"
                                variant="light"
                            >
                                {umijiMetadata.version}
                            </Badge>

                            <Badge
                                color={umijiMetadata.git.backend.branch === 'dev' ? 'red' : 'teal'}
                                leftSection={<TbGitBranch size={16} />}
                                size="lg"
                                variant="light"
                            >
                                {umijiMetadata.git.backend.branch}
                            </Badge>
                        </Group>
                        <CopyButton timeout={2000} value={JSON.stringify(umijiMetadata, null, 2)}>
                            {({ copied, copy }) => (
                                <Tooltip label={t('build-info-modal.copy-build-info')}>
                                    <ActionIcon
                                        color={copied ? 'teal' : 'gray'}
                                        onClick={copy}
                                        size="md"
                                        variant="subtle"
                                    >
                                        {copied ? <TbCheck size={14} /> : <TbCopy size={14} />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>
                    </Group>

                    <Divider className={classes.divider} />

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        <Paper className={classes.buildTimeCard} p="sm" radius="md">
                            <Group gap="xs" mb={6}>
                                <TbCalendar color="var(--mantine-color-dark-2)" size={14} />
                                <Text c="dimmed" fw={600} size="xs">
                                    {t('build-info-modal.build-time')}
                                </Text>
                            </Group>
                            <Text c="gray.3" ff="monospace" size="xs">
                                {formatTimeUtil({
                                    time: umijiMetadata.build.time,
                                    template: 'NUMERIC_DATETIME'
                                })}
                            </Text>
                        </Paper>

                        <Paper className={classes.buildNumberCard} p="sm" radius="md">
                            <Group gap="xs" mb={6}>
                                <TbHash color="var(--mantine-color-dark-2)" size={14} />
                                <Text c="dimmed" fw={600} size="xs">
                                    {t('build-info-modal.build')}
                                </Text>
                            </Group>
                            <Text c="gray.3" ff="monospace" size="xs">
                                {umijiMetadata.build.number}
                            </Text>
                        </Paper>
                    </SimpleGrid>
                </Stack>
            </Paper>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <Paper className={classes.backendCard} p="md" radius="md">
                    <Stack gap="sm">
                        <Group gap="xs" justify="space-between">
                            <Group gap="xs">
                                <TbServer color="var(--mantine-color-dark-2)" size={16} />
                                <Text c="gray.1" fw={600} size="sm">
                                    {t('build-info-modal.backend')}
                                </Text>
                            </Group>
                            <Tooltip label={t('build-info-modal.view-on-github')}>
                                <ActionIcon
                                    color="gray"
                                    component="a"
                                    href={umijiMetadata.git.backend.commitUrl}
                                    size="sm"
                                    target="_blank"
                                    variant="subtle"
                                >
                                    <TbBrandGithub size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>

                        <CopyableCodeBlock
                            size="small"
                            value={umijiMetadata.git.backend.commitSha}
                        />
                    </Stack>
                </Paper>

                <Paper className={classes.backendCard} p="md" radius="md">
                    <Stack gap="sm">
                        <Group gap="xs" justify="space-between">
                            <Group gap="xs">
                                <TbWorld color="var(--mantine-color-dark-2)" size={16} />
                                <Text c="gray.1" fw={600} size="sm">
                                    {t('build-info-modal.frontend')}
                                </Text>
                            </Group>
                            <Tooltip label={t('build-info-modal.view-on-github')}>
                                <ActionIcon
                                    color="gray"
                                    component="a"
                                    href={umijiMetadata.git.frontend.commitUrl}
                                    size="sm"
                                    target="_blank"
                                    variant="subtle"
                                >
                                    <TbBrandGithub size={14} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>

                        <CopyableCodeBlock
                            size="small"
                            value={umijiMetadata.git.frontend.commitSha}
                        />
                    </Stack>
                </Paper>
            </SimpleGrid>

            <Group gap="sm" grow>
                <Button
                    component="a"
                    href="https://github.com/therewasluna/umiji"
                    leftSection={<TbBrandGithub size={16} />}
                    radius="md"
                    size="sm"
                    target="_blank"
                    variant="default"
                >
                    GitHub
                </Button>
            </Group>
        </Stack>
    )
}

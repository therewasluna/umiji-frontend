import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Divider,
    Group,
    List,
    Modal,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    Tooltip
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { GetBrokerBotCommand } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbBulb,
    TbPackage,
    TbPencil,
    TbPlayerPause,
    TbPlayerPlay,
    TbPlus,
    TbTag,
    TbTrash
} from 'react-icons/tb'

import {
    useCreateBrokerBotCategory,
    useDeleteBrokerBotCategory,
    useDeleteBrokerBotPlan,
    useUpdateBrokerBotPlan
} from '@shared/api/hooks'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { formatTomanUtil } from '@shared/utils/brokers'

import { BotPlanModal } from './bot-plan-modal'

type TBot = GetBrokerBotCommand.Response['response']
type TPlan = TBot['plans'][number]

interface IProps {
    bot: TBot
    squads: { name: string; uuid: string }[]
}

export function BotPlansCardWidget({ bot, squads }: IProps) {
    const { t } = useTranslation()

    // undefined = closed, null = new plan
    const [editing, setEditing] = useState<null | TPlan | undefined>(undefined)
    const [isCategoryOpen, setCategoryOpen] = useState(false)

    const {
        mutate: updatePlan,
        isPending: isToggling,
        variables: toggled
    } = useUpdateBrokerBotPlan()
    const { mutate: deletePlan } = useDeleteBrokerBotPlan()
    const { mutate: deleteCategory } = useDeleteBrokerBotCategory()

    const categoryTitle = new Map(bot.categories.map((c) => [c.id, c.title]))
    const squadName = new Map(squads.map((s) => [s.uuid, s.name]))

    const confirm = (children: string, onConfirm: () => void) =>
        modals.openConfirmModal({
            title: t('common.action.confirm-action'),
            children,
            labels: { confirm: t('common.action.delete'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm
        })

    return (
        <SettingsCardShared.Container>
            <Box>
                <Group align="flex-start" justify="space-between">
                    <Group align="flex-start" gap="md" wrap="nowrap">
                        <ThemeIcon color="cyan" size="xl" variant="soft">
                            <TbPackage size={24} />
                        </ThemeIcon>
                        <Stack gap={0}>
                            <Title order={4}>{t('broker-bot.plans.title')}</Title>
                            <Text c="dimmed" size="sm">
                                {t('broker-bot.plans.description')}
                            </Text>
                        </Stack>
                    </Group>
                    <Button
                        leftSection={<TbPlus size={18} />}
                        onClick={() => setEditing(null)}
                        variant="soft"
                    >
                        {t('broker-bot.plans.add')}
                    </Button>
                </Group>
                <Divider my="md" style={{ opacity: 0.3 }} />
            </Box>

            <SettingsCardShared.Content>
                <Stack gap="md">
                    <Paper bg="dark.6" p="md" radius="md">
                        <Group gap="xs" mb="xs">
                            <ThemeIcon color="yellow" radius="xl" size="sm" variant="soft">
                                <TbBulb size={14} />
                            </ThemeIcon>
                            <Text fw={600} size="sm">
                                {t('broker-bot.plans.help-title')}
                            </Text>
                        </Group>
                        <List c="dimmed" size="sm" spacing={6}>
                            {(
                                [
                                    'broker-bot.plans.help-1',
                                    'broker-bot.plans.help-2',
                                    'broker-bot.plans.help-3',
                                    'broker-bot.plans.help-4',
                                    'broker-bot.plans.help-5'
                                ] as const
                            ).map((key) => (
                                <List.Item key={key}>{t(key)}</List.Item>
                            ))}
                        </List>
                    </Paper>

                    <Paper p="md" radius="md" withBorder>
                        <Group align="flex-start" justify="space-between">
                            <Stack gap={2}>
                                <Group gap="xs">
                                    <TbTag size={16} />
                                    <Title order={6}>{t('broker-bot.categories.title')}</Title>
                                    {bot.categories.length > 0 && (
                                        <Badge color="gray" size="sm" variant="soft">
                                            {bot.categories.length}
                                        </Badge>
                                    )}
                                </Group>
                                <Text c="dimmed" size="xs">
                                    {t('broker-bot.categories.hint')}
                                </Text>
                            </Stack>
                            <Button
                                leftSection={<TbPlus size={16} />}
                                onClick={() => setCategoryOpen(true)}
                                size="xs"
                                variant="default"
                            >
                                {t('broker-bot.categories.add')}
                            </Button>
                        </Group>

                        {bot.categories.length === 0 ? (
                            <Text c="dimmed" mt="sm" size="xs">
                                {t('broker-bot.categories.empty')}
                            </Text>
                        ) : (
                            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mt="sm" spacing="xs">
                                {bot.categories.map((category) => (
                                    <Paper key={category.id} px="sm" py="xs" radius="md" withBorder>
                                        <Group gap="sm" wrap="nowrap">
                                            <ThemeIcon color="cyan" radius="md" variant="soft">
                                                <TbTag size={16} />
                                            </ThemeIcon>
                                            <Text
                                                fw={500}
                                                size="sm"
                                                style={{ flex: 1 }}
                                                truncate="end"
                                            >
                                                {category.title}
                                            </Text>
                                            <Tooltip label={t('broker-bot.categories.delete')}>
                                                <ActionIcon
                                                    color="gray"
                                                    onClick={() =>
                                                        confirm(
                                                            t(
                                                                'broker-bot.categories.delete-confirm'
                                                            ),
                                                            () =>
                                                                deleteCategory({
                                                                    route: { id: category.id }
                                                                })
                                                        )
                                                    }
                                                    variant="subtle"
                                                >
                                                    <TbTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Paper>
                                ))}
                            </SimpleGrid>
                        )}
                    </Paper>

                    {bot.plans.length === 0 ? (
                        <Text c="dimmed" py="md" size="sm" ta="center">
                            {t('broker-bot.plans.empty')}
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {bot.plans.map((plan) => {
                                const squad = plan.squadUuid ? squadName.get(plan.squadUuid) : null
                                const category =
                                    plan.categoryId != null
                                        ? categoryTitle.get(plan.categoryId)
                                        : null
                                return (
                                    <Paper key={plan.id} p="sm" radius="md" withBorder>
                                        <Group justify="space-between" wrap="nowrap">
                                            <Stack gap={4} miw={0}>
                                                <Group gap="xs" wrap="nowrap">
                                                    <Text fw={600} size="sm" truncate="end">
                                                        {plan.title}
                                                    </Text>
                                                    {!plan.isActive && (
                                                        <Badge
                                                            color="gray"
                                                            size="sm"
                                                            variant="soft"
                                                        >
                                                            {t('broker-bot.plans.inactive')}
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Group gap={6}>
                                                    <Badge color="blue" variant="soft">
                                                        {plan.trafficGb > 0
                                                            ? t('broker-bot.plans.gb', {
                                                                  value: plan.trafficGb
                                                              })
                                                            : t('broker-bot.plans.unlimited')}
                                                    </Badge>
                                                    <Badge color="grape" variant="soft">
                                                        {t('broker-bot.plans.days', {
                                                            count: plan.durationDays
                                                        })}
                                                    </Badge>
                                                    <Badge color="teal" variant="soft">
                                                        {formatTomanUtil(plan.price, t)}
                                                    </Badge>
                                                    <Badge
                                                        color={squad ? 'gray' : 'red'}
                                                        variant="soft"
                                                    >
                                                        {squad ??
                                                            t('broker-bot.plans.squad-missing')}
                                                    </Badge>
                                                    {category && (
                                                        <Badge
                                                            color="cyan"
                                                            leftSection={<TbTag size={12} />}
                                                            variant="soft"
                                                        >
                                                            {category}
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </Stack>

                                            <Group gap={4} wrap="nowrap">
                                                <Tooltip label={t('common.action.edit')}>
                                                    <ActionIcon
                                                        onClick={() => setEditing(plan)}
                                                        size="lg"
                                                        variant="subtle"
                                                    >
                                                        <TbPencil size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip
                                                    label={
                                                        plan.isActive
                                                            ? t('broker-bot.plans.pause')
                                                            : t('broker-bot.plans.activate')
                                                    }
                                                >
                                                    <ActionIcon
                                                        color={plan.isActive ? 'orange' : 'teal'}
                                                        loading={
                                                            isToggling &&
                                                            toggled?.variables?.id === plan.id
                                                        }
                                                        onClick={() =>
                                                            updatePlan({
                                                                variables: {
                                                                    id: plan.id,
                                                                    isActive: !plan.isActive
                                                                }
                                                            })
                                                        }
                                                        size="lg"
                                                        variant="subtle"
                                                    >
                                                        {plan.isActive ? (
                                                            <TbPlayerPause size={18} />
                                                        ) : (
                                                            <TbPlayerPlay size={18} />
                                                        )}
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t('common.action.delete')}>
                                                    <ActionIcon
                                                        color="red"
                                                        onClick={() =>
                                                            confirm(
                                                                t(
                                                                    'broker-bot.plans.delete-confirm'
                                                                ),
                                                                () =>
                                                                    deletePlan({
                                                                        route: { id: plan.id }
                                                                    })
                                                            )
                                                        }
                                                        size="lg"
                                                        variant="subtle"
                                                    >
                                                        <TbTrash size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Group>
                                    </Paper>
                                )
                            })}
                        </Stack>
                    )}
                </Stack>
            </SettingsCardShared.Content>

            {editing !== undefined && (
                <BotPlanModal
                    bot={bot}
                    onClose={() => setEditing(undefined)}
                    opened
                    plan={editing}
                    squads={squads}
                />
            )}

            <CategoryModal onClose={() => setCategoryOpen(false)} opened={isCategoryOpen} />
        </SettingsCardShared.Container>
    )
}

function CategoryModal({ onClose, opened }: { onClose: () => void; opened: boolean }) {
    const { t } = useTranslation()

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: { title: '' },
        validate: {
            title: (v: string) => (v.trim() ? null : t('broker-bot.categories.placeholder'))
        }
    })

    const { mutate: createCategory, isPending } = useCreateBrokerBotCategory({
        mutationFns: {
            onSuccess: () => {
                form.reset()
                onClose()
            }
        }
    })

    return (
        <Modal
            centered
            onClose={onClose}
            opened={opened}
            title={
                <BaseOverlayHeader
                    IconComponent={TbTag}
                    iconVariant="soft"
                    title={t('broker-bot.categories.new')}
                />
            }
        >
            <form
                onSubmit={form.onSubmit((values) =>
                    createCategory({ variables: { title: values.title.trim() } })
                )}
            >
                <Stack gap="md">
                    <TextInput
                        data-autofocus
                        key={form.key('title')}
                        maxLength={40}
                        placeholder={t('broker-bot.categories.placeholder')}
                        {...form.getInputProps('title')}
                    />
                    <Button color="teal" fullWidth loading={isPending} type="submit" variant="soft">
                        {t('broker-bot.categories.add')}
                    </Button>
                </Stack>
            </form>
        </Modal>
    )
}

import {
    ActionIcon,
    Badge,
    Button,
    Group,
    List,
    Modal,
    Pill,
    Text,
    TextInput,
    Tooltip
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
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
    TbTag,
    TbTrash
} from 'react-icons/tb'

import {
    useCreateBrokerBotCategory,
    useDeleteBrokerBotCategory,
    useDeleteBrokerBotPlan,
    useUpdateBrokerBotPlan
} from '@shared/api/hooks'
import { ModalFooter } from '@shared/ui/modal-footer'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'
import {
    SettingsSection,
    SettingsSectionAddButton,
    SettingsSectionPanel,
    SettingsSectionToggle
} from '@shared/ui/settings-section'
import { formatTomanUtil } from '@shared/utils/brokers'

import classes from './bot-list-editor.module.css'
import { BotPlanModal } from './bot-plan-modal'

type TBot = GetBrokerBotCommand.Response['response']
type TPlan = TBot['plans'][number]

const HELP_KEYS = [
    'broker-bot.plans.help-1',
    'broker-bot.plans.help-2',
    'broker-bot.plans.help-3',
    'broker-bot.plans.help-4',
    'broker-bot.plans.help-5'
] as const

interface IProps {
    bot: TBot
    squads: { name: string; uuid: string }[]
}

export function BotPlansCardWidget({ bot, squads }: IProps) {
    const { t } = useTranslation()

    // undefined = closed, null = new plan
    const [editing, setEditing] = useState<null | TPlan | undefined>(undefined)
    const [isCategoryOpen, setCategoryOpen] = useState(false)
    // Open while it's needed: a broker with no plans yet sees how they work.
    const [isHelpOpen, { toggle: toggleHelp }] = useDisclosure(bot.plans.length === 0)

    const {
        mutate: updatePlan,
        isPending: isToggling,
        variables: toggled
    } = useUpdateBrokerBotPlan()
    const { mutate: deletePlan } = useDeleteBrokerBotPlan()
    const { mutate: deleteCategory } = useDeleteBrokerBotCategory()

    const categoryTitle = new Map(bot.categories.map((c) => [c.id, c.title]))
    const squadName = new Map(squads.map((s) => [s.uuid, s.name]))
    const activePlans = bot.plans.filter((plan) => plan.isActive).length

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
            <SettingsCardShared.Header
                actions={
                    // With nothing active the bot has nothing to sell, so this is real state.
                    activePlans > 0 ? (
                        <Badge color="teal" variant="soft">
                            {t('localization-block.active', { count: activePlans })}
                        </Badge>
                    ) : (
                        <Badge color="yellow" variant="soft">
                            {bot.plans.length > 0
                                ? t('broker-bot.plans.inactive')
                                : t('broker-bot.payments.not-set-up')}
                        </Badge>
                    )
                }
                description={t('broker-bot.plans.description')}
                title={t('broker-bot.plans.title')}
            />

            <SettingsCardShared.Content>
                <div>
                    <SettingsSection
                        action={
                            <SettingsSectionAddButton
                                label={t('broker-bot.plans.add')}
                                onClick={() => setEditing(null)}
                            />
                        }
                        count={bot.plans.length > 0 ? String(bot.plans.length) : undefined}
                        hint={bot.plans.length === 0 ? t('broker-bot.plans.empty') : undefined}
                        Icon={TbPackage}
                        isLit={bot.plans.length > 0}
                        title={t('broker-bot.plans.list')}
                    >
                        {bot.plans.length > 0 && (
                            <ul className={classes.items}>
                                {bot.plans.map((plan) => {
                                    const squadNames = plan.squadUuids.map((uuid) =>
                                        squadName.get(uuid)
                                    )
                                    // The bot won't sell a plan with any squad missing.
                                    const squad =
                                        squadNames.length > 0 && squadNames.every(Boolean)
                                            ? squadNames.join(', ')
                                            : null
                                    const category =
                                        plan.categoryId != null
                                            ? categoryTitle.get(plan.categoryId)
                                            : null
                                    // Price first: it's what a seller scans the list for.
                                    const details = [
                                        {
                                            className: classes.price,
                                            text: formatTomanUtil(plan.price, t)
                                        },
                                        {
                                            text:
                                                plan.trafficGb > 0
                                                    ? t('broker-bot.plans.gb', {
                                                          value: plan.trafficGb
                                                      })
                                                    : t('broker-bot.plans.unlimited')
                                        },
                                        {
                                            text: t('broker-bot.plans.days', {
                                                count: plan.durationDays
                                            })
                                        },
                                        ...(plan.ipLimit
                                            ? [
                                                  {
                                                      text: t('broker-bot.plans.devices', {
                                                          count: plan.ipLimit
                                                      })
                                                  }
                                              ]
                                            : []),
                                        squad
                                            ? { text: squad }
                                            : {
                                                  className: classes.danger,
                                                  text: t('broker-bot.plans.squad-missing')
                                              },
                                        ...(category ? [{ text: category }] : [])
                                    ]

                                    return (
                                        <li className={classes.plan} key={plan.id}>
                                            <Group className={classes.planTitle} gap="xs">
                                                <Text
                                                    c={plan.isActive ? undefined : 'dimmed'}
                                                    fw={600}
                                                    size="sm"
                                                >
                                                    {plan.title}
                                                </Text>
                                                {!plan.isActive && (
                                                    <Badge color="yellow" size="sm" variant="soft">
                                                        {t('broker-bot.plans.inactive')}
                                                    </Badge>
                                                )}
                                            </Group>

                                            <Text
                                                c="dimmed"
                                                className={classes.meta}
                                                component="div"
                                                size="xs"
                                            >
                                                <div className={classes.metaRow}>
                                                    {details.map(({ className, text }, index) => (
                                                        <span className={className} key={index}>
                                                            <bdi>{text}</bdi>
                                                        </span>
                                                    ))}
                                                </div>
                                            </Text>

                                            <div className={classes.actions}>
                                                <Tooltip label={t('common.action.edit')}>
                                                    <ActionIcon
                                                        aria-label={t('common.action.edit')}
                                                        color="gray"
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
                                                        aria-label={
                                                            plan.isActive
                                                                ? t('broker-bot.plans.pause')
                                                                : t('broker-bot.plans.activate')
                                                        }
                                                        color="gray"
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
                                                        aria-label={t('common.action.delete')}
                                                        className={classes.remove}
                                                        color="gray"
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
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </SettingsSection>

                    <SettingsSection
                        action={
                            <SettingsSectionAddButton
                                label={t('broker-bot.categories.add')}
                                onClick={() => setCategoryOpen(true)}
                            />
                        }
                        count={
                            bot.categories.length > 0 ? String(bot.categories.length) : undefined
                        }
                        hint={
                            <>
                                {t('broker-bot.categories.hint')}
                                {bot.categories.length === 0 && (
                                    <>
                                        <br />
                                        {t('broker-bot.categories.empty')}
                                    </>
                                )}
                            </>
                        }
                        Icon={TbTag}
                        isLit={bot.categories.length > 0}
                        title={t('broker-bot.categories.title')}
                    >
                        {bot.categories.length > 0 && (
                            <div className={classes.chips}>
                                {bot.categories.map((category) => (
                                    <Pill
                                        className={classes.chip}
                                        key={category.id}
                                        onRemove={() =>
                                            confirm(t('broker-bot.categories.delete-confirm'), () =>
                                                deleteCategory({ route: { id: category.id } })
                                            )
                                        }
                                        // Mantine hides this button from keyboards and screen readers by default.
                                        removeButtonProps={{
                                            'aria-hidden': false,
                                            'aria-label': t('broker-bot.categories.delete'),
                                            tabIndex: 0
                                        }}
                                        size="md"
                                        withRemoveButton
                                    >
                                        {category.title}
                                    </Pill>
                                ))}
                            </div>
                        )}
                    </SettingsSection>

                    <SettingsSection
                        action={
                            <SettingsSectionToggle
                                label={t('broker-bot.plans.help-title')}
                                onClick={toggleHelp}
                                opened={isHelpOpen}
                            />
                        }
                        Icon={TbBulb}
                        onHeadClick={toggleHelp}
                        title={t('broker-bot.plans.help-title')}
                    >
                        <SettingsSectionPanel opened={isHelpOpen}>
                            <List c="dimmed" size="sm" spacing={6}>
                                {HELP_KEYS.map((key) => (
                                    <List.Item key={key}>{t(key)}</List.Item>
                                ))}
                            </List>
                        </SettingsSectionPanel>
                    </SettingsSection>
                </div>
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

    const handleClose = () => {
        form.reset()
        onClose()
    }

    const { mutate: createCategory, isPending } = useCreateBrokerBotCategory({
        mutationFns: { onSuccess: handleClose }
    })

    return (
        <Modal
            centered
            onClose={handleClose}
            opened={opened}
            title={
                <BaseOverlayHeader IconComponent={TbTag} title={t('broker-bot.categories.new')} />
            }
        >
            <form
                onSubmit={form.onSubmit((values) =>
                    createCategory({ variables: { title: values.title.trim() } })
                )}
            >
                <TextInput
                    data-autofocus
                    key={form.key('title')}
                    maxLength={40}
                    placeholder={t('broker-bot.categories.placeholder')}
                    {...form.getInputProps('title')}
                />

                <ModalFooter>
                    <Button color="gray" onClick={handleClose} variant="soft">
                        {t('common.action.cancel')}
                    </Button>
                    <Button color="teal" loading={isPending} type="submit" variant="soft">
                        {t('common.action.save')}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    )
}

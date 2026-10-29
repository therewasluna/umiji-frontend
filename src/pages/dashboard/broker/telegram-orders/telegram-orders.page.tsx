import {
    Alert,
    Badge,
    Button,
    Card,
    Code,
    Group,
    Image,
    Pagination,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetBrokerBotOrdersCommand } from '@umiji/backend-contract'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCheck, TbInfoCircle, TbReceipt, TbX } from 'react-icons/tb'

import {
    useDecideBrokerBotOrder,
    useGetBrokerBot,
    useGetBrokerBotOrders,
    useGetBrokerBotReceipt
} from '@shared/api/hooks'
import { LoadingScreen, Page, PageHeaderShared } from '@shared/ui'
import { formatTomanUtil } from '@shared/utils/brokers'

type TOrder = GetBrokerBotOrdersCommand.Response['response']['orders'][number]

const PAGE_SIZE = 20

const STATUS_COLOR: Record<TOrder['status'], string> = {
    approved: 'teal',
    pending: 'yellow',
    rejected: 'red'
}

const customerName = (o: TOrder) =>
    o.customer.name || (o.customer.username ? `@${o.customer.username}` : o.customer.tgUserId)

const formatDate = (date: Date) => dayjs(date).format('DD.MM.YYYY HH:mm')

function ReceiptPhoto({ id }: { id: number }) {
    const { t } = useTranslation()
    const { data, isError } = useGetBrokerBotReceipt({ route: { id } })

    if (isError) {
        return (
            <Text c="dimmed" size="sm">
                {t('broker-bot.orders.receipt-unavailable')}
            </Text>
        )
    }
    if (!data) return <Paper h={200} radius="md" withBorder />
    return (
        <Image
            alt={t('telegram-orders.receipt')}
            fit="contain"
            mah={360}
            radius="md"
            src={`data:${data.mimeType};base64,${data.base64}`}
            w="auto"
        />
    )
}

function PendingReceipt({ order }: { order: TOrder }) {
    const { t } = useTranslation()
    const { mutate: decide, isPending, variables } = useDecideBrokerBotOrder()

    const approve = () =>
        modals.openConfirmModal({
            title: t('broker-bot.orders.approve'),
            children: t('broker-bot.orders.approve-confirm', {
                amount: formatTomanUtil(order.amount, t)
            }),
            labels: { confirm: t('broker-bot.orders.approve'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'teal', variant: 'soft' },
            centered: true,
            onConfirm: () => decide({ route: { id: order.id }, variables: { decision: 'approve' } })
        })

    const reject = () => {
        let reason = ''
        modals.openConfirmModal({
            title: t('broker-bot.orders.reject'),
            children: (
                <Stack gap="sm">
                    <Text size="sm">{t('broker-bot.orders.reject-confirm')}</Text>
                    <Textarea
                        autosize
                        description={t('broker-bot.orders.reject-reason-hint')}
                        label={t('broker-bot.orders.reject-reason')}
                        maxLength={500}
                        minRows={2}
                        onChange={(e) => {
                            reason = e.currentTarget.value
                        }}
                    />
                </Stack>
            ),
            labels: { confirm: t('broker-bot.orders.reject'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm: () =>
                decide({
                    route: { id: order.id },
                    variables: { decision: 'reject', reason: reason.trim() || undefined }
                })
        })
    }

    return (
        <Card p="md" radius="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                    <Stack gap={0} miw={0}>
                        <Text fw={600} truncate="end">
                            {customerName(order)}
                        </Text>
                        <Text c="dimmed" size="xs">
                            #{order.id} · id {order.customer.tgUserId} ·{' '}
                            {formatDate(order.createdAt)}
                        </Text>
                    </Stack>
                    <Badge color="teal" size="lg" variant="soft">
                        {formatTomanUtil(order.amount, t)}
                    </Badge>
                </Group>

                {order.receiptKind === 'photo' && <ReceiptPhoto id={order.id} />}
                {order.receiptKind === 'text' && order.receiptText && (
                    <Code block>{order.receiptText}</Code>
                )}
                {!order.receiptKind && (
                    <Text c="dimmed" size="sm">
                        {t('broker-bot.orders.receipt-in-telegram')}
                    </Text>
                )}

                <Group gap="xs" grow>
                    <Button
                        color="teal"
                        leftSection={<TbCheck size={18} />}
                        loading={isPending && variables?.variables?.decision === 'approve'}
                        onClick={approve}
                        variant="soft"
                    >
                        {t('broker-bot.orders.approve')}
                    </Button>
                    <Button
                        color="red"
                        leftSection={<TbX size={18} />}
                        loading={isPending && variables?.variables?.decision === 'reject'}
                        onClick={reject}
                        variant="soft"
                    >
                        {t('broker-bot.orders.reject')}
                    </Button>
                </Group>
            </Stack>
        </Card>
    )
}

export function BrokerTelegramOrdersPage() {
    const { t } = useTranslation()
    const [page, setPage] = useState(1)

    const { data: bot } = useGetBrokerBot()
    const { data } = useGetBrokerBotOrders({
        query: { start: (page - 1) * PAGE_SIZE, size: PAGE_SIZE }
    })

    if (!data || !bot) return <LoadingScreen />

    const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

    return (
        <Page title={t('broker-bot.orders.title')}>
            <PageHeaderShared
                description={t('broker-bot.orders.description')}
                icon={<TbReceipt size={24} />}
                title={t('broker-bot.orders.title')}
            />

            <Stack gap="lg">
                <Stack gap="xs">
                    <Group gap="xs">
                        <Title c="dimmed" order={4}>
                            {t('broker-bot.orders.pending')}
                        </Title>
                        {data.pending.length > 0 && (
                            <Badge color="orange" variant="soft">
                                {data.pending.length}
                            </Badge>
                        )}
                    </Group>

                    {!bot.isConnected && data.pending.length > 0 && (
                        <Alert color="orange" icon={<TbInfoCircle />} variant="light">
                            {t('broker-bot.orders.connect-first')}
                        </Alert>
                    )}

                    {data.pending.length === 0 ? (
                        <Card p="lg" radius="md" withBorder>
                            <Text c="dimmed" size="sm" ta="center">
                                {t('broker-bot.orders.no-pending')}
                            </Text>
                        </Card>
                    ) : (
                        <SimpleGrid
                            cols={{ base: 1, md: 2, xl: 3 }}
                            spacing="sm"
                            style={{ alignItems: 'start' }}
                        >
                            {data.pending.map((order) => (
                                <PendingReceipt key={order.id} order={order} />
                            ))}
                        </SimpleGrid>
                    )}
                </Stack>

                <Stack gap="xs">
                    <Title c="dimmed" order={4}>
                        {t('broker-bot.orders.history')}
                    </Title>

                    {data.orders.length === 0 ? (
                        <Card p="lg" radius="md" withBorder>
                            <Text c="dimmed" size="sm" ta="center">
                                {t('broker-bot.orders.no-orders')}
                            </Text>
                        </Card>
                    ) : (
                        <Stack gap="xs">
                            {data.orders.map((order) => (
                                <Paper key={order.id} p="sm" radius="md" withBorder>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Stack gap={2} miw={0}>
                                            <Text fw={600} size="sm" truncate="end">
                                                {customerName(order)}
                                            </Text>
                                            <Text c="dimmed" size="xs">
                                                {order.kind === 'topup'
                                                    ? `${t('broker-bot.orders.topup')} · ${formatTomanUtil(order.amount, t)}`
                                                    : `${order.planTitle ?? '—'} · ${formatTomanUtil(order.amount, t)}`}{' '}
                                                · {formatDate(order.createdAt)}
                                            </Text>
                                            {order.status === 'rejected' && order.rejectReason && (
                                                <Text c="dimmed" fs="italic" size="xs">
                                                    “{order.rejectReason}”
                                                </Text>
                                            )}
                                        </Stack>
                                        <Badge color={STATUS_COLOR[order.status]} variant="soft">
                                            {t(`broker-bot.orders.status-${order.status}`)}
                                        </Badge>
                                    </Group>
                                </Paper>
                            ))}

                            {totalPages > 1 && (
                                <Group justify="center" mt="xs">
                                    <Pagination
                                        onChange={setPage}
                                        total={totalPages}
                                        value={page}
                                    />
                                </Group>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Page>
    )
}

import { ActionIcon, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { useTranslation } from 'react-i18next'
import { TbPlus, TbTrash } from 'react-icons/tb'
import { z } from 'zod'

interface IField<T> {
    key: keyof T & string
    label: string
    mono?: boolean
}

interface IProps<T extends Record<string, string>> {
    addLabel: string
    emptyLabel: string
    fields: IField<T>[]
    isPending: boolean
    items: T[]
    /** The contract's limit for this list. */
    max: number
    onChange: (items: T[]) => Promise<unknown>
    schema: z.ZodType<T>
}

/** A short list of text records (cards, wallets, channels) with an add row; saved as a whole. */
export function BotListEditor<T extends Record<string, string>>(props: IProps<T>) {
    const { addLabel, emptyLabel, fields, isPending, items, max, onChange, schema } = props
    const { t } = useTranslation()

    const form = useForm<T>({
        mode: 'uncontrolled',
        initialValues: Object.fromEntries(fields.map((f) => [f.key, ''])) as T,
        validate: schemaResolver(schema)
    })

    const handleAdd = form.onSubmit(async (values) => {
        try {
            await onChange([...items, schema.parse(values)])
            form.reset()
        } catch {
            // The save failed (the hook shows why): keep what was typed.
        }
    })

    const confirmRemove = (index: number) =>
        modals.openConfirmModal({
            title: t('common.action.confirm-action'),
            children: t('broker-bot.payments.delete-confirm', {
                value: fields.map((f) => items[index][f.key]).join(' · ')
            }),
            labels: { confirm: t('common.action.delete'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm: () => onChange(items.filter((_, i) => i !== index)).catch(() => {})
        })

    return (
        <Stack gap="xs">
            {items.length === 0 ? (
                <Text c="dimmed" size="sm">
                    {emptyLabel}
                </Text>
            ) : (
                items.map((item, index) => (
                    <Paper key={index} p="sm" radius="md" withBorder>
                        <Group justify="space-between" wrap="nowrap">
                            <Stack gap={2} miw={0}>
                                {fields.map((f, i) => (
                                    <Text
                                        c={i === 0 ? undefined : 'dimmed'}
                                        ff={f.mono ? 'monospace' : undefined}
                                        fw={i === 0 ? 600 : undefined}
                                        key={f.key}
                                        size={i === 0 ? 'sm' : 'xs'}
                                        truncate="end"
                                    >
                                        {f.mono ? (
                                            <span dir="ltr">{item[f.key]}</span>
                                        ) : (
                                            item[f.key]
                                        )}
                                    </Text>
                                ))}
                            </Stack>
                            <ActionIcon
                                aria-label={t('common.action.delete')}
                                color="red"
                                loading={isPending}
                                onClick={() => confirmRemove(index)}
                                variant="subtle"
                            >
                                <TbTrash size={18} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))
            )}

            <form onSubmit={handleAdd}>
                <Group align="flex-start" gap="xs" grow preventGrowOverflow={false} wrap="wrap">
                    {fields.map((f) => (
                        <TextInput
                            dir={f.mono ? 'ltr' : undefined}
                            key={form.key(f.key)}
                            miw={160}
                            placeholder={f.label}
                            {...form.getInputProps(f.key)}
                        />
                    ))}
                    <Button
                        disabled={items.length >= max}
                        leftSection={<TbPlus size={16} />}
                        loading={isPending}
                        maw="fit-content"
                        type="submit"
                        variant="soft"
                    >
                        {addLabel}
                    </Button>
                </Group>
            </form>
        </Stack>
    )
}

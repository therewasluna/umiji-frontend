import { ActionIcon, Autocomplete, Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { TbTrash } from 'react-icons/tb'
import { z } from 'zod'

import { ModalFooter } from '@shared/ui/modal-footer'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsSection, SettingsSectionAddButton } from '@shared/ui/settings-section'

import classes from './bot-list-editor.module.css'

interface IField<T> {
    /** How the saved value reads in the list; what's stored stays as typed. */
    format?: (value: string) => string
    /** Shown when a filled-in value is rejected; the contract's own messages are English only. */
    invalid?: string
    key: keyof T & string
    label: string
    /** Reads left to right even in Persian, without being monospace. */
    ltr?: boolean
    /** A technical value: monospace, left to right, and its digits stay Latin. */
    mono?: boolean
    /** Offered as you type; any other value is still allowed. */
    suggestions?: string[]
}

interface IProps<T extends Record<string, string>> {
    /** The dialog's title and the Add button's accessible name. */
    addLabel: string
    emptyLabel: string
    fields: IField<T>[]
    Icon: IconType
    isPending: boolean
    items: T[]
    /** The contract's limit for this list. */
    max: number
    onChange: (items: T[]) => Promise<unknown>
    schema: z.ZodType<T>
    title: string
}

/** A short list of text records (cards, wallets, other methods, channels); new ones go through a dialog; saved as a whole. */
export function BotListEditor<T extends Record<string, string>>(props: IProps<T>) {
    const { addLabel, emptyLabel, fields, Icon, isPending, items, max, onChange, schema, title } =
        props
    const { t } = useTranslation()
    const [dialogOpened, { close, open }] = useDisclosure(false)

    const form = useForm<T>({
        mode: 'uncontrolled',
        initialValues: Object.fromEntries(fields.map((f) => [f.key, ''])) as T,
        // The schema decides what's valid; the words shown come from the panel's language.
        validate: (values) =>
            Object.fromEntries(
                Object.keys(schemaResolver(schema, { sync: true })(values)).map((key) => [
                    key,
                    values[key].trim()
                        ? (fields.find((f) => f.key === key)?.invalid ??
                          t('broker-bot.field-invalid'))
                        : t('broker-bot.field-required')
                ])
            )
    })

    const closeDialog = () => {
        close()
        form.reset()
    }

    const handleAdd = form.onSubmit(async (values) => {
        try {
            await onChange([...items, schema.parse(values)])
            closeDialog()
        } catch {
            // The save failed (the hook shows why): stay open and keep what was typed.
        }
    })

    const confirmRemove = (index: number) =>
        modals.openConfirmModal({
            title: t('common.action.confirm-action'),
            children: t('broker-bot.payments.delete-confirm', {
                value: fields
                    .map((f) => items[index][f.key])
                    .filter(Boolean)
                    .join(' · ')
            }),
            labels: { confirm: t('common.action.delete'), cancel: t('common.action.cancel') },
            cancelProps: { variant: 'subtle' },
            confirmProps: { color: 'red', variant: 'soft' },
            centered: true,
            onConfirm: () => onChange(items.filter((_, i) => i !== index)).catch(() => {})
        })

    return (
        <SettingsSection
            action={
                <SettingsSectionAddButton
                    disabled={items.length >= max}
                    label={addLabel}
                    onClick={open}
                />
            }
            count={items.length > 0 ? `${items.length} / ${max}` : undefined}
            hint={items.length === 0 ? emptyLabel : undefined}
            Icon={Icon}
            isLit={items.length > 0}
            title={title}
        >
            {items.length > 0 && (
                <ul className={classes.items}>
                    {items.map((item, index) => (
                        <li className={classes.item} key={index}>
                            <div className={classes.itemText}>
                                {/* Optional fields may be empty: skip them, not a blank line. */}
                                {fields
                                    .filter((f) => item[f.key])
                                    .map((f, i) => {
                                        const value = f.format?.(item[f.key]) ?? item[f.key]

                                        return (
                                            <Text
                                                c={i === 0 ? undefined : 'dimmed'}
                                                ff={f.mono ? 'monospace' : undefined}
                                                fw={i === 0 ? 600 : undefined}
                                                key={f.key}
                                                size={i === 0 ? 'sm' : 'xs'}
                                            >
                                                {f.mono || f.ltr ? (
                                                    <span dir="ltr">{value}</span>
                                                ) : (
                                                    value
                                                )}
                                            </Text>
                                        )
                                    })}
                            </div>
                            <ActionIcon
                                aria-label={t('common.action.delete')}
                                className={classes.remove}
                                color="gray"
                                disabled={isPending}
                                onClick={() => confirmRemove(index)}
                                variant="subtle"
                            >
                                <TbTrash size={18} />
                            </ActionIcon>
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                centered
                onClose={closeDialog}
                opened={dialogOpened}
                title={<BaseOverlayHeader IconComponent={Icon} title={addLabel} />}
            >
                <form onSubmit={handleAdd}>
                    <Stack gap="md">
                        {fields.map((f, index) =>
                            f.suggestions ? (
                                <Autocomplete
                                    data={f.suggestions}
                                    data-autofocus={index === 0 || undefined}
                                    key={form.key(f.key)}
                                    label={f.label}
                                    openOnFocus={false}
                                    {...form.getInputProps(f.key)}
                                />
                            ) : (
                                <TextInput
                                    data-autofocus={index === 0 || undefined}
                                    dir={f.mono || f.ltr ? 'ltr' : undefined}
                                    key={form.key(f.key)}
                                    label={f.label}
                                    {...form.getInputProps(f.key)}
                                />
                            )
                        )}
                    </Stack>

                    <ModalFooter>
                        <Button color="gray" onClick={closeDialog} variant="soft">
                            {t('common.action.cancel')}
                        </Button>
                        <Button color="teal" loading={isPending} type="submit" variant="soft">
                            {t('common.action.save')}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </SettingsSection>
    )
}

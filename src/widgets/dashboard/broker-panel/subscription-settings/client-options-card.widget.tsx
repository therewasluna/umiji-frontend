import { Button, Flex, Group, Paper, SegmentedControl, Stack, Text, ThemeIcon } from '@mantine/core'
import { GetExternalSquadByUuidCommand } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiBracketsCurlyDuotone, PiChatTextDuotone, PiShuffleDuotone } from 'react-icons/pi'
import { TbDeviceFloppy } from 'react-icons/tb'

import { queryClient } from '@shared/api'
import { QueryKeys, useUpdateExternalSquad } from '@shared/api/hooks'
import { SettingsCardShared } from '@shared/ui/settings-card'

type TExternalSquad = GetExternalSquadByUuidCommand.Response['response']
type TOptions = NonNullable<TExternalSquad['subscriptionSettings']>

interface IProps {
    externalSquad: TExternalSquad
}

const OPTIONS = [
    {
        key: 'serveJsonAtBaseSubscription',
        Icon: PiBracketsCurlyDuotone,
        color: 'cyan',
        label: 'subscription-settings.widget.serve-json-at-base-subscription',
        description: 'subscription-settings.widget.serve-json-description'
    },
    {
        key: 'randomizeHosts',
        Icon: PiShuffleDuotone,
        color: 'violet',
        label: 'subscription-tabs.widget.randomize-hosts',
        description: 'subscription-tabs.widget.randomize-hosts-description'
    },
    {
        key: 'isShowCustomRemarks',
        Icon: PiChatTextDuotone,
        color: 'grape',
        label: 'subscription-tabs.widget.show-custom-remarks',
        description: 'subscription-tabs.widget.show-custom-remark-description-line-2'
    }
] as const

const CHOICE_COLOR = { default: 'gray', on: 'teal', off: 'red' } as const

/** The subscription switches a broker may set. One left on Default follows the panel's setting. */
export function ClientOptionsCardWidget({ externalSquad }: IProps) {
    const { t } = useTranslation()

    const saved = externalSquad.subscriptionSettings ?? {}
    const [options, setOptions] = useState<TOptions>(saved)

    const { mutate: updateExternalSquad, isPending } = useUpdateExternalSquad({
        mutationFns: {
            onSuccess: (data) => {
                if (data) {
                    queryClient.setQueryData(
                        QueryKeys.externalSquads.getExternalSquad({ uuid: data.uuid }).queryKey,
                        data
                    )
                }
            }
        }
    })

    const choiceOf = (key: keyof TOptions) => {
        if (options[key] === undefined) return 'default'
        return options[key] ? 'on' : 'off'
    }

    const setChoice = (key: keyof TOptions, choice: string) =>
        setOptions((prev) => {
            const next = { ...prev }
            if (choice === 'default') delete next[key]
            else next[key] = choice === 'on'
            return next
        })

    const isDirty = OPTIONS.some(({ key }) => options[key] !== saved[key])

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('brokers.panel.client-options-description')}
                title={t('brokers.panel.client-options')}
            />

            <SettingsCardShared.Content>
                <Stack gap="sm">
                    {OPTIONS.map(({ key, Icon, color, label, description }) => {
                        const choice = choiceOf(key)
                        return (
                            <Paper key={key} p="sm" radius="md" withBorder>
                                <Flex
                                    align={{ base: 'stretch', sm: 'center' }}
                                    direction={{ base: 'column', sm: 'row' }}
                                    gap="sm"
                                >
                                    <Group align="flex-start" flex={1} gap="sm" wrap="nowrap">
                                        <ThemeIcon color={color} size="lg" variant="soft">
                                            <Icon size={20} />
                                        </ThemeIcon>
                                        <Stack gap={2}>
                                            <Text fw={600} size="sm">
                                                {t(label)}
                                            </Text>
                                            <Text c="dimmed" size="xs">
                                                {t(description)}
                                            </Text>
                                        </Stack>
                                    </Group>
                                    <SegmentedControl
                                        color={CHOICE_COLOR[choice]}
                                        data={[
                                            {
                                                label: t('brokers.panel.option-default'),
                                                value: 'default'
                                            },
                                            { label: t('brokers.panel.option-on'), value: 'on' },
                                            { label: t('brokers.panel.option-off'), value: 'off' }
                                        ]}
                                        onChange={(value) => setChoice(key, value)}
                                        size="xs"
                                        value={choice}
                                    />
                                </Flex>
                            </Paper>
                        )
                    })}
                </Stack>
            </SettingsCardShared.Content>

            <SettingsCardShared.Bottom>
                <Group justify="flex-end">
                    <Button
                        color="teal"
                        disabled={!isDirty}
                        leftSection={<TbDeviceFloppy size={18} />}
                        loading={isPending}
                        onClick={() =>
                            updateExternalSquad({
                                variables: {
                                    subscriptionSettings: options,
                                    uuid: externalSquad.uuid
                                }
                            })
                        }
                        variant="soft"
                    >
                        {t('common.action.save')}
                    </Button>
                </Group>
            </SettingsCardShared.Bottom>
        </SettingsCardShared.Container>
    )
}

import type { IProps } from './interfaces/props.interface'

import { ActionIcon, Badge, Checkbox, Group, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetConfigProfilesCommand } from '@umiji/backend-contract'
import { JsonEditor } from 'json-edit-react'
import { useTranslation } from 'react-i18next'
import { TbCode } from 'react-icons/tb'

import { JSON_VIEWER_THEME } from '@shared/constants/theme/json-viewer-theme'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

import classes from './InboundCheckboxCard.module.css'

export const InboundCheckboxCardShared = (props: IProps) => {
    const { inbound, isSelected, onInboundToggle } = props

    const { t } = useTranslation()

    const handleShowInboundJson = (
        inbound: GetConfigProfilesCommand.Response['response']['configProfiles'][number]['inbounds'][number]
    ) => {
        modals.open({
            children: (
                <JsonEditor
                    collapse={3}
                    data={inbound.rawInbound!}
                    indent={4}
                    maxWidth="100%"
                    rootName=""
                    theme={JSON_VIEWER_THEME}
                    viewOnly
                />
            ),
            title: (
                <BaseOverlayHeader
                    IconComponent={TbCode}
                    title={t('flat-inbound-checkbox-card.shared.inbound-config-inbound-tag', {
                        inboundTag: inbound.tag
                    })}
                />
            ),

            size: 'xl'
        })
    }

    return (
        <Checkbox.Card
            checked={isSelected}
            className={classes.compactRoot}
            key={inbound.uuid}
            onClick={() => onInboundToggle(inbound)}
            radius="md"
            value={inbound.uuid}
        >
            <Group align="center" gap="xs" justify="space-between" wrap="nowrap">
                <Group align="center" gap="xs" style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
                    <Checkbox.Indicator size="sm" />
                    <Text className={classes.compactLabel} size="sm" truncate>
                        {inbound.tag}
                    </Text>
                </Group>

                <Group gap="xs" wrap="nowrap">
                    <Badge color="gray" size="xs" variant="soft">
                        {inbound.type}
                    </Badge>
                    {inbound.port && (
                        <Text c="dimmed" ff="monospace" size="xs">
                            {inbound.port}
                        </Text>
                    )}

                    <ActionIcon
                        component="a"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            e.nativeEvent.stopImmediatePropagation()

                            handleShowInboundJson(inbound)
                        }}
                        color="gray"
                        variant="subtle"
                    >
                        <TbCode size={16} />
                    </ActionIcon>
                </Group>
            </Group>
        </Checkbox.Card>
    )
}

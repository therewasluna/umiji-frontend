import {
    Accordion,
    AccordionControlProps,
    ActionIcon,
    ActionIconGroup,
    Box,
    Center,
    Group
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetConfigProfilesCommand } from '@umiji/backend-contract'
import { JsonEditor } from 'json-edit-react'
import { PiCheckBold, PiXBold } from 'react-icons/pi'

import { JSON_VIEWER_THEME } from '@shared/constants/theme/json-viewer-theme'
import { XrayLogo } from '@shared/ui/logos'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

interface IProps extends AccordionControlProps {
    hideSelectActions?: boolean
    onSelectAllInbounds: (profileUuid: string) => void

    onUnselectAllInbounds: (profileUuid: string) => void
    profile: GetConfigProfilesCommand.Response['response']['configProfiles'][number]
}

export const AccordionControlShared = (props: IProps) => {
    const { profile, onSelectAllInbounds, onUnselectAllInbounds, hideSelectActions, ...rest } =
        props

    const handleShowJson = () => {
        if (!profile) return

        modals.open({
            children: (
                <Box>
                    <JsonEditor
                        collapse={3}
                        data={profile.config as object}
                        indent={4}
                        maxWidth="100%"
                        rootName=""
                        theme={JSON_VIEWER_THEME}
                        viewOnly
                    />
                </Box>
            ),
            title: <BaseOverlayHeader IconComponent={XrayLogo} title={profile.name} />,
            size: 'xl'
        })
    }

    return (
        <Center>
            <Accordion.Control {...rest} />

            <Group gap="0" mr="xs" wrap="nowrap">
                <ActionIconGroup>
                    {!hideSelectActions && (
                        <>
                            <ActionIcon
                                color="gray"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    e.nativeEvent.stopImmediatePropagation()
                                    onSelectAllInbounds(profile.uuid)
                                }}
                                size="lg"
                                variant="subtle"
                            >
                                <PiCheckBold size={16} />
                            </ActionIcon>
                            <ActionIcon
                                color="gray"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    e.nativeEvent.stopImmediatePropagation()
                                    onUnselectAllInbounds(profile.uuid)
                                }}
                                size="lg"
                                variant="subtle"
                            >
                                <PiXBold size={16} />
                            </ActionIcon>
                        </>
                    )}
                    <ActionIcon
                        color="gray"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            e.nativeEvent.stopImmediatePropagation()

                            handleShowJson()
                        }}
                        size="lg"
                        variant="subtle"
                    >
                        <XrayLogo size={16} />
                    </ActionIcon>
                </ActionIconGroup>
            </Group>
        </Center>
    )
}

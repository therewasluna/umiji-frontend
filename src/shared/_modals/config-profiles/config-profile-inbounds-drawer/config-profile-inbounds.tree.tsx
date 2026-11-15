import {
    ActionIcon,
    Badge,
    Box,
    CopyButton,
    Group,
    RenderTreeNodePayload,
    Text,
    Tooltip,
    Tree,
    TreeNodeData
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetInboundsByProfileUuidCommand, GetInternalSquadsCommand } from '@umiji/backend-contract'
import { JsonEditor } from 'json-edit-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCheck, PiCopy, PiTag, PiUsers } from 'react-icons/pi'
import { TbChevronRight, TbCirclesRelation, TbTag } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { JSON_VIEWER_THEME } from '@shared/constants/theme/json-viewer-theme'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'
import { formatInt } from '@shared/utils/misc'

type ProfileInbound = GetInboundsByProfileUuidCommand.Response['response']['inbounds'][number]
type InternalSquad = GetInternalSquadsCommand.Response['response']['internalSquads'][number]

type InboundsTreeMeta =
    | { inbound: ProfileInbound; squadsCount: number; kind: 'inbound' }
    | { inboundsCount: number; kind: 'squad'; membersCount: number; squadUuid: string }

interface InboundsTreeNode extends TreeNodeData {
    children?: InboundsTreeNode[]
    nodeProps: InboundsTreeMeta
}

interface IProps {
    inbounds: ProfileInbound[]
    internalSquads: InternalSquad[]
}

const openRawInboundModal = (inbound: ProfileInbound) => {
    modals.open({
        children: (
            <Box>
                <JsonEditor
                    collapse={3}
                    data={inbound.rawInbound as object}
                    indent={4}
                    maxWidth="100%"
                    rootName=""
                    theme={JSON_VIEWER_THEME}
                    viewOnly
                />
            </Box>
        ),
        size: 'xl',
        title: <BaseOverlayHeader IconComponent={TbTag} title={inbound.tag} titleOrder={5} />
    })
}

export function ConfigProfileInboundsTree(props: IProps) {
    const { t } = useTranslation()

    const { inbounds, internalSquads } = props

    const treeData = useMemo<InboundsTreeNode[]>(() => {
        return inbounds.map((inbound) => {
            const filteredSquads = internalSquads.filter((squad) =>
                inbound.activeSquads.some((squadUuid) => squadUuid === squad.uuid)
            )

            return {
                children: filteredSquads.map((squad) => ({
                    label: squad.name,
                    nodeProps: {
                        inboundsCount: squad.info.inboundsCount,
                        kind: 'squad' as const,
                        membersCount: squad.info.membersCount,
                        squadUuid: squad.uuid
                    },
                    value: `squad:${inbound.uuid}:${squad.uuid}`
                })),
                label: inbound.tag,
                nodeProps: {
                    inbound,
                    kind: 'inbound' as const,
                    squadsCount: filteredSquads.length
                },
                value: `inbound:${inbound.uuid}`
            }
        })
    }, [inbounds, internalSquads])

    const renderTreeNode = ({
        node: treeNode,
        expanded,
        hasChildren,
        elementProps
    }: RenderTreeNodePayload) => {
        const meta = treeNode.nodeProps as InboundsTreeMeta | undefined

        return (
            <Group
                gap={8}
                py={4}
                wrap="nowrap"
                {...elementProps}
                onClick={
                    meta?.kind === 'squad'
                        ? (event) => {
                              event.stopPropagation()
                              showModal('internalSquads_internalSquadsInboundsDrawer', {
                                  squadUuid: meta.squadUuid
                              })
                          }
                        : elementProps.onClick
                }
            >
                {hasChildren ? (
                    <TbChevronRight
                        size={16}
                        style={{
                            flexShrink: 0,
                            opacity: 0.6,
                            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 150ms ease'
                        }}
                    />
                ) : (
                    meta?.kind === 'inbound' && <span style={{ flexShrink: 0, width: 16 }} />
                )}

                {meta?.kind === 'inbound' && (
                    <>
                        <ActionIcon
                            color="gray"
                            onClick={(event) => {
                                event.stopPropagation()
                                openRawInboundModal(meta.inbound)
                            }}
                            size="md"
                            style={{ flexShrink: 0 }}
                            variant="soft"
                        >
                            <TbTag size={18} />
                        </ActionIcon>

                        <Text fw={600} size="sm" truncate="end">
                            {treeNode.label}
                        </Text>

                        <Group gap={0} ml="auto" style={{ flexShrink: 0 }} wrap="nowrap">
                            <Badge
                                leftSection={<TbCirclesRelation size={18} />}
                                size="lg"
                                variant="transparent"
                            >
                                {meta.squadsCount}
                            </Badge>
                            <CopyButton timeout={2000} value={meta.inbound.uuid}>
                                {({ copied, copy }) => (
                                    <Tooltip
                                        label={
                                            copied
                                                ? t('config-profile-inbounds.tree.copied')
                                                : t('common.action.copy-uuid')
                                        }
                                    >
                                        <ActionIcon
                                            color={copied ? 'teal' : 'gray'}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                copy()
                                            }}
                                            size="sm"
                                            variant="subtle"
                                        >
                                            {copied ? <PiCheck size={18} /> : <PiCopy size={18} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        </Group>
                    </>
                )}

                {meta?.kind === 'squad' && (
                    <>
                        <TbCirclesRelation
                            size={14}
                            style={{ flexShrink: 0, marginLeft: 6, opacity: 0.6 }}
                        />

                        <Text size="sm" truncate="end">
                            {treeNode.label}
                        </Text>

                        <Group gap="xs" ml="auto" style={{ flexShrink: 0 }} wrap="nowrap">
                            <Badge
                                color="teal"
                                leftSection={<PiUsers size={14} />}
                                size="sm"
                                variant="light"
                            >
                                {formatInt(meta.membersCount, {
                                    thousandSeparator: ','
                                })}
                            </Badge>
                            <Badge
                                color="blue"
                                leftSection={<PiTag size={14} />}
                                size="sm"
                                variant="light"
                            >
                                {meta.inboundsCount}
                            </Badge>
                        </Group>
                    </>
                )}
            </Group>
        )
    }

    return (
        <SectionCard.Root p="xs">
            <SectionCard.Section>
                <Tree
                    data={treeData}
                    expandOnClick
                    levelOffset={26}
                    renderNode={renderTreeNode}
                    withLines
                />
            </SectionCard.Section>
        </SectionCard.Root>
    )
}

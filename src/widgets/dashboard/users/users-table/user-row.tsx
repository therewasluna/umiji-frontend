import {
    MRT_Row,
    MRT_TableBodyCellValue,
    MRT_TableInstance
} from '@kastov/mantine-react-table-open'
import {
    ActionIcon,
    Badge,
    Checkbox,
    Collapse,
    CopyButton,
    Tooltip,
    UnstyledButton
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { GetUsersCommand } from '@umiji/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCheck, PiCopy } from 'react-icons/pi'
import { TbChevronDown, TbCirclesRelation } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'

import classes from './user-table.module.css'

type TUserRow = GetUsersCommand.Response['response']['users'][number]

// Shown by the row itself. Every other column goes to the details panel, so none can get lost.
const ROW_FIELDS = new Set([
    'brokerUuid',
    'expireAt',
    'id',
    'nodeName',
    'status',
    'tag',
    'trafficLimitBytes',
    'usedTrafficBytes',
    'usedTrafficPercentage',
    'username'
])

// Long values that people copy somewhere else. The sub-link column stands for the whole link.
const COPY_VALUES: Record<string, (user: TUserRow) => string> = {
    shortUuid: (user) => user.subscriptionUrl,
    trojanPassword: (user) => user.trojanPassword,
    vlessUuid: (user) => user.vlessUuid
}

interface IProps {
    row: MRT_Row<TUserRow>
    table: MRT_TableInstance<TUserRow>
}

export function UserRow({ row, table }: IProps) {
    const { t } = useTranslation()
    // Details render on first open: a page of closed rows stays light on a phone.
    const [wasOpened, setWasOpened] = useState(false)
    const [opened, { toggle }] = useDisclosure(false, { onOpen: () => setWasOpened(true) })

    const user = row.original
    const squads = user.activeInternalSquads
    const isSelected = row.getIsSelected()
    const cells = row.getAllCells().filter((c) => c.column.columnDef.columnDefType === 'data')

    const field = (id: string) => {
        const cell = cells.find((c) => c.column.id === id)
        return cell && <MRT_TableBodyCellValue cell={cell} table={table} />
    }

    return (
        <article
            className={classes.row}
            data-expanded={opened || undefined}
            data-selected={isSelected || undefined}
        >
            <div className={classes.main}>
                <label className={classes.check}>
                    <Checkbox
                        aria-label={user.username}
                        checked={isSelected}
                        onChange={row.getToggleSelectedHandler()}
                        size="md"
                    />
                </label>

                {/* A real button stretched over the whole row, so it opens from anywhere and from the keyboard. */}
                <UnstyledButton
                    className={classes.user}
                    onClick={() => showModal('users_viewUserModal', { userId: user.id })}
                >
                    {field('username')}
                </UnstyledButton>

                <div className={classes.status}>{field('status')}</div>

                <div className={classes.usage}>{field('usedTrafficBytes')}</div>

                <div className={classes.expiry}>{field('expireAt')}</div>

                <div className={classes.chips}>
                    {field('tag')}
                    {squads.length > 0 && (
                        <Badge
                            color="gray"
                            leftSection={<TbCirclesRelation size={12} />}
                            tt="none"
                            variant="soft"
                        >
                            {squads[0].name}
                            {squads.length > 1 && ` +${squads.length - 1}`}
                        </Badge>
                    )}
                    {field('brokerUuid')}
                    {field('nodeName')}
                </div>

                <ActionIcon
                    aria-expanded={opened}
                    aria-label={t('user-table.details')}
                    className={classes.toggle}
                    color="gray"
                    data-opened={opened || undefined}
                    onClick={toggle}
                    radius="xl"
                    size="lg"
                    variant="subtle"
                >
                    <TbChevronDown size={18} />
                </ActionIcon>
            </div>

            <Collapse expanded={opened}>
                {wasOpened && (
                    <dl className={classes.details}>
                        {cells
                            .filter((cell) => !ROW_FIELDS.has(cell.column.id))
                            .map((cell) => {
                                const copyValue = COPY_VALUES[cell.column.id]?.(user)

                                return (
                                    <div
                                        className={classes.field}
                                        data-code={copyValue !== undefined || undefined}
                                        data-wide={
                                            (cell.column.id === 'description' &&
                                                !!user.description) ||
                                            undefined
                                        }
                                        key={cell.id}
                                    >
                                        <dt className={classes.fieldLabel}>
                                            {String(cell.column.columnDef.header)}
                                        </dt>
                                        <dd className={classes.fieldValue}>
                                            <span className={classes.fieldText}>
                                                <MRT_TableBodyCellValue cell={cell} table={table} />
                                            </span>
                                            {copyValue && (
                                                <CopyButton timeout={2000} value={copyValue}>
                                                    {({ copied, copy }) => (
                                                        <Tooltip
                                                            label={t(
                                                                copied
                                                                    ? 'common.message.copied'
                                                                    : 'common.action.copy'
                                                            )}
                                                            withArrow
                                                        >
                                                            <ActionIcon
                                                                aria-label={t('common.action.copy')}
                                                                color={copied ? 'teal' : 'gray'}
                                                                onClick={copy}
                                                                size="md"
                                                                variant="subtle"
                                                            >
                                                                {copied ? (
                                                                    <PiCheck size={16} />
                                                                ) : (
                                                                    <PiCopy size={16} />
                                                                )}
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    )}
                                                </CopyButton>
                                            )}
                                        </dd>
                                    </div>
                                )
                            })}
                    </dl>
                )}
            </Collapse>
        </article>
    )
}

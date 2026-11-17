import { Group, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import semver from 'semver'

import { useGetUmijiMetadata } from '@shared/api/hooks'

import { useUmijiInfo } from '@entities/dashboard/updates-store'

import { Logo } from '../logo'
import { BaseOverlayHeader } from '../overlays/base-overlay-header'
import { BuildInfoModal } from '../sidebar/build-info-modal'
import { HeaderControl } from './HeaderControl'
import { SkeletonHeaderControl } from './SkeletonHeaderControl'
import classes from './VersionControl.module.css'

export function VersionControl() {
    const { t } = useTranslation()

    const umijiInfo = useUmijiInfo()
    const { data: umijiMetadata, isLoading } = useGetUmijiMetadata()

    const [isNewVersionAvailable, isDev] = useMemo(() => {
        if (!umijiMetadata) return [false, false]

        // The repo's newest release can be a non-version tag (assets-1), and semver.gt throws on it.
        const currentVersion = semver.valid(umijiMetadata.version)
        const latest = semver.valid(umijiInfo.latestVersion)
        return [
            !!latest && !!currentVersion && semver.gt(latest, currentVersion),
            umijiMetadata.git.backend.branch !== 'main'
        ]
    }, [umijiInfo.latestVersion, umijiMetadata])

    if (isLoading || !umijiMetadata) {
        return <SkeletonHeaderControl width={85} />
    }

    const handleClick = () => {
        modals.open({
            title: (
                <BaseOverlayHeader IconComponent={Logo} title={t('version-control.build-info')} />
            ),
            centered: true,
            size: 'md',
            withCloseButton: true,
            children: (
                <BuildInfoModal
                    isNewVersionAvailable={isNewVersionAvailable}
                    umijiMetadata={umijiMetadata}
                />
            )
        })
    }

    return (
        <HeaderControl
            className={clsx(classes.version, {
                [classes.newVersion]: isNewVersionAvailable && !isDev,
                [classes.dev]: isDev
            })}
            onClick={handleClick}
            w="auto"
        >
            <Group gap={8} ml={10} mr={10} wrap="nowrap">
                <Logo size={20} />
                <Text ff="text" fw={600} size="sm">
                    {umijiMetadata.version}
                </Text>
            </Group>
        </HeaderControl>
    )
}

import { BoxProps, Group } from '@mantine/core'

import { GithubControl } from './GithubControl'
import { LanguageControl } from './LanguageControl'
import { LogoutControl } from './LogoutControl'
import { RecapControl } from './RecapControl'
import { TelegramControl } from './TelegramControl'
import { VersionControl } from './VersionControl'

interface HeaderControlsProps extends BoxProps {
    githubLink?: string
    isGithubLoading?: boolean
    stars?: number
    telegramLink?: string
    withGithub?: boolean
    withLanguage?: boolean
    withLogout?: boolean
    withRecap?: boolean
    withTelegram?: boolean
    withVersion?: boolean
}

export function HeaderControls({
    githubLink,
    withGithub = true,
    withLogout = true,
    withLanguage = true,
    withVersion = true,
    withRecap = false,
    withTelegram = false,
    telegramLink,
    stars,
    isGithubLoading,
    ...others
}: HeaderControlsProps) {
    return (
        <Group gap="xs" {...others}>
            {withVersion && <VersionControl />}
            {withGithub && (
                <GithubControl isLoading={isGithubLoading} link={githubLink!} stars={stars} />
            )}
            {withTelegram && <TelegramControl link={telegramLink!} />}
            {withRecap && <RecapControl />}
            {withLanguage && <LanguageControl />}
            {withLogout && <LogoutControl />}
        </Group>
    )
}

import { Anchor, Badge } from '@mantine/core'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const RISKS_URL = 'https://umiji.wiki/concepts/#ip-limit-risks'
const RISKS_URL_FA = 'https://umiji.wiki/fa/concepts/#ip-limit-risks'

/** Label of a device (IP) limit field: the limit is a beta. */
export function IpLimitBetaLabel({ children }: { children: ReactNode }) {
    const { t } = useTranslation()

    return (
        <>
            {children}{' '}
            <Badge
                color="yellow"
                component="span"
                size="xs"
                style={{ verticalAlign: 'middle' }}
                variant="light"
            >
                {t('ip-limit-beta.beta')}
            </Badge>
        </>
    )
}

/** Description of a device (IP) limit field, ending with a link to the wiki's risks. */
export function IpLimitBetaDescription({ children }: { children: ReactNode }) {
    const { t, i18n } = useTranslation()

    return (
        <>
            {children}{' '}
            <Anchor
                href={i18n.language.startsWith('fa') ? RISKS_URL_FA : RISKS_URL}
                inherit
                rel="noopener noreferrer"
                target="_blank"
                underline="hover"
            >
                {t('ip-limit-beta.read-the-risks')}
            </Anchor>
        </>
    )
}

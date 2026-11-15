import { Button, CopyButton, Group, Skeleton } from '@mantine/core'
import { generateNodeDockerCompose } from '@umiji/backend-contract'
import { useTranslation } from 'react-i18next'
import { PiCheck } from 'react-icons/pi'
import { SiDocker } from 'react-icons/si'

import { useGetNodeSecretKey } from '@shared/api/hooks'

interface IProps {
    port?: number
}

export const CopyDockerComposeWidget = ({ port }: IProps) => {
    const { data: secretKey, isLoading: isSecretKeyLoading } = useGetNodeSecretKey()
    const { t } = useTranslation()

    if (isSecretKeyLoading || !secretKey) {
        return <Skeleton height={40} />
    }

    return (
        <Group mt="lg">
            <CopyButton
                timeout={2000}
                value={generateNodeDockerCompose(port ?? 2222, secretKey.secretKey)}
            >
                {({ copied, copy }) => (
                    <Button
                        color={copied ? 'teal' : 'gray'}
                        fullWidth
                        leftSection={copied ? <PiCheck size={18} /> : <SiDocker size={18} />}
                        onClick={copy}
                        size="md"
                    >
                        {t('copy-docker-compose.widget.copy-docker-compose-yml')}
                    </Button>
                )}
            </CopyButton>
        </Group>
    )
}

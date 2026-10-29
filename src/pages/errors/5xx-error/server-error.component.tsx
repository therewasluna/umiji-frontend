import { CodeHighlight } from '@mantine/code-highlight'
import { Box, Button, Container, Group, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ErrorBoundaryFallbackProps } from '@shared/hocs/error-boundary'

import classes from './ServerError.module.css'

export function ErrorPageComponent({ componentStack, error }: Partial<ErrorBoundaryFallbackProps>) {
    const { t } = useTranslation()

    const navigate = useNavigate()

    const handleRefresh = () => {
        navigate(0)
    }

    const details = [
        error instanceof Error ? (error.stack ?? '') : '',
        componentStack ? `Component stack:${componentStack}` : ''
    ]
        .filter(Boolean)
        .join('\n\n')

    return (
        <div className={classes.root}>
            <Container>
                <div className={classes.label}>500</div>
                <Title className={classes.title}>
                    {t('server-error.something-bad-just-happened')}
                </Title>
                <Group justify="center" mt="xl">
                    <Button onClick={handleRefresh} size="md" variant="soft">
                        {t('server-error.refresh-the-page')}
                    </Button>
                </Group>
                {details && (
                    <Box mt="xl">
                        <CodeHighlight
                            defaultExpanded={false}
                            radius="md"
                            background="rgba(255, 255, 255, 0.02)"
                            withLineNumbers
                            code={details}
                            expandCodeLabel=""
                            collapseCodeLabel=""
                        />
                    </Box>
                )}
            </Container>
        </div>
    )
}

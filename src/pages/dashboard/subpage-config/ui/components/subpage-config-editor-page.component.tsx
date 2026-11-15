import {
    ActionIcon,
    Button,
    CopyButton,
    FileButton,
    SimpleGrid,
    Stack,
    Tooltip
} from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { GetSubpageConfigCommand } from '@umiji/backend-contract'
import {
    SubscriptionPageRawConfigSchema,
    TSubscriptionPageRawConfig
} from '@umiji/subscription-page-types'
import {
    BaseSettingsBlockComponent,
    BaseTranslationsBlockComponent,
    BrandingBlockComponent,
    LocalizationBlockComponent,
    PlatformBlockComponent,
    SvgLibraryBlockComponent,
    UiConfigBlockComponent
} from '@widgets/dashboard/subpage-configs/subpage-config-editor/editor-base'
import {
    ImportConfigSectionsModalContent,
    ImportMode,
    showValidationErrorsModal
} from '@widgets/dashboard/subpage-configs/subpage-config-editor/modals'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCheck, PiCopy } from 'react-icons/pi'
import {
    TbArrowBackUp,
    TbCheck,
    TbCloudDownload,
    TbDeviceFloppy,
    TbDownload,
    TbFileImport,
    TbUpload
} from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { QueryKeys, useUpdateSubpageConfig } from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'
import { OPEN_ENTITY, ROUTES } from '@shared/constants'
import { CopyEntityLinkButton, Page, PageHeaderShared } from '@shared/ui'
import { useDownloadTemplate } from '@shared/ui/load-templates/use-download-template'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { sleep } from '@shared/utils/misc'

import { useIsBroker } from '@entities/auth/session-store'

interface Props {
    config: GetSubpageConfigCommand.Response['response']
}

export const SubpageConfigEditorPageComponent = (props: Props) => {
    const { config } = props
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isBroker = useIsBroker()

    const resetRef = useRef<() => void>(null)
    const form = useForm<TSubscriptionPageRawConfig>({
        mode: 'uncontrolled',
        initialValues: config.config as TSubscriptionPageRawConfig,
        validate: schemaResolver(SubscriptionPageRawConfigSchema)
    })

    const { mutate: updateSubscriptionPageConfig, isPending: isUpdatingSubscriptionPageConfig } =
        useUpdateSubpageConfig({
            mutationFns: {
                onSuccess: (data) => {
                    queryClient.setQueryData(
                        QueryKeys.subpageConfigs.getSubpageConfig({
                            uuid: config.uuid
                        }).queryKey,
                        data
                    )
                    form.resetDirty()
                }
            }
        })

    const handleDownloadConfig = () => {
        const dataStr = JSON.stringify(form.getValues(), null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `subpage-${config.uuid}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    const handleSave = () => {
        const validation = form.validate()
        if (validation.hasErrors) {
            const errors = Object.entries(validation.errors)
                .filter(([_, value]) => value)
                .map(([path, message]) => ({ path, message: String(message) }))

            showValidationErrorsModal(errors, t)
            return
        }

        updateSubscriptionPageConfig({
            variables: { uuid: config.uuid, config: form.getValues() }
        })
    }

    const mergeSvgLibrary = (
        current: Record<string, string>,
        imported: Record<string, string>
    ): Record<string, string> => {
        return { ...current, ...imported }
    }

    const handleImportByMode = async (
        importedConfig: TSubscriptionPageRawConfig,
        mode: ImportMode
    ) => {
        notifications.show({
            id: 'import-config',
            loading: true,
            color: 'cyan',
            title: t('subpage-config-editor-page.component.importing-config'),
            message: t('subpage-config-editor-page.component.this-may-take-a-while'),
            autoClose: false,
            withCloseButton: false
        })

        const currentSvgLibrary = form.getValues().svgLibrary || {}

        switch (mode) {
            case 'baseTranslations': {
                form.setValues({
                    baseTranslations: importedConfig.baseTranslations,
                    locales: importedConfig.locales
                })
                break
            }
            case 'full': {
                form.setValues(importedConfig)
                break
            }
            case 'platforms': {
                form.setValues({
                    platforms: importedConfig.platforms,
                    locales: importedConfig.locales,
                    baseTranslations: importedConfig.baseTranslations,
                    svgLibrary: mergeSvgLibrary(currentSvgLibrary, importedConfig.svgLibrary || {})
                })
                break
            }
            case 'svgLibrary': {
                form.setValues({
                    svgLibrary: mergeSvgLibrary(currentSvgLibrary, importedConfig.svgLibrary || {})
                })

                break
            }
            default:
                break
        }

        notifications.update({
            id: 'import-config',
            loading: false,
            title: t('common.message.success'),
            message: t('subpage-config-editor-page.component.config-imported-successfully'),
            icon: <TbCheck size={18} />,
            autoClose: 3000,
            color: 'teal'
        })
    }

    const handleImportConfig = async (file: File | null) => {
        if (!file) return

        try {
            const content = await file.text()
            const configData = JSON.parse(content)
            const validatedConfig = SubscriptionPageRawConfigSchema.safeParse(configData)

            if (!validatedConfig.success) {
                const errors = validatedConfig.error.issues.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
                showValidationErrorsModal(errors, t)
                return
            }

            await sleep(100)

            modals.open({
                title: (
                    <BaseOverlayHeader
                        IconComponent={TbFileImport}
                        iconSize={20}
                        title={t('subpage-config-editor-page.component.import-config')}
                        titleOrder={5}
                    />
                ),
                children: (
                    <ImportConfigSectionsModalContent
                        currentConfig={form.getValues()}
                        importedConfig={validatedConfig.data}
                        onImport={(mode) => handleImportByMode(validatedConfig.data, mode)}
                    />
                ),
                centered: true,
                size: 'lg'
            })
        } catch {
            notifications.show({
                title: t('common.message.error'),
                message: t('subpage-config-editor-page.component.failed-to-parse-config-file'),
                color: 'red'
            })
        } finally {
            resetRef.current?.()
        }
    }

    const { openDownloadModal } = useDownloadTemplate({
        editorType: 'SUBPAGE_CONFIG',
        templateType: 'SUBPAGE_CONFIG',
        onLoadTemplate: async (content) => {
            handleImportConfig(new File([content], 'config.json'))
        }
    })

    return (
        <Page title={isBroker ? t('constants.subscription-page') : config.name}>
            <PageHeaderShared
                actions={
                    <>
                        {!isBroker && (
                            <CopyEntityLinkButton
                                entity={OPEN_ENTITY.SUBPAGE_CONFIG}
                                iconSize={20}
                                id={config.uuid}
                                size="input-md"
                                variant="soft"
                            />
                        )}

                        <FileButton
                            accept="application/json,.json"
                            onChange={handleImportConfig}
                            resetRef={resetRef}
                        >
                            {(props) => (
                                <Tooltip
                                    label={t('subpage-config-editor-page.component.import-config')}
                                >
                                    <ActionIcon
                                        color="gray"
                                        size="input-md"
                                        variant="soft"
                                        {...props}
                                    >
                                        <TbUpload size={20} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </FileButton>

                        <Tooltip label={t('subpage-config-editor-page.component.download-config')}>
                            <ActionIcon
                                color="gray"
                                onClick={handleDownloadConfig}
                                size="input-md"
                                variant="soft"
                            >
                                <TbDownload size={20} />
                            </ActionIcon>
                        </Tooltip>

                        <CopyButton timeout={2000} value={config.uuid}>
                            {({ copied, copy }) => (
                                <Tooltip label={t('common.action.copy-uuid')}>
                                    <ActionIcon
                                        color={copied ? 'teal' : 'gray'}
                                        onClick={copy}
                                        size="input-md"
                                        variant="soft"
                                    >
                                        {copied ? <PiCheck size={20} /> : <PiCopy size={20} />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>

                        {!isBroker && (
                            <ActionIcon
                                color="gray"
                                onClick={() => navigate(ROUTES.DASHBOARD.SUBPAGE_CONFIGS.ROOT)}
                                size="input-md"
                                variant="soft"
                            >
                                <TbArrowBackUp size={20} />
                            </ActionIcon>
                        )}

                        <Button
                            leftSection={<TbCloudDownload size={20} />}
                            onClick={openDownloadModal}
                            size="md"
                            variant="default"
                        >
                            {t('common.action.load-from-github')}
                        </Button>

                        <Button
                            color="teal"
                            disabled={isUpdatingSubscriptionPageConfig}
                            leftSection={<TbDeviceFloppy size={20} />}
                            loading={isUpdatingSubscriptionPageConfig}
                            onClick={handleSave}
                            size="md"
                            variant="soft"
                        >
                            {t('common.action.save')}
                        </Button>
                    </>
                }
                // A broker has one page, so it gets a plain title instead of the config's name and UUID.
                description={
                    isBroker ? t('page-descriptions.subscription-page-broker') : config.uuid
                }
                title={isBroker ? t('constants.subscription-page') : config.name}
                wrapActions
            />

            <Stack gap="lg">
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <BrandingBlockComponent form={form} />
                    <LocalizationBlockComponent form={form} />
                    <SvgLibraryBlockComponent form={form} />
                    <BaseTranslationsBlockComponent form={form} />
                </SimpleGrid>
                <BaseSettingsBlockComponent form={form} />
                <UiConfigBlockComponent form={form} />
                <PlatformBlockComponent form={form} />
            </Stack>
        </Page>
    )
}

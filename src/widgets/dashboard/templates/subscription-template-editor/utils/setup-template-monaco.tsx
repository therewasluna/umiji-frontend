import { Monaco } from '@monaco-editor/react'
import {
    GetHostsCommand,
    SUBSCRIPTION_TEMPLATE_TYPE,
    TSubscriptionTemplateType
} from '@umiji/backend-contract'
import axios from 'axios'
import consola from 'consola'
import { t as translate, TFunction } from 'i18next'
import { configureMonacoYaml, MonacoYaml, MonacoYamlOptions, SchemasSettings } from 'monaco-yaml'
import { app } from 'src/config'

import { registerJsonSchema } from '@shared/utils/monaco/json-schema-registry'

type Host = GetHostsCommand.Response['response'][number]

interface IJsonSchemaDocument {
    [key: string]: unknown
    properties?: Record<string, unknown>
}

export const getTemplateModelPath = (templateType: TSubscriptionTemplateType) =>
    `subscription-template://${templateType.toLowerCase()}`

const YAML_OPTIONS: MonacoYamlOptions = {
    validate: true,
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    format: {
        printWidth: 160,
        enable: true
    }
}

let monacoYaml: MonacoYaml | undefined

const configureYaml = (monaco: Monaco, schemas?: SchemasSettings[]) => {
    const options: MonacoYamlOptions = { ...YAML_OPTIONS, schemas }

    if (monacoYaml) {
        monacoYaml.update(options)
        return
    }

    monacoYaml = configureMonacoYaml(monaco, options)
}

const DOCS_URL = 'https://github.com/therewasluna/umiji'
const getDocsLink = (t: TFunction) =>
    t('setup-template-monaco.documentation-link', { url: DOCS_URL })

function getHostStatus(host: Host, t: TFunction): { icon: string; label: string } {
    if (host.isDisabled) return { icon: '⛔', label: t('setup-template-monaco.disabled') }
    if (host.isHidden) return { icon: '👁', label: t('setup-template-monaco.hidden') }
    return { icon: '✅', label: t('setup-template-monaco.active') }
}

function buildMarkdownDescription(host: Host, t: TFunction): string {
    const { icon, label } = getHostStatus(host, t)

    const rows: string[] = [
        '',
        '| | |',
        '|:--|:--|',
        t('setup-template-monaco.host-remark', { remark: host.remark }),
        t('setup-template-monaco.host-address', { address: host.address, port: host.port }),
        t('setup-template-monaco.host-status', { icon: icon, status: label })
    ]

    if (host.tags.length > 0)
        rows.push(t('setup-template-monaco.host-tags', { join: host.tags.join(', ') }))
    if (host.sni) rows.push(`| **SNI** | \`${host.sni}\` |`)
    if (host.serverDescription)
        rows.push(
            t('setup-template-monaco.host-description', {
                serverDescription: host.serverDescription
            })
        )
    if (host.inbound.configProfileUuid) {
        rows.push(
            t('setup-template-monaco.host-profile-uuid', {
                configProfileUuid: host.inbound.configProfileUuid
            })
        )
    }
    if (host.inbound.configProfileInboundUuid) {
        rows.push(
            t('setup-template-monaco.host-inbound-uuid', {
                configProfileInboundUuid: host.inbound.configProfileInboundUuid
            })
        )
    }

    return rows.join('\n')
}

export const configureMonaco = async (
    monaco: Monaco,
    language: 'json' | 'yaml',
    hosts: GetHostsCommand.Response['response'],
    templateType: TSubscriptionTemplateType,
    t: TFunction = translate
) => {
    try {
        if (language === 'yaml') {
            const schemas =
                templateType === SUBSCRIPTION_TEMPLATE_TYPE.MIHOMO
                    ? [
                          {
                              fileMatch: [getTemplateModelPath(templateType)],
                              uri: new URL(
                                  app.templateEditor.mihomoYamlSchemaUrl,
                                  window.location.origin
                              ).href
                          }
                      ]
                    : undefined

            configureYaml(monaco, schemas)
        }

        if (language === 'json') {
            const hostUuids = hosts.map((h) => h.uuid)
            const hostDescriptions = hosts.map((host) => buildMarkdownDescription(host, t))

            const schema = {
                type: 'object',
                properties: {
                    umiji: {
                        type: 'object',
                        properties: {
                            injectHosts: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        selector: {
                                            type: 'object',
                                            properties: {
                                                type: {
                                                    type: 'string',
                                                    enum: [
                                                        'uuids',
                                                        'remarkRegex',
                                                        'tagRegex',
                                                        'sameTagAsRecipient'
                                                    ]
                                                }
                                            },
                                            required: ['type'],
                                            allOf: [
                                                {
                                                    if: {
                                                        properties: {
                                                            type: { const: 'uuids' }
                                                        },
                                                        required: ['type']
                                                    },
                                                    // oxlint-disable-next-line
                                                    then: {
                                                        properties: {
                                                            type: true,
                                                            values: {
                                                                type: 'array',
                                                                items: {
                                                                    type: 'string',
                                                                    format: 'uuid',
                                                                    enum: hostUuids,
                                                                    markdownEnumDescriptions:
                                                                        hostDescriptions,
                                                                    errorMessage: t(
                                                                        'setup-template-monaco.no-host-found-with-this-uuid'
                                                                    )
                                                                },
                                                                minItems: 1
                                                            }
                                                        },
                                                        required: ['values'],
                                                        additionalProperties: false
                                                    }
                                                },
                                                {
                                                    if: {
                                                        properties: {
                                                            type: { const: 'remarkRegex' }
                                                        },
                                                        required: ['type']
                                                    },
                                                    // oxlint-disable-next-line
                                                    then: {
                                                        properties: {
                                                            type: true,
                                                            pattern: {
                                                                type: 'string',
                                                                minLength: 1
                                                            }
                                                        },
                                                        required: ['pattern'],
                                                        additionalProperties: false
                                                    }
                                                },
                                                {
                                                    if: {
                                                        properties: {
                                                            type: { const: 'tagRegex' }
                                                        },
                                                        required: ['type']
                                                    },
                                                    // oxlint-disable-next-line
                                                    then: {
                                                        properties: {
                                                            type: true,
                                                            pattern: {
                                                                type: 'string',
                                                                minLength: 1
                                                            }
                                                        },
                                                        required: ['pattern'],
                                                        additionalProperties: false
                                                    }
                                                },
                                                {
                                                    if: {
                                                        properties: {
                                                            type: {
                                                                const: 'sameTagAsRecipient'
                                                            }
                                                        },
                                                        required: ['type']
                                                    },
                                                    // oxlint-disable-next-line
                                                    then: {
                                                        properties: { type: true },
                                                        additionalProperties: false
                                                    }
                                                }
                                            ]
                                        },
                                        selectFrom: {
                                            type: 'string',
                                            enum: ['ALL', 'HIDDEN', 'NOT_HIDDEN'],
                                            default: 'HIDDEN',
                                            markdownDescription: t(
                                                'setup-template-monaco.visibility-description',
                                                { docs: getDocsLink(t) }
                                            )
                                        },
                                        tagPrefix: {
                                            type: 'string',
                                            minLength: 1
                                        },
                                        useHostRemarkAsTag: {
                                            type: 'boolean',
                                            markdownDescription: t(
                                                'setup-template-monaco.remark-tag-description',
                                                { docs: getDocsLink(t) }
                                            )
                                        },
                                        useHostTagAsTag: {
                                            type: 'boolean',
                                            markdownDescription: t(
                                                'setup-template-monaco.host-tag-description',
                                                { docs: getDocsLink(t) }
                                            )
                                        }
                                    },
                                    required: ['selector'],
                                    anyOf: [
                                        { required: ['tagPrefix'] },
                                        {
                                            properties: {
                                                useHostRemarkAsTag: {
                                                    const: true
                                                }
                                            },
                                            required: ['useHostRemarkAsTag']
                                        },
                                        {
                                            properties: {
                                                useHostTagAsTag: {
                                                    const: true
                                                }
                                            },
                                            required: ['useHostTagAsTag']
                                        }
                                    ],
                                    additionalProperties: false
                                },
                                markdownDescription: t(
                                    'setup-template-monaco.inject-hosts-description',
                                    {
                                        docs: getDocsLink(t)
                                    }
                                )
                            },
                            addVirtualHostAsOutbound: {
                                type: 'boolean',
                                markdownDescription: t(
                                    'setup-template-monaco.virtual-host-description',
                                    {
                                        docs: getDocsLink(t)
                                    }
                                )
                            }
                        },
                        additionalProperties: false
                    }
                }
            }

            registerJsonSchema({
                fileMatch: ['subscription-template://*', getTemplateModelPath(templateType)],
                schema,
                uri: 'https://subscription-template-schema.json'
            })

            if (templateType === SUBSCRIPTION_TEMPLATE_TYPE.SINGBOX) {
                const response = await axios.get<IJsonSchemaDocument>(
                    app.templateEditor.singboxJsonSchemaUrl
                )
                const singboxSchema = response.data

                registerJsonSchema({
                    fileMatch: [getTemplateModelPath(templateType)],
                    schema: {
                        ...singboxSchema,
                        properties: { ...singboxSchema.properties, umiji: true }
                    },
                    uri: 'https://singbox-schema.json'
                })
            }
        }
    } catch (error) {
        consola.error(`Failed to configure Monaco ${language.toUpperCase()}:`, error)
    }
}

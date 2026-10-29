import {
    GetSharedListsCommand,
    GetSnippetsCommand,
    HostMapperSchema,
    ResponseRulesConfigSchema,
    TSubscriptionTemplateType
} from '@umiji/backend-contract'
import { NodePluginEditorSchema, SharedListConfigSchema } from '@umiji/node-plugins'
import axios from 'axios'
import consola from 'consola'
import { t as translate, TFunction } from 'i18next'
import { app } from 'src/config'

import { registerJsonSchema } from '@shared/utils/monaco/json-schema-registry'

interface ISchemaNode {
    allOf?: ISchemaNode[]
    anyOf?: ISchemaNode[]
    oneOf?: ISchemaNode[]
    properties?: Record<string, unknown>
}

interface IXraySchema {
    $ref?: unknown
    definitions?: Record<string, ISchemaNode | undefined>
}

const DEFINITIONS_REF_PREFIX = '#/definitions/'
const PROTECTED_ROOT_KEYS = new Set(['api', 'inbounds', 'metrics', 'snippets', 'stats'])

const getCustomCoreSchema = (t: TFunction) => ({
    title: t('monaco-setup.umiji-custom-core'),
    markdownDescription: [
        t('monaco-setup.custom-core-description'),
        '',
        t('monaco-setup.beta-feature-use-strictly-at-your-own-risk'),
        '>',
        t('monaco-setup.it-may-be-changed-or-removed-at-any-time-without-prior-notice'),
        '',
        t('monaco-setup.custom-core-install-description'),
        '',
        t('monaco-setup.custom-core-verification-description'),
        '',
        '```json',
        '{',
        '  "geodata": {',
        '    "core": {',
        '      "url": "https://example.com/xray-linux-amd64",',
        '      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"',
        '    }',
        '  }',
        '}',
        '```'
    ].join('\n'),
    type: 'object',
    additionalProperties: false,
    required: ['url', 'sha256'],
    properties: {
        url: {
            title: t('monaco-setup.core-url'),
            markdownDescription: [
                t('monaco-setup.direct-link-to-the-xray-core-binary-to-install-on-the-node'),
                '',
                t('monaco-setup.custom-core-url-description')
            ].join('\n'),
            type: 'string',
            pattern: '^https://\\S+$',
            patternErrorMessage: t('monaco-setup.url-must-start-with-https')
        },
        sha256: {
            title: t('monaco-setup.core-sha-256'),
            markdownDescription: [
                t('monaco-setup.sha-256-checksum-of-the-binary-64-hexadecimal-characters'),
                '',
                t('monaco-setup.custom-core-checksum-description')
            ].join('\n'),
            type: 'string',
            pattern: '^[A-Fa-f0-9]{64}$',
            patternErrorMessage: t('monaco-setup.sha-256-must-be-exactly-64-hexadecimal-characters')
        }
    }
})

const injectProperty = (
    node: ISchemaNode | undefined,
    propertyName: string,
    propertySchema: object
): number => {
    if (!node || typeof node !== 'object') {
        return 0
    }

    let injected = 0

    if (node.properties) {
        node.properties[propertyName] = propertySchema
        injected += 1
    }

    for (const branch of [...(node.anyOf ?? []), ...(node.oneOf ?? []), ...(node.allOf ?? [])]) {
        injected += injectProperty(branch, propertyName, propertySchema)
    }

    return injected
}

const MAX_INBOUND_PATHS = 400
const MAX_INBOUND_DEPTH = 10
const MAX_INBOUND_VALUE_PREVIEW = 400

const collectInboundPaths = (
    value: unknown,
    prefix: string,
    depth: number,
    collected: Map<string, unknown>
) => {
    if (collected.size >= MAX_INBOUND_PATHS || depth > MAX_INBOUND_DEPTH) return
    if (value === null || typeof value !== 'object') return

    const entries = Array.isArray(value)
        ? value.map((item, index) => [String(index), item] as const)
        : Object.entries(value as Record<string, unknown>)

    for (const [key, child] of entries) {
        if (collected.size >= MAX_INBOUND_PATHS) return

        const path = prefix ? `${prefix}.${key}` : key

        collected.set(path, child)
        collectInboundPaths(child, path, depth + 1, collected)
    }
}

const injectInboundPaths = (schema: unknown, rawInbound: unknown, t: TFunction = translate) => {
    const collected = new Map<string, unknown>()
    collectInboundPaths(rawInbound, '', 0, collected)

    if (collected.size === 0) return

    const snippets = [...collected.entries()].map(([path, value]) => {
        const json = JSON.stringify(value, null, 2) ?? 'undefined'
        const preview =
            json.length > MAX_INBOUND_VALUE_PREVIEW
                ? `${json.slice(0, MAX_INBOUND_VALUE_PREVIEW)}\n…`
                : json

        return {
            label: path,
            body: path,
            markdownDescription: [
                '',
                t('monaco-setup.current-value-in-the-inbound'),
                '',
                '```json',
                preview,
                '```'
            ].join('\n')
        }
    })

    const properties = (schema as { properties?: Record<string, { items?: ISchemaNode }> })
        .properties

    for (const client of ['xrayJson', 'mihomo', 'base64']) {
        for (const branch of properties?.[client]?.items?.oneOf ?? []) {
            const from = branch.properties?.from as Record<string, unknown> | undefined

            if (!from) continue

            from.defaultSnippets = snippets
        }
    }
}

const resolveRootNode = (schema: IXraySchema | undefined): ISchemaNode | undefined => {
    const ref = schema?.$ref

    if (typeof ref !== 'string' || !ref.startsWith(DEFINITIONS_REF_PREFIX)) {
        return undefined
    }

    return schema?.definitions?.[ref.slice(DEFINITIONS_REF_PREFIX.length)]
}

export const MonacoSetupFeature = {
    setup: async (
        currentLanguage: string,
        snippets: GetSnippetsCommand.Response['response']['snippets'],
        t: TFunction = translate
    ) => {
        try {
            const snippetNames = snippets.map((s) => s.name)

            let { jsonSchemaUrl } = app.configEditor
            switch (currentLanguage) {
                case 'zh':
                    jsonSchemaUrl = app.configEditor.jsonSchemaCnUrl
                    break
                default:
                    jsonSchemaUrl = app.configEditor.jsonSchemaUrl
            }

            const response = await axios.get(jsonSchemaUrl)
            const schema = response.data

            const snippetDescriptions = snippets.map((snippet) => {
                const snippetJson = JSON.stringify(snippet.snippet, null, 1)

                return ['', '```json', snippetJson.slice(2, -2), '```', '', '---', ''].join('\n')
            })

            const snippetSchema = {
                name: 'snippet',
                title: t('monaco-setup.umiji-snippets'),
                markdownDescription: t('monaco-setup.snippets-description'),
                type: 'string',
                enum: snippetNames,
                markdownEnumDescriptions: snippetDescriptions,
                minLength: 2,
                maxLength: 255,
                pattern: '^[A-Za-z0-9_ -]+(/[A-Za-z0-9_ -]+)*$',
                patternErrorMessage: t('monaco-setup.snippet-name-validation')
            }

            const rootSnippetsSchema = {
                name: 'snippets',
                title: t('monaco-setup.umiji-snippets'),
                markdownDescription: [
                    t('monaco-setup.snippets-merged-into-the-root-of-this-config'),
                    '',
                    t('monaco-setup.root-snippet-example-description'),
                    '```json',
                    '[{ "log": { "loglevel": "debug" } }]',
                    '```',
                    t('monaco-setup.root-snippet-merge-description'),
                    '',
                    t('monaco-setup.inbounds-api-stats-and-metrics-are-always-skipped')
                ].join('\n'),
                type: 'array',
                items: {
                    ...snippetSchema,
                    title: t('monaco-setup.snippet-name')
                },
                minItems: 1
            }

            const notInjected: string[] = (
                ['OutboundObject', 'RuleObject', 'BalancerObject'] as const
            ).filter(
                (definition) =>
                    injectProperty(schema.definitions?.[definition], 'snippet', snippetSchema) === 0
            )

            const rootNode = resolveRootNode(schema)

            if (injectProperty(rootNode, 'snippets', rootSnippetsSchema) === 0) {
                notInjected.push('config root')
            }

            if (notInjected.length > 0) {
                consola.error(
                    `Failed to inject the snippet property into the Xray schema: ${notInjected.join(', ')}.`
                )
            }

            if (
                injectProperty(
                    schema.definitions?.GeodataObject,
                    'core',
                    getCustomCoreSchema(t)
                ) === 0 &&
                rootNode?.properties?.geodata
            ) {
                consola.error('Failed to inject the custom core property into GeodataObject.')
            }

            registerJsonSchema({
                fileMatch: ['xray-config://*'],
                schema,
                uri: 'https://xray-config-schema.json'
            })
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

export const MonacoSetupSnippetsFeature = {
    setup: async (currentLanguage: string, t: TFunction = translate) => {
        try {
            let { jsonSchemaUrl } = app.configEditor
            switch (currentLanguage) {
                case 'zh':
                    jsonSchemaUrl = app.configEditor.jsonSchemaCnUrl
                    break
                default:
                    jsonSchemaUrl = app.configEditor.jsonSchemaUrl
            }

            const response = await axios.get(jsonSchemaUrl)
            const schema = await response.data

            const rootNode = resolveRootNode(schema)

            injectProperty(schema.definitions?.GeodataObject, 'core', getCustomCoreSchema(t))

            const snippetArraySchema = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: t('monaco-setup.snippet-array'),
                description: t(
                    'monaco-setup.array-of-root-outbound-rule-or-balancer-objects-for-snippets'
                ),
                type: 'array',
                items: {
                    oneOf: [
                        {
                            ...schema.definitions?.OutboundObject,
                            title: t('monaco-setup.outbound-object'),
                            description: t('monaco-setup.outbound-configuration-for-outbounds')
                        },
                        {
                            ...schema.definitions?.RuleObject,
                            title: t('monaco-setup.rule-object'),
                            description: t('monaco-setup.routing-rule-for-routing-rules')
                        },
                        {
                            ...schema.definitions?.BalancerObject,
                            title: t('monaco-setup.balancer-object'),
                            description: t(
                                'monaco-setup.balancer-configuration-for-routing-balancers'
                            )
                        },
                        ...(rootNode?.properties
                            ? [
                                  {
                                      ...rootNode,
                                      properties: Object.fromEntries(
                                          Object.entries(rootNode.properties).filter(
                                              ([key]) => !PROTECTED_ROOT_KEYS.has(key)
                                          )
                                      ),
                                      title: t('monaco-setup.root-object'),
                                      description: t('monaco-setup.root-object-description'),
                                      markdownDescription: t(
                                          'monaco-setup.root-object-markdown-description'
                                      )
                                  }
                              ]
                            : [])
                    ]
                },
                minItems: 1,
                definitions: schema.definitions || {}
            }

            registerJsonSchema({
                fileMatch: ['snippet://*'],
                schema: snippetArraySchema,
                uri: 'https://snippet-schema.json'
            })

            return snippetArraySchema
        } catch (error) {
            consola.error('Failed to load snippet JSON schema:', error)
            return null
        }
    }
}

export const MonacoSetupResponseRulesFeature = {
    setup: async (
        groupedTemplates: Record<TSubscriptionTemplateType, string[]>,
        t: TFunction = translate
    ) => {
        try {
            const schema = ResponseRulesConfigSchema.toJSONSchema({
                target: 'draft-07'
            })

            const templateOptions = {
                BROWSER: [],
                BLOCK: [],
                STATUS_CODE_404: [],
                STATUS_CODE_451: [],
                SOCKET_DROP: [],
                ...groupedTemplates
            }

            const rules = schema.properties?.rules
            const rulesItems =
                typeof rules === 'object' &&
                typeof rules.items === 'object' &&
                !Array.isArray(rules.items)
                    ? rules.items
                    : undefined

            if (rulesItems) {
                const rulesAllOf = (rulesItems.allOf ??= [])

                Object.entries(templateOptions).forEach(([responseType, templates]) => {
                    if (templates.length > 0) {
                        rulesAllOf.push({
                            if: {
                                properties: {
                                    responseType: { const: responseType }
                                },
                                required: ['responseType']
                            },
                            // oxlint-disable-next-line
                            then: {
                                properties: {
                                    responseModifications: {
                                        properties: {
                                            subscriptionTemplate: {
                                                enum: templates,
                                                markdownDescription: t(
                                                    'monaco-setup.available-templates',
                                                    { responseType }
                                                ),
                                                markdownEnumDescriptions: templates.map((name) =>
                                                    t('monaco-setup.use-template', { name })
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    } else {
                        rulesAllOf.push({
                            if: {
                                properties: {
                                    responseType: { const: responseType }
                                },
                                required: ['responseType']
                            },
                            // oxlint-disable-next-line
                            then: {
                                properties: {
                                    responseModifications: {
                                        properties: {
                                            subscriptionTemplate: {
                                                type: 'null',
                                                not: { type: 'string' },
                                                markdownDescription: t(
                                                    'monaco-setup.no-templates',
                                                    { responseType }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    }
                })
            }

            registerJsonSchema(
                {
                    fileMatch: ['response-rules://*'],
                    schema,
                    uri: 'https://response-rules-schema.json'
                },
                {
                    comments: 'error',
                    schemaValidation: 'error',
                    trailingCommas: 'error'
                }
            )
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

export const MonacoSetupHostMapperEditorFeature = {
    setup: async (rawInbound?: unknown) => {
        try {
            const schema = HostMapperSchema.toJSONSchema({ target: 'draft-07' })

            injectInboundPaths(schema, rawInbound)

            registerJsonSchema(
                {
                    fileMatch: ['host-mapper://*'],
                    schema,
                    uri: 'https://host-mapper-schema.json'
                },
                {
                    comments: 'error',
                    schemaValidation: 'error',
                    trailingCommas: 'error'
                }
            )
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

type TSharedLists = GetSharedListsCommand.Response['response']['sharedLists']

const buildSharedListDescription = (sharedList: TSharedLists[number], t: TFunction): string => {
    const { type, itemsCount } = sharedList

    return t('monaco-setup.shared-list-items', { type, count: itemsCount })
}

const injectSharedListNames = (
    node: unknown,
    sharedLists: TSharedLists,
    t: TFunction = translate
): void => {
    if (!node || typeof node !== 'object') return

    if (Array.isArray(node)) {
        node.forEach((item) => injectSharedListNames(item, sharedLists))
        return
    }

    const schemaNode = node as Record<string, unknown>

    if (schemaNode.type === 'string' && String(schemaNode.pattern ?? '').startsWith('^ext:')) {
        delete schemaNode.pattern

        schemaNode.enum = sharedLists.map((sharedList) => `ext:${sharedList.name}`)
        schemaNode.markdownEnumDescriptions = sharedLists.map((sharedList) =>
            buildSharedListDescription(sharedList, t)
        )
        schemaNode.title = t('monaco-setup.shared-list')
        schemaNode.markdownDescription =
            sharedLists.length > 0
                ? t('monaco-setup.reference-to-a-shared-list-manage-lists-in-shared-lists')
                : t('monaco-setup.no-shared-lists-created-yet-create-one-in-shared-lists-first')
        return
    }

    Object.values(schemaNode).forEach((value) => injectSharedListNames(value, sharedLists))
}

export const MonacoSetupNodePluginEditorFeature = {
    setup: async (sharedLists: TSharedLists = []) => {
        try {
            const schema = NodePluginEditorSchema.toJSONSchema()

            injectSharedListNames(schema, sharedLists)

            registerJsonSchema(
                {
                    fileMatch: ['node-plugin://*'],
                    schema,
                    uri: 'https://node-plugin-schema.json'
                },
                {
                    comments: 'error',
                    schemaValidation: 'error',
                    trailingCommas: 'error'
                }
            )
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

export const MonacoSetupSharedListEditorFeature = {
    setup: () => {
        try {
            const schema = SharedListConfigSchema.toJSONSchema()
            registerJsonSchema(
                {
                    fileMatch: ['shared-list://*'],
                    schema,
                    uri: 'https://shared-list-schema.json'
                },
                {
                    comments: 'error',
                    schemaValidation: 'error',
                    trailingCommas: 'error'
                }
            )
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

const HOST_JSON_FIELD_SCHEMAS = [
    { definition: 'MuxObject', fileMatch: 'host-mux://*', uri: 'https://host-mux-schema.json' },
    {
        definition: 'SockoptObject',
        fileMatch: 'host-sockopt://*',
        uri: 'https://host-sockopt-schema.json'
    },
    {
        definition: 'FinalMaskObject',
        fileMatch: 'host-final-mask://*',
        uri: 'https://host-final-mask-schema.json'
    }
]

const buildFinalMaskProperties = (definitions: Record<string, ISchemaNode | undefined>) => {
    if (!definitions.TCPMask || !definitions.UDPMask) {
        return undefined
    }

    return {
        quicParams: definitions.quicParams
            ? { $ref: '#/definitions/quicParams' }
            : { type: 'object' },
        tcp: { type: 'array', items: { $ref: '#/definitions/TCPMask' } },
        udp: { type: 'array', items: { $ref: '#/definitions/UDPMask' } }
    }
}

export const MonacoSetupHostJsonFieldsFeature = {
    setup: async (currentLanguage: string) => {
        try {
            let { jsonSchemaUrl } = app.configEditor
            switch (currentLanguage) {
                case 'zh':
                    jsonSchemaUrl = app.configEditor.jsonSchemaCnUrl
                    break
                default:
                    jsonSchemaUrl = app.configEditor.jsonSchemaUrl
            }

            const response = await axios.get<IXraySchema>(jsonSchemaUrl)
            const { definitions = {} } = response.data

            HOST_JSON_FIELD_SCHEMAS.forEach(({ definition, fileMatch, uri }) => {
                const node = definitions[definition]

                if (!node) {
                    return
                }

                const properties =
                    definition === 'FinalMaskObject'
                        ? buildFinalMaskProperties(definitions)
                        : undefined

                registerJsonSchema({
                    fileMatch: [fileMatch],
                    schema: {
                        ...node,
                        ...(properties ? { type: 'object', properties } : {}),
                        definitions
                    },
                    uri
                })
            })
        } catch (error) {
            consola.error('Failed to load JSON schema:', error)
        }
    }
}

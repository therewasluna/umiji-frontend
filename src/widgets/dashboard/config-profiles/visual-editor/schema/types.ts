// Field descriptors for the visual config editor. Each descriptor maps one Xray JSON key to a control;
// the field lists mirror the JSON structs in Xray-core's infra/conf (v26.7.28, the version umiji-node ships).

export type Obj = Record<string, unknown>

export type Generator = 'mldsa65' | 'password' | 'shortId' | 'ss2022' | 'uuid' | 'x25519'

// Option lists that depend on the rest of the config (tags other parts can point at).
export type OptionSource = 'balancerTags' | 'inboundTags' | 'outboundTags' | 'snippets'

export type Option = string | { label: string; value: string }

interface FieldBase {
    full?: boolean
    hint?: string
    key: string
    label?: string
    req?: boolean
    show?: (parent: Obj) => boolean
}

export type Field =
    | (FieldBase & { gen?: Generator; kind: 'text'; placeholder?: string })
    | (FieldBase & { kind: 'bool'; defaultOn?: boolean })
    | (FieldBase & { kind: 'json'; placeholder?: string })
    | (FieldBase & { kind: 'lines'; placeholder?: string })
    | (FieldBase & { kind: 'managed' })
    | (FieldBase & { kind: 'map'; values: 'tags' | 'text' })
    | (FieldBase & { kind: 'number'; placeholder?: string })
    | (FieldBase & {
          // Accepts a number, a "from-to" range or a plain string; stores whole numbers as numbers.
          kind: 'scalar'
          placeholder?: string
      })
    | (FieldBase & {
          apply?: (parent: Obj, value: string | undefined) => Obj
          free?: boolean
          kind: 'select'
          options: Option[] | OptionSource
          placeholder?: string
      })
    | (FieldBase & {
          gen?: Generator
          kind: 'tags'
          numeric?: boolean
          options?: Option[] | OptionSource
      })
    | (FieldBase & {
          create?: () => Obj
          fields: ((item: Obj) => Field[]) | Field[]
          kind: 'list'
          title?: (item: Obj, index: number) => string
      })
    | (FieldBase & { fields: ((value: Obj, parent: Obj) => Field[]) | Field[]; kind: 'object' })

type Extra<K extends Field['kind']> = Omit<Extract<Field, { kind: K }>, 'key' | 'kind'>

export const text = (key: string, o: Extra<'text'> = {}): Field => ({ kind: 'text', key, ...o })
export const num = (key: string, o: Extra<'number'> = {}): Field => ({ kind: 'number', key, ...o })
export const bool = (key: string, o: Extra<'bool'> = {}): Field => ({ kind: 'bool', key, ...o })
export const scalar = (key: string, o: Extra<'scalar'> = {}): Field => ({
    kind: 'scalar',
    key,
    ...o
})
export const json = (key: string, o: Extra<'json'> = {}): Field => ({ kind: 'json', key, ...o })
export const lines = (key: string, o: Extra<'lines'> = {}): Field => ({ kind: 'lines', key, ...o })
export const managed = (key: string, hint: string): Field => ({ kind: 'managed', key, hint })
export const select = (
    key: string,
    options: Option[] | OptionSource,
    o: Omit<Extra<'select'>, 'options'> = {}
): Field => ({ kind: 'select', key, options, ...o })
export const tags = (key: string, o: Extra<'tags'> = {}): Field => ({ kind: 'tags', key, ...o })
export const map = (
    key: string,
    values: 'tags' | 'text' = 'text',
    o: Omit<Extra<'map'>, 'values'> = {}
): Field => ({
    kind: 'map',
    key,
    values,
    ...o
})
export const obj = (
    key: string,
    fields: Extract<Field, { kind: 'object' }>['fields'],
    o: Omit<Extra<'object'>, 'fields'> = {}
): Field => ({ kind: 'object', key, fields, ...o })
export const list = (
    key: string,
    fields: Extract<Field, { kind: 'list' }>['fields'],
    o: Omit<Extra<'list'>, 'fields'> = {}
): Field => ({ kind: 'list', key, fields, ...o })

export const resolveFields = (field: Field, value: Obj, parent: Obj): Field[] => {
    if (field.kind === 'object') {
        return typeof field.fields === 'function' ? field.fields(value, parent) : field.fields
    }
    if (field.kind === 'list') {
        return typeof field.fields === 'function' ? field.fields(value) : field.fields
    }
    return []
}

export const isObj = (v: unknown): v is Obj =>
    typeof v === 'object' && v !== null && !Array.isArray(v)

export const asObj = (v: unknown): Obj => (isObj(v) ? v : {})

export const asList = (v: unknown): unknown[] => {
    if (Array.isArray(v)) return v
    // Single objects are valid where Xray also takes an array (fakedns, for one).
    return v === undefined || v === null ? [] : [v]
}

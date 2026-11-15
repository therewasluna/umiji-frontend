import { encodeURLSafe, encode } from '@stablelib/base64'
import {
    generateMlDsa65,
    generateX25519
} from '@widgets/dashboard/config-profiles/keypair-generator/keypair-utils'

import { Generator } from './schema/types'

const bytes = (n: number) => crypto.getRandomValues(new Uint8Array(n))

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')

export const generateValue = (kind: Generator): string => {
    switch (kind) {
        case 'uuid':
            return crypto.randomUUID()
        case 'x25519':
            return generateX25519().privateKey
        case 'shortId':
            return hex(bytes(8))
        // Shadowsocks 2022 server keys are standard base64 of exactly 32 bytes (checked by the backend).
        case 'ss2022':
            return encode(bytes(32))
        case 'mldsa65':
            return generateMlDsa65().mldsa65Seed
        case 'password':
            return encodeURLSafe(bytes(18))
    }
}

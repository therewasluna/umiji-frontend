import { Badge } from '@mantine/core'
import ReactCountryFlag from 'react-country-flag'

import { IProps } from './interface'

export function ConnectedNodeColumnEntity(props: IProps) {
    const { node } = props

    if (!node) {
        return null
    }

    return (
        <Badge
            color="gray"
            leftSection={
                node.countryCode &&
                node.countryCode !== 'XX' && <ReactCountryFlag countryCode={node.countryCode} />
            }
            tt="none"
            variant="soft"
        >
            {node.name}
        </Badge>
    )
}

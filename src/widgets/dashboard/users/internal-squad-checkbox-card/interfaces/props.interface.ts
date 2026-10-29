import { IAssignableInternalSquads } from '@shared/api/hooks'

export interface IProps {
    hideEditButton?: boolean
    internalSquad: IAssignableInternalSquads['internalSquads'][number] | null
}

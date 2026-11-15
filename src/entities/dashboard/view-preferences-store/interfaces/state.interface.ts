import { HOSTS_VIEW_MODE, NODES_VIEW_MODE } from './enums'

export interface IState {
    hostsActiveTag: null | string
    hostsViewMode: HOSTS_VIEW_MODE
    nodesActiveTag: null | string
    nodesViewMode: NODES_VIEW_MODE
    sectionActiveTags: Record<string, null | string>
}

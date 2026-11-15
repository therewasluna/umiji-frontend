import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { HOSTS_VIEW_MODE, IActions, IState, NODES_VIEW_MODE } from './interfaces'

const initialState: IState = {
    nodesViewMode: NODES_VIEW_MODE.CARDS,
    nodesActiveTag: null,
    hostsViewMode: HOSTS_VIEW_MODE.CARDS,
    hostsActiveTag: null,
    sectionActiveTags: {}
}

type TLegacyState = Partial<IState> &
    Partial<
        Record<
            'experimental' | 'launcherColumns' | 'launcherPosition' | 'layoutStyle' | 'quickLinks',
            unknown
        >
    >

// Older versions also stored the layout choice, experimental toggles and launcher settings; all were removed.
const migrateState = (persistedState: unknown): IState => {
    const {
        experimental: _experimental,
        launcherColumns: _launcherColumns,
        launcherPosition: _launcherPosition,
        layoutStyle: _layoutStyle,
        quickLinks: _quickLinks,
        ...state
    } = (persistedState ?? {}) as TLegacyState

    return { ...initialState, ...state }
}

export const useViewPreferencesStore = create<IActions & IState>()(
    persist(
        devtools(
            (set) => ({
                ...initialState,
                actions: {
                    setNodesViewMode: (mode) => set({ nodesViewMode: mode }),
                    setSectionActiveTag: (section, tag) =>
                        set((state) => ({
                            sectionActiveTags: { ...state.sectionActiveTags, [section]: tag }
                        })),
                    setNodesActiveTag: (tag) => set({ nodesActiveTag: tag }),
                    setHostsViewMode: (mode) => set({ hostsViewMode: mode }),
                    setHostsActiveTag: (tag) => set({ hostsActiveTag: tag }),
                    resetState: () => set({ ...initialState })
                }
            }),
            { name: 'viewPreferencesStore', anonymousActionType: 'viewPreferencesStore' }
        ),
        {
            name: 'viewPreferencesStore',
            version: 3,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                nodesViewMode: state.nodesViewMode,
                nodesActiveTag: state.nodesActiveTag,
                hostsViewMode: state.hostsViewMode,
                hostsActiveTag: state.hostsActiveTag,
                sectionActiveTags: state.sectionActiveTags
            }),
            migrate: migrateState
        }
    )
)

export const useNodesViewMode = () => useViewPreferencesStore((state) => state.nodesViewMode)
export const useNodesActiveTag = () => useViewPreferencesStore((state) => state.nodesActiveTag)
export const useViewPreferencesStoreActions = () =>
    useViewPreferencesStore((state) => state.actions)
export const useHostsViewMode = () => useViewPreferencesStore((state) => state.hostsViewMode)
export const useHostsActiveTag = () => useViewPreferencesStore((state) => state.hostsActiveTag)

export const useSectionActiveTag = (section: string) =>
    useViewPreferencesStore((state) => state.sectionActiveTags[section] ?? null)

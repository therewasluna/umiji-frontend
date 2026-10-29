import axios from 'axios'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { sToMs } from '@shared/utils/time-utils'

const CACHE_TIME = sToMs(24 * 60 * 60)

export interface IUmijiInfo {
    latestVersion: string
    starsCount: number
}

interface IState {
    isLoading: boolean
    lastUpdateTimestamp: number
    umijiInfo: IUmijiInfo
}

interface IActions {
    actions: {
        getUmijiInfo: () => Promise<void>
        resetState: () => void
        setUmijiInfo: (info: IUmijiInfo) => void
    }
}

const initialState: IState = {
    isLoading: false,
    lastUpdateTimestamp: 0,
    umijiInfo: {
        latestVersion: '',
        starsCount: 0
    }
}

export const useUpdatesStore = create<IActions & IState>()(
    persist(
        devtools(
            (set, get) => ({
                ...initialState,
                actions: {
                    getUmijiInfo: async () => {
                        const { lastUpdateTimestamp, umijiInfo } = get()
                        const now = Date.now()

                        if (
                            lastUpdateTimestamp &&
                            now - lastUpdateTimestamp < CACHE_TIME &&
                            umijiInfo.latestVersion
                        ) {
                            return
                        }

                        try {
                            set({ isLoading: true })

                            const repoResponse = await axios.get<{
                                repo: { stars: number }
                            }>('https://ungh.cc/repos/therewasluna/umiji')

                            const versionResponse = await axios.get<{
                                release: {
                                    tag: string
                                }
                            }>('https://ungh.cc/repos/therewasluna/umiji/releases/latest')

                            set({
                                umijiInfo: {
                                    latestVersion: versionResponse.data.release.tag,
                                    starsCount: repoResponse.data.repo.stars
                                },
                                lastUpdateTimestamp: now
                            })
                        } catch {
                            // silent error
                        } finally {
                            set({ isLoading: false })
                        }
                    },

                    setUmijiInfo: (info: IUmijiInfo) => {
                        set({ umijiInfo: info, lastUpdateTimestamp: Date.now() })
                    },
                    resetState: () => {
                        set({ ...initialState })
                    }
                }
            }),
            { name: 'updatesStore', anonymousActionType: 'updatesStore' }
        ),
        {
            name: 'updatesStore',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            partialize: (state) => ({
                lastUpdateTimestamp: state.lastUpdateTimestamp,
                umijiInfo: state.umijiInfo
            })
        }
    )
)

export const useUmijiInfo = () => useUpdatesStore((state) => state.umijiInfo)
export const useLastUpdateTimestamp = () => useUpdatesStore((state) => state.lastUpdateTimestamp)
export const useIsLoadingUmijiUpdates = () => useUpdatesStore((state) => state.isLoading)
export const useUpdatesStoreActions = () => useUpdatesStore((state) => state.actions)

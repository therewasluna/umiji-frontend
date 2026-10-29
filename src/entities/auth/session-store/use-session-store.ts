import { ROLE } from '@umiji/backend-contract'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import { setAuthorizationToken } from '@shared/api'

import { IActions, ISetTokenAction, IState } from './interfaces'

export const useSessionStore = create<IActions & IState>()(
    persist(
        devtools(
            (set) => ({
                token: '',
                actions: {
                    setToken: (dto: ISetTokenAction) => {
                        set({ token: dto.token })
                    },
                    removeToken: () => {
                        set({ token: '' })
                    }
                }
            }),
            { name: 'sessionStore', anonymousActionType: 'sessionStore' }
        ),
        {
            name: 'sessionStore',
            partialize: (state) => ({
                token: state.token
            }),
            storage: createJSONStorage(() => localStorage)
        }
    )
)

useSessionStore.subscribe((state) => {
    setAuthorizationToken(state.token)
})

setAuthorizationToken(useSessionStore.getState().token)

export const useToken = () => useSessionStore((state) => state.token)

// UI hint only: the backend enforces what a broker can reach.
const getTokenRole = (token: string): null | string => {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(payload)).role ?? null
    } catch {
        return null
    }
}

export const useIsBroker = () =>
    useSessionStore((state) => getTokenRole(state.token) === ROLE.BROKER)
export const isBrokerSession = () => getTokenRole(useSessionStore.getState().token) === ROLE.BROKER
export const useSessionStoreActions = () => useSessionStore((state) => state.actions)

export const setToken = (dto: ISetTokenAction) => useSessionStore.setState({ ...dto })
export const removeToken = () => useSessionStore.getState().actions.removeToken()

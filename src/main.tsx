import { createRoot } from 'react-dom/client'

import { App } from './app'

import '@shared/utils/setup-lottie/setup-lottie'

// After a deploy, a tab opened earlier asks for page chunks that no longer exist: reload once.
window.addEventListener('vite:preloadError', (event) => {
    try {
        const last = Number(sessionStorage.getItem('chunk-reload-at') ?? 0)
        if (Date.now() - last < 10_000) return
        sessionStorage.setItem('chunk-reload-at', String(Date.now()))
    } catch {
        return // no storage to guard against a reload loop: let the error show instead
    }
    event.preventDefault()
    window.location.reload()
})

const root = createRoot(document.getElementById('root')!)
root.render(<App />)

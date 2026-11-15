import { useEffect, useState } from 'react'

interface IViewportBox {
    height: number
    top: number
}

// A phone keyboard shrinks only the visual viewport, so the full-screen window follows it to keep the prompt in view.
export function useVisualViewport(isEnabled: boolean): IViewportBox | null {
    const [box, setBox] = useState<IViewportBox | null>(null)

    useEffect(() => {
        const viewport = window.visualViewport
        if (!isEnabled || !viewport) return undefined

        const update = () => setBox({ height: viewport.height, top: viewport.offsetTop })

        update()
        viewport.addEventListener('resize', update)
        viewport.addEventListener('scroll', update)

        return () => {
            viewport.removeEventListener('resize', update)
            viewport.removeEventListener('scroll', update)
        }
    }, [isEnabled])

    return isEnabled ? box : null
}

import { useEffect, useRef, useState } from 'react'
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb'

import classes from './visual-editor.module.css'

type Edges = { end: boolean; start: boolean }

// Tracks whether a horizontal scroller has hidden content before/after the visible part (RTL-safe).
export function useScrollEdges<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [edges, setEdges] = useState<Edges>({ end: false, start: false })

    useEffect(() => {
        const el = ref.current
        if (!el) return undefined

        const update = () => {
            const x = Math.abs(el.scrollLeft)
            const start = x > 1
            const end = x + el.clientWidth < el.scrollWidth - 1
            setEdges((prev) => (prev.start === start && prev.end === end ? prev : { end, start }))
        }
        update()
        el.addEventListener('scroll', update, { passive: true })
        const observer = new ResizeObserver(update)
        observer.observe(el)
        for (const child of el.children) observer.observe(child)

        return () => {
            el.removeEventListener('scroll', update)
            observer.disconnect()
        }
    }, [])

    const scroll = (towards: keyof Edges) => {
        const el = ref.current
        if (!el) return
        const rtl = getComputedStyle(el).direction === 'rtl' ? -1 : 1
        const sign = towards === 'end' ? 1 : -1
        el.scrollBy({ behavior: 'smooth', left: sign * rtl * el.clientWidth * 0.6 })
    }

    return { edges, ref, scroll }
}

// Fade + arrow at each side that has more to scroll. Mouse affordance only: keyboard focus scrolls on its own.
export function ScrollEdges({
    edges,
    scroll
}: Pick<ReturnType<typeof useScrollEdges>, 'edges' | 'scroll'>) {
    return (['start', 'end'] as const).map((side) => (
        <div
            aria-hidden
            className={classes.edge}
            data-side={side}
            data-visible={edges[side] || undefined}
            key={side}
        >
            <button
                className={classes.edgeButton}
                onClick={() => scroll(side)}
                tabIndex={-1}
                type="button"
            >
                {side === 'start' ? <TbChevronLeft size={16} /> : <TbChevronRight size={16} />}
            </button>
        </div>
    ))
}

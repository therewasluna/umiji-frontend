import { Text } from '@mantine/core'
import { CSSProperties, ReactNode } from 'react'

import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'

import classes from './stat-strip.module.css'

export interface IStatStripCell {
    color?: string
    footer?: ReactNode
    label: string
    value: ReactNode
}

interface IProps {
    cells: IStatStripCell[]
    isLoading?: boolean
    /**
     * Small screens: a 2-column grid (default), or every cell on a single line ('row').
     * 'stack' is for values that need room, like a full date: one column on a phone, two until four fit.
     */
    phoneLayout?: 'grid' | 'row' | 'stack'
}

// One panel split into cells: a label (with an optional state dot) over a value and an optional footer.
export function StatStripShared({ cells, isLoading, phoneLayout = 'grid' }: IProps) {
    return (
        <div
            className={classes.strip}
            data-odd={cells.length % 2 === 1 || undefined}
            data-phone={phoneLayout}
            style={{ '--strip-cols': cells.length } as CSSProperties}
        >
            {cells.map((cell) => (
                <div className={classes.cell} key={cell.label}>
                    <span className={classes.label}>
                        {cell.color && (
                            <span className={classes.dot} style={{ background: cell.color }} />
                        )}
                        <span className={classes.labelText}>{cell.label}</span>
                    </span>
                    {isLoading ? (
                        <ShimmerSkeleton height={30} width={60} />
                    ) : (
                        <>
                            <Text className={classes.value} component="div">
                                {/* Direction comes from the value: numbers and GiB read LTR, a Persian date RTL. */}
                                <bdi>{cell.value}</bdi>
                            </Text>
                            {cell.footer && <div className={classes.footer}>{cell.footer}</div>}
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}

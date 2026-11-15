import rowsClasses from './mrt-rows.module.css'
import { CardTitle } from './table.card-titile'
import { TableContainerShared } from './table.container.shared'
import { DataTableContent } from './table.table-content'

export const DataTableShared = {
    Title: CardTitle,
    Container: TableContainerShared,
    Content: DataTableContent
}

// Pass as mantinePaperProps.className so a table renders as rounded rows (see mrt-rows.module.css).
export const MRT_ROWS_CLASS = rowsClasses.rows

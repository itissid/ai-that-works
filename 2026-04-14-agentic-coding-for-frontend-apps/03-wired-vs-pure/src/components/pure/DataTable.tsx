import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Column } from '../../types'

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  isLoading: boolean
  emptyMessage?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data available',
  sortColumn,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  const SortIcon = ({ col }: { col: string }) => {
    if (!onSort) return null
    if (sortColumn !== col) return <ChevronsUpDown className="size-3 text-muted-foreground" />
    if (sortDirection === 'asc') return <ChevronUp className="size-3 text-accent" />
    return <ChevronDown className="size-3 text-accent" />
  }

  return (
    <div className="border border-border font-mono w-full overflow-hidden" style={{ borderRadius: '0.5rem' }}>
      {/* Table header */}
      <div
        className="grid border-b border-border bg-secondary text-xs text-muted-foreground uppercase tracking-wider"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn(
              'px-4 py-2 flex items-center gap-1',
              col.sortable && onSort && 'cursor-pointer hover:text-foreground select-none',
            )}
            onClick={() => col.sortable && onSort?.(col.key)}
          >
            {col.label}
            {col.sortable && <SortIcon col={col.key} />}
          </div>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="grid border-b border-border last:border-0"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map((col) => (
                <div key={col.key} className="px-4 py-3">
                  <div
                    className="h-3 bg-border animate-pulse"
                    style={{ width: `${50 + Math.random() * 30}%` }}
                  />
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Data rows */}
      {!isLoading && data.length > 0 && (
        <>
          {data.map((row, idx) => (
            <div
              key={idx}
              className="grid border-b border-border last:border-0 hover:bg-accent/5 transition-colors text-sm"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map((col) => (
                <div key={col.key} className="px-4 py-3 truncate text-foreground">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '')}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Empty state */}
      {!isLoading && data.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          <span className="text-accent">&gt; </span>
          {emptyMessage}
        </div>
      )}
    </div>
  )
}

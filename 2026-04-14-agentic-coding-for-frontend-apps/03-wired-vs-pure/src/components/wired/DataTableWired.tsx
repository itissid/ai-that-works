import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '../pure/DataTable'
import { Badge } from '../badge'
import { cn } from '../../lib/utils'
import type { User, Column } from '../../types'

const statusColors: Record<User['status'], string> = {
  active: 'text-[var(--terminal-success)] border-[var(--terminal-success)] bg-[var(--terminal-success)]/10',
  inactive: 'text-muted-foreground border-border',
  suspended: 'text-[var(--terminal-error)] border-[var(--terminal-error)] bg-[var(--terminal-error)]/10',
}

const roleColors: Record<User['role'], string> = {
  admin: 'text-[var(--terminal-accent)] border-[var(--terminal-accent)] bg-[var(--terminal-accent)]/10',
  editor: 'text-[var(--terminal-warning)] border-[var(--terminal-warning)] bg-[var(--terminal-warning)]/10',
  viewer: 'text-muted-foreground border-border',
}

const columns: Column<Record<string, unknown>>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    render: (value) => (
      <span className={cn('text-xs uppercase border px-1.5 py-0.5', roleColors[value as User['role']])}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span className={cn('text-xs uppercase border px-1.5 py-0.5', statusColors[value as User['status']])}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => (
      <span className="text-muted-foreground text-xs">
        {new Date(String(value)).toLocaleDateString()}
      </span>
    ),
  },
]

export function DataTableWired() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3035/api/users?q=')
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const users: User[] = await res.json()
      setData(users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aVal = String(a[sortColumn as keyof User] ?? '')
    const bVal = String(b[sortColumn as keyof User] ?? '')
    const cmp = aVal.localeCompare(bVal)
    return sortDirection === 'asc' ? cmp : -cmp
  })

  return (
    <div className="flex flex-col gap-3 font-mono">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-accent text-xs uppercase tracking-widest">ALL USERS</span>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">[{data.length} records]</span>
        )}
      </div>
      {error && (
        <div className="border border-destructive bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}
      <DataTable
        data={sortedData as unknown as Record<string, unknown>[]}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found"
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}

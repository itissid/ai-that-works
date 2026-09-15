import { useState, useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from '../src/components/pure/DataTable'
import { cn } from '../src/lib/utils'
import type { User, Column } from '../src/types'

const statusColors: Record<User['status'], string> = {
  active: 'text-[var(--terminal-success)] border-[var(--terminal-success)]',
  inactive: 'text-muted-foreground border-border',
  suspended: 'text-[var(--terminal-error)] border-[var(--terminal-error)]',
}

const roleColors: Record<User['role'], string> = {
  admin: 'text-[var(--terminal-accent)] border-[var(--terminal-accent)]',
  editor: 'text-[var(--terminal-warning)] border-[var(--terminal-warning)]',
  viewer: 'text-muted-foreground border-border',
}

const userColumns: Column<Record<string, unknown>>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    render: (value: unknown) => (
      <span className={cn('text-xs uppercase border px-1.5 py-0.5', roleColors[value as User['role']])}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown) => (
      <span className={cn('text-xs uppercase border px-1.5 py-0.5', statusColors[value as User['status']])}>
        {String(value)}
      </span>
    ),
  },
]

const mockUsers: Record<string, unknown>[] = [
  { id: 'u1', name: 'Jordan Mitchell', email: 'jordan@example.com', role: 'admin', status: 'active', createdAt: '2024-01-15' },
  { id: 'u2', name: 'Sam Rivera', email: 'sam@example.com', role: 'editor', status: 'active', createdAt: '2024-02-20' },
  { id: 'u3', name: 'Alex Johnson', email: 'alex@example.com', role: 'viewer', status: 'inactive', createdAt: '2024-03-10' },
  { id: 'u4', name: 'Morgan Chen', email: 'morgan@example.com', role: 'editor', status: 'active', createdAt: '2024-04-05' },
  { id: 'u5', name: 'Taylor Reyes', email: 'taylor@example.com', role: 'viewer', status: 'suspended', createdAt: '2024-05-01' },
  { id: 'u6', name: 'Casey Park', email: 'casey@example.com', role: 'admin', status: 'active', createdAt: '2024-06-12' },
  { id: 'u7', name: 'Devon Blake', email: 'devon@example.com', role: 'viewer', status: 'active', createdAt: '2024-07-08' },
  { id: 'u8', name: 'Avery Quinn', email: 'avery@example.com', role: 'editor', status: 'inactive', createdAt: '2024-08-22' },
]

function SortableDataTable() {
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sorted = [...mockUsers].sort((a, b) => {
    const aVal = String(a[sortColumn] ?? '')
    const bVal = String(b[sortColumn] ?? '')
    return sortDirection === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal)
  })

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
        Click any column header to sort. Click again to reverse direction.
      </div>
      <DataTable
        data={sorted}
        columns={userColumns}
        isLoading={false}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}

function LoadThenDisplay() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
        Simulates a 2-second API fetch, then shows data. No real network call.
      </div>
      <DataTable
        data={isLoading ? [] : mockUsers}
        columns={userColumns}
        isLoading={isLoading}
      />
    </div>
  )
}

function FilterableDataTable() {
  const [filter, setFilter] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filtered = mockUsers.filter((u) => {
    const q = filter.toLowerCase()
    return (
      String(u.name).toLowerCase().includes(q) ||
      String(u.email).toLowerCase().includes(q) ||
      String(u.role).toLowerCase().includes(q) ||
      String(u.status).toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const aVal = String(a[sortColumn] ?? '')
    const bVal = String(b[sortColumn] ?? '')
    return sortDirection === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal)
  })

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
        Type to filter rows. Sorting still works. Try "admin" or "inactive".
      </div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter users..."
        className="mb-3 w-full bg-background border border-border text-foreground text-sm px-3 py-2 font-mono placeholder:text-muted-foreground outline-none focus:border-ring"
      />
      <DataTable
        data={sorted}
        columns={userColumns}
        isLoading={false}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No users match your filter"
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Interactive/DataTable',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const Sorting: StoryObj = {
  name: 'Click to sort',
  render: () => <SortableDataTable />,
}

export const LoadingToData: StoryObj = {
  name: 'Loading → data transition',
  render: () => <LoadThenDisplay />,
}

export const FilterAndSort: StoryObj = {
  name: 'Filter + sort combined',
  render: () => <FilterableDataTable />,
}

import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DataTable } from '../src/components/pure/DataTable'
import { cn } from '../src/lib/utils'
import type { User } from '../src/types'

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

const userColumns = [
  { key: 'name' as const, label: 'Name', sortable: true },
  { key: 'email' as const, label: 'Email', sortable: true },
  {
    key: 'role' as const,
    label: 'Role',
    sortable: true,
    render: (value: unknown) => (
      <span className={cn('text-xs uppercase border px-1.5 py-0.5', roleColors[value as User['role']])}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'status' as const,
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
  { id: 'u1', name: 'Jordan Mitchell', email: 'jordan@example.com', role: 'admin', status: 'active' },
  { id: 'u2', name: 'Sam Rivera', email: 'sam@example.com', role: 'editor', status: 'active' },
  { id: 'u3', name: 'Alex Johnson', email: 'alex@example.com', role: 'viewer', status: 'inactive' },
  { id: 'u4', name: 'Morgan Chen', email: 'morgan@example.com', role: 'editor', status: 'active' },
  { id: 'u5', name: 'Taylor Reyes', email: 'taylor@example.com', role: 'viewer', status: 'suspended' },
]

const meta: Meta<typeof DataTable> = {
  title: 'Pure/DataTable',
  component: DataTable,
  args: {
    onSort: fn(),
    data: mockUsers,
    columns: userColumns as never,
    isLoading: false,
  },
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  name: 'Default — with data',
  args: {
    data: mockUsers,
    isLoading: false,
    sortColumn: 'name',
    sortDirection: 'asc',
  },
}

export const Loading: Story = {
  name: 'Loading skeleton',
  args: {
    data: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  name: 'Empty state',
  args: {
    data: [],
    isLoading: false,
    emptyMessage: 'No users match your search criteria',
  },
}

export const SortedAscending: Story = {
  name: 'Sorted by name ASC',
  args: {
    data: [...mockUsers].sort((a, b) => String(a.name).localeCompare(String(b.name))),
    isLoading: false,
    sortColumn: 'name',
    sortDirection: 'asc',
  },
}

export const SortedDescending: Story = {
  name: 'Sorted by name DESC',
  args: {
    data: [...mockUsers].sort((a, b) => String(b.name).localeCompare(String(a.name))),
    isLoading: false,
    sortColumn: 'name',
    sortDirection: 'desc',
  },
}

export const SingleRow: Story = {
  name: 'Single row',
  args: {
    data: [mockUsers[0]],
    isLoading: false,
  },
}

export const NoSorting: Story = {
  name: 'No sort handlers (read-only)',
  args: {
    data: mockUsers,
    isLoading: false,
    onSort: undefined,
  },
}

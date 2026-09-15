import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { UserSearchForm } from '../src/components/pure/UserSearchForm'
import type { User } from '../src/types'

const mockUsers: User[] = [
  {
    id: 'usr_001',
    name: 'Jordan Mitchell',
    email: 'jordan.mitchell@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'usr_002',
    name: 'Sam Rivera',
    email: 'sam.rivera@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2024-02-20T14:15:00Z',
  },
  {
    id: 'usr_003',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2023-11-05T09:00:00Z',
  },
]

const meta: Meta<typeof UserSearchForm> = {
  title: 'Pure/UserSearchForm',
  component: UserSearchForm,
  args: {
    onQueryChange: fn(),
    onSubmit: fn(),
    onSelectUser: fn(),
    onClearSelection: fn(),
    query: '',
    users: [],
    isLoading: false,
    error: null,
    selectedUser: null,
    queryError: null,
    hasSearched: false,
    resultCount: 0,
  },
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof UserSearchForm>

export const Empty: Story = {
  name: 'Empty (initial state)',
  args: {
    query: '',
    users: [],
    isLoading: false,
    hasSearched: false,
  },
}

export const Typing: Story = {
  name: 'Typing — validation error',
  args: {
    query: 'j',
    queryError: 'Min 2 characters',
    users: [],
    hasSearched: false,
  },
}

export const Loading: Story = {
  name: 'Loading — search in flight',
  args: {
    query: 'jordan',
    isLoading: true,
    users: [],
    hasSearched: false,
  },
}

export const WithResults: Story = {
  name: 'With Results',
  args: {
    query: 'jordan',
    users: mockUsers,
    isLoading: false,
    hasSearched: true,
    resultCount: mockUsers.length,
  },
}

export const NoResults: Story = {
  name: 'No Results',
  args: {
    query: 'zzzzz',
    users: [],
    isLoading: false,
    hasSearched: true,
    resultCount: 0,
  },
}

export const ErrorState: Story = {
  name: 'Error — network failure',
  args: {
    query: 'jordan',
    users: [],
    isLoading: false,
    error: 'Network error: Failed to fetch. Is the server running?',
    hasSearched: true,
    resultCount: 0,
  },
}

export const WithSelectedUser: Story = {
  name: 'With Selected User',
  args: {
    query: 'jordan',
    users: mockUsers,
    isLoading: false,
    hasSearched: true,
    resultCount: mockUsers.length,
    selectedUser: mockUsers[0],
  },
}

export const SingleResult: Story = {
  name: 'Single Result',
  args: {
    query: 'jordan.mitchell',
    users: [mockUsers[0]],
    isLoading: false,
    hasSearched: true,
    resultCount: 1,
  },
}

export const SuspendedUserSelected: Story = {
  name: 'Suspended User Selected',
  args: {
    query: 'suspended',
    users: [
      {
        id: 'usr_099',
        name: 'Charlie Banned',
        email: 'charlie.banned@example.com',
        role: 'viewer',
        status: 'suspended',
        createdAt: '2023-06-01T00:00:00Z',
      },
    ],
    isLoading: false,
    hasSearched: true,
    resultCount: 1,
    selectedUser: {
      id: 'usr_099',
      name: 'Charlie Banned',
      email: 'charlie.banned@example.com',
      role: 'viewer',
      status: 'suspended',
      createdAt: '2023-06-01T00:00:00Z',
    },
  },
}

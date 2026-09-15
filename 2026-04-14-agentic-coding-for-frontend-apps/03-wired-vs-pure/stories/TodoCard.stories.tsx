import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TodoCard } from '../src/components/pure/TodoCard'
import type { Todo } from '../src/types'

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

const baseTodo: Todo = {
  id: 'todo_001',
  title: 'Review and approve pull request #42: Add authentication middleware',
  status: 'pending',
  priority: 'medium',
  dueDate: nextWeek,
  userId: 'usr_001',
}

const meta: Meta<typeof TodoCard> = {
  title: 'Pure/TodoCard',
  component: TodoCard,
  args: {
    todo: baseTodo,
    onToggleStatus: fn(),
    onDelete: fn(),
    isDeleting: false,
    isToggling: false,
  },
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TodoCard>

export const Pending: Story = {
  name: 'Pending',
  args: {
    todo: { ...baseTodo, status: 'pending' },
  },
}

export const InProgress: Story = {
  name: 'In Progress',
  args: {
    todo: { ...baseTodo, status: 'in-progress', priority: 'high' },
  },
}

export const Completed: Story = {
  name: 'Completed',
  args: {
    todo: {
      ...baseTodo,
      title: 'Set up CI/CD pipeline for staging environment',
      status: 'completed',
      priority: 'low',
    },
  },
}

export const Cancelled: Story = {
  name: 'Cancelled',
  args: {
    todo: {
      ...baseTodo,
      title: 'Migrate database to PostgreSQL 16',
      status: 'cancelled',
      priority: 'medium',
    },
  },
}

export const CriticalPriority: Story = {
  name: 'Critical priority',
  args: {
    todo: {
      ...baseTodo,
      title: 'Fix production memory leak — site down!',
      status: 'in-progress',
      priority: 'critical',
      dueDate: today,
    },
  },
}

export const Overdue: Story = {
  name: 'Overdue',
  args: {
    todo: {
      ...baseTodo,
      title: 'Update API documentation for v3 endpoints',
      status: 'pending',
      priority: 'high',
      dueDate: yesterday,
    },
  },
}

export const NoDueDate: Story = {
  name: 'No due date',
  args: {
    todo: {
      ...baseTodo,
      title: 'Refactor auth service to use JWT tokens',
      status: 'pending',
      priority: 'low',
      dueDate: null,
    },
  },
}

export const Deleting: Story = {
  name: 'Deleting (loading)',
  args: {
    todo: baseTodo,
    isDeleting: true,
  },
}

export const Toggling: Story = {
  name: 'Toggling status (loading)',
  args: {
    todo: baseTodo,
    isToggling: true,
  },
}

export const ReadOnly: Story = {
  name: 'Read-only (no actions)',
  args: {
    todo: baseTodo,
    onToggleStatus: undefined,
    onDelete: undefined,
  },
}

export const MultipleCards: Story = {
  name: 'Multiple cards — all states',
  render: () => (
    <div className="flex flex-col gap-2" style={{ maxWidth: 500 }}>
      <TodoCard
        todo={{ ...baseTodo, id: '1', status: 'pending', title: 'Write unit tests for auth module', priority: 'medium' }}
        onToggleStatus={fn()}
        onDelete={fn()}
      />
      <TodoCard
        todo={{ ...baseTodo, id: '2', status: 'in-progress', title: 'Implement rate limiting', priority: 'high', dueDate: today }}
        onToggleStatus={fn()}
        onDelete={fn()}
      />
      <TodoCard
        todo={{ ...baseTodo, id: '3', status: 'completed', title: 'Deploy to staging', priority: 'low' }}
        onToggleStatus={fn()}
        onDelete={fn()}
      />
      <TodoCard
        todo={{ ...baseTodo, id: '4', status: 'pending', title: 'Security audit review', priority: 'critical', dueDate: yesterday }}
        onToggleStatus={fn()}
        onDelete={fn()}
      />
      <TodoCard
        todo={{ ...baseTodo, id: '5', status: 'cancelled', title: 'Upgrade Node.js to v22', priority: 'medium' }}
        onToggleStatus={fn()}
        onDelete={fn()}
      />
    </div>
  ),
}

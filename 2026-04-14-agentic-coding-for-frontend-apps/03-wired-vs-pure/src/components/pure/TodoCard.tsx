import * as React from 'react'
import { Trash2, CheckCircle2, Circle, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '../button'
import { cn } from '../../lib/utils'
import type { Todo } from '../../types'

export interface TodoCardProps {
  todo: Todo
  onToggleStatus?: () => void
  onDelete?: () => void
  isDeleting?: boolean
  isToggling?: boolean
}

const statusConfig: Record<
  Todo['status'],
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'PENDING',
    className: 'text-[var(--terminal-fg-dim)] border-[var(--terminal-border)]',
    icon: <Circle className="size-3" />,
  },
  'in-progress': {
    label: 'IN PROGRESS',
    className: 'text-[var(--terminal-warning)] border-[var(--terminal-warning)]',
    icon: <Clock className="size-3" />,
  },
  completed: {
    label: 'COMPLETED',
    className: 'text-[var(--terminal-success)] border-[var(--terminal-success)]',
    icon: <CheckCircle2 className="size-3" />,
  },
  cancelled: {
    label: 'CANCELLED',
    className: 'text-[var(--terminal-error)] border-[var(--terminal-error)]',
    icon: <AlertTriangle className="size-3" />,
  },
}

const priorityConfig: Record<
  Todo['priority'],
  { label: string; className: string }
> = {
  low: {
    label: 'LOW',
    className: 'text-[var(--terminal-fg-dim)] border-[var(--terminal-border)]',
  },
  medium: {
    label: 'MED',
    className: 'text-[var(--terminal-accent)] border-[var(--terminal-accent)]',
  },
  high: {
    label: 'HIGH',
    className: 'text-[var(--terminal-warning)] border-[var(--terminal-warning)]',
  },
  critical: {
    label: 'CRIT',
    className: 'text-[var(--terminal-error)] border-[var(--terminal-error)] animate-pulse-error',
  },
}

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate) return false
  if (todo.status === 'completed' || todo.status === 'cancelled') return false
  return new Date(todo.dueDate) < new Date()
}

export function TodoCard({ todo, onToggleStatus, onDelete, isDeleting, isToggling }: TodoCardProps) {
  const status = statusConfig[todo.status]
  const priority = priorityConfig[todo.priority]
  const overdue = isOverdue(todo)

  return (
    <div
      className={cn(
        'border border-border bg-card font-mono text-sm transition-all',
        isDeleting && 'opacity-50',
        todo.status === 'completed' && 'opacity-70',
        overdue && 'border-[var(--terminal-error)]/50',
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Toggle button */}
        <button
          onClick={onToggleStatus}
          disabled={isToggling || isDeleting || todo.status === 'cancelled'}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="toggle status"
        >
          {isToggling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            status.icon
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-foreground leading-snug',
                todo.status === 'completed' && 'line-through text-muted-foreground',
              )}
            >
              {todo.title}
            </p>
            {/* Delete button */}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={isDeleting || isToggling}
                className="size-6 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Trash2 className="size-3" />
                )}
              </Button>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Status badge */}
            <span
              className={cn(
                'text-xs border px-1.5 py-0.5 flex items-center gap-1 uppercase tracking-wider',
                status.className,
              )}
            >
              {status.label}
            </span>

            {/* Priority badge */}
            <span
              className={cn(
                'text-xs border px-1.5 py-0.5 uppercase tracking-wider',
                priority.className,
              )}
            >
              P: {priority.label}
            </span>

            {/* Due date */}
            {todo.dueDate && (
              <span
                className={cn(
                  'text-xs',
                  overdue ? 'text-[var(--terminal-error)]' : 'text-muted-foreground',
                )}
              >
                {overdue && <AlertTriangle className="size-3 inline mr-1" />}
                DUE: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

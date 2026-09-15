import * as React from 'react'
import { Search, X, User, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '../button'
import { Input } from '../input'
import { Badge } from '../badge'
import { Card, CardHeader, CardTitle, CardContent } from '../card'
import { cn } from '../../lib/utils'
import type { User as UserType } from '../../types'

export interface UserSearchFormProps {
  // Search state
  query: string
  onQueryChange: (query: string) => void
  onSubmit: () => void

  // Results state
  users: UserType[]
  isLoading: boolean
  error: string | null

  // Selection state
  selectedUser: UserType | null
  onSelectUser: (user: UserType) => void
  onClearSelection: () => void

  // Validation
  queryError: string | null

  // Derived states
  hasSearched: boolean
  resultCount: number
}

const statusColors: Record<UserType['status'], string> = {
  active: 'text-[var(--terminal-success)] border-[var(--terminal-success)]',
  inactive: 'text-[var(--terminal-fg-dim)] border-[var(--terminal-border)]',
  suspended: 'text-[var(--terminal-error)] border-[var(--terminal-error)]',
}

const roleColors: Record<UserType['role'], string> = {
  admin: 'text-[var(--terminal-accent)] border-[var(--terminal-accent)]',
  editor: 'text-[var(--terminal-warning)] border-[var(--terminal-warning)]',
  viewer: 'text-[var(--terminal-fg-dim)] border-[var(--terminal-border)]',
}

export function UserSearchForm({
  query,
  onQueryChange,
  onSubmit,
  users,
  isLoading,
  error,
  selectedUser,
  onSelectUser,
  onClearSelection,
  queryError,
  hasSearched,
  resultCount,
}: UserSearchFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl font-mono">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-accent text-xs uppercase tracking-widest">USER SEARCH</span>
        {hasSearched && (
          <Badge
            className={cn(
              'text-xs border rounded-none',
              resultCount > 0
                ? 'text-[var(--terminal-success)] border-[var(--terminal-success)] bg-[var(--terminal-success)]/10'
                : 'text-[var(--terminal-fg-dim)] border-border',
            )}
          >
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="search by name or email..."
              className={cn('pl-9', queryError && 'border-destructive')}
              aria-invalid={!!queryError}
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !!queryError || query.length === 0}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {queryError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3" />
            {queryError}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="border border-border">
          <div className="border-b border-border px-4 py-2 bg-secondary">
            <div className="h-3 w-48 bg-border animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <div className="h-3 w-32 bg-border animate-pulse" />
              <div className="h-3 w-48 bg-border animate-pulse" />
              <div className="h-3 w-16 bg-border animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      {!isLoading && hasSearched && users.length > 0 && (
        <div className="border border-border">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-4 py-2 bg-secondary text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {/* Table rows */}
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={cn(
                'w-full grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-4 py-3 text-left text-sm border-b border-border last:border-0 transition-colors',
                'hover:bg-accent/10 cursor-pointer',
                selectedUser?.id === user.id && 'bg-accent/20 border-l-2 border-l-accent',
              )}
            >
              <span className="text-foreground truncate">{user.name}</span>
              <span className="text-muted-foreground truncate">{user.email}</span>
              <span className={cn('text-xs uppercase', roleColors[user.role])}>{user.role}</span>
              <span className={cn('text-xs uppercase', statusColors[user.status])}>{user.status}</span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && hasSearched && users.length === 0 && !error && (
        <div className="border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          <span className="text-accent">&gt; </span>
          no results for &quot;{query}&quot;
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasSearched && !error && (
        <div className="border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          enter a search query to find users
        </div>
      )}

      {/* Selected User Detail */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Selected User
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClearSelection}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Name</span>
                <p className="text-foreground mt-0.5">{selectedUser.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Email</span>
                <p className="text-foreground mt-0.5">{selectedUser.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Role</span>
                <p className={cn('mt-0.5 uppercase text-xs', roleColors[selectedUser.role])}>
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                <p className={cn('mt-0.5 uppercase text-xs', statusColors[selectedUser.status])}>
                  {selectedUser.status}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">ID</span>
                <p className="text-muted-foreground mt-0.5 text-xs">{selectedUser.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Created</span>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

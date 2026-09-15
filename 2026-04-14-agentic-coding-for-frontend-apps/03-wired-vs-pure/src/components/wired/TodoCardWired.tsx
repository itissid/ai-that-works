import { useState, useEffect } from 'react'
import { TodoCard } from '../pure/TodoCard'
import { Input } from '../input'
import { Button } from '../button'
import { Search, RefreshCw } from 'lucide-react'
import type { Todo } from '../../types'

export function TodoCardWired({ userId }: { userId?: string }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [userIdInput, setUserIdInput] = useState(userId ?? '')
  const [activeUserId, setActiveUserId] = useState(userId ?? '')

  const fetchTodos = async (uid: string) => {
    if (!uid) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:3035/api/todos?userId=${encodeURIComponent(uid)}`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data: Todo[] = await res.json()
      setTodos(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch todos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeUserId) fetchTodos(activeUserId)
  }, [activeUserId])

  const handleToggle = async (todo: Todo) => {
    setTogglingId(todo.id)
    const nextStatus: Todo['status'] =
      todo.status === 'pending'
        ? 'in-progress'
        : todo.status === 'in-progress'
          ? 'completed'
          : 'pending'

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: nextStatus } : t)),
    )
    // In a real app, call PATCH /api/todos/:id here
    await new Promise((r) => setTimeout(r, 400))
    setTogglingId(null)
  }

  const handleDelete = async (todo: Todo) => {
    setDeletingId(todo.id)
    // In a real app, call DELETE /api/todos/:id here
    await new Promise((r) => setTimeout(r, 600))
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-3 font-mono max-w-lg">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-accent text-xs uppercase tracking-widest">TODOS</span>
        {todos.length > 0 && (
          <span className="text-xs text-muted-foreground">[{todos.length} items]</span>
        )}
      </div>

      {/* User ID input */}
      <div className="flex gap-2">
        <Input
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setActiveUserId(userIdInput)
          }}
          placeholder="enter user id..."
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setActiveUserId(userIdInput)}
          disabled={isLoading}
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fetchTodos(activeUserId)}
          disabled={isLoading || !activeUserId}
          title="Refresh"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="border border-destructive bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border px-4 py-3">
              <div className="h-3 w-3/4 bg-border animate-pulse mb-2" />
              <div className="h-2 w-1/3 bg-border animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && todos.length === 0 && activeUserId && !error && (
        <div className="border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          no todos found for this user
        </div>
      )}

      {!isLoading && !activeUserId && (
        <div className="border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          enter a user id to view todos
        </div>
      )}

      {!isLoading && todos.length > 0 && (
        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleStatus={() => handleToggle(todo)}
              onDelete={() => handleDelete(todo)}
              isDeleting={deletingId === todo.id}
              isToggling={togglingId === todo.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

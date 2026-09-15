import { useState } from 'react'
import { UserSearchForm } from '../pure/UserSearchForm'
import type { User } from '../../types'

export function UserSearchFormWired() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSubmit = async () => {
    if (query.length < 2) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:3035/api/users?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setUsers(data)
      setHasSearched(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch users')
      setUsers([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserSearchForm
      query={query}
      onQueryChange={setQuery}
      onSubmit={handleSubmit}
      users={users}
      isLoading={isLoading}
      error={error}
      selectedUser={selectedUser}
      onSelectUser={setSelectedUser}
      onClearSelection={() => setSelectedUser(null)}
      queryError={query.length > 0 && query.length < 2 ? 'Min 2 characters' : null}
      hasSearched={hasSearched}
      resultCount={users.length}
    />
  )
}

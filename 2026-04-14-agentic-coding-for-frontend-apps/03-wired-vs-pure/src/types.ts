export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

export interface Todo {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: string | null
  userId: string
}

export interface Column<T> {
  key: keyof T & string
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

import type React from 'react'

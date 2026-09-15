import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

// --- Seeded random number generator ---
function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// --- Data generation ---
const FIRST_NAMES = [
  'Jordan', 'Alex', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Skyler', 'Parker', 'Blake', 'Drew', 'Cameron', 'Devon', 'Reese', 'Logan',
  'Finley', 'Hayden', 'Rowan', 'Sawyer', 'Charlie', 'Sam', 'Jamie', 'Robin',
  'Bailey', 'Peyton', 'Kendall', 'Dana', 'Harper', 'Elliot',
]

const LAST_NAMES = [
  'Mitchell', 'Rivera', 'Johnson', 'Chen', 'Reyes', 'Thompson', 'Garcia',
  'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris',
  'Martin', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Young', 'Allen',
  'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter',
]

const TODO_TITLES = [
  'Review and approve pull request #%d: Add authentication middleware',
  'Write unit tests for the %s service',
  'Update API documentation for v%d endpoints',
  'Fix production memory leak in %s module',
  'Migrate database schema for %s feature',
  'Refactor %s component to use React hooks',
  'Set up CI/CD pipeline for %s environment',
  'Implement rate limiting on %s endpoint',
  'Security audit review for %s service',
  'Deploy %s to staging environment',
  'Code review: %s integration',
  'Performance optimization for %s queries',
  'Add error handling to %s flow',
  'Implement caching for %s API calls',
  'Create onboarding documentation for %s',
  'Debug flaky tests in %s suite',
  'Upgrade %s dependency to latest version',
  'Configure monitoring alerts for %s',
  'Implement feature flags for %s rollout',
  'Data migration: %s to new schema',
]

const SERVICES = [
  'auth', 'payment', 'notification', 'search', 'analytics',
  'user', 'billing', 'email', 'dashboard', 'admin',
]

const ROLES = ['admin', 'editor', 'viewer'] as const
const STATUSES = ['active', 'inactive', 'suspended'] as const
const TODO_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'] as const
const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

function generateUsers() {
  const rng = seededRng(42)
  const users = []

  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@example.com`
    const role = ROLES[Math.floor(rng() * ROLES.length)]
    const status = STATUSES[Math.floor(rng() * STATUSES.length)]

    // Random date in the last 2 years
    const daysAgo = Math.floor(rng() * 730)
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString()

    users.push({
      id: `usr_${String(i + 1).padStart(3, '0')}`,
      name,
      email,
      role,
      status,
      createdAt,
    })
  }

  return users
}

function generateTodos(userId: string, userIndex: number) {
  const rng = seededRng(userIndex * 137 + 7)
  const count = 5 + Math.floor(rng() * 6) // 5-10 todos
  const todos = []

  for (let i = 0; i < count; i++) {
    const templateIdx = Math.floor(rng() * TODO_TITLES.length)
    let title = TODO_TITLES[templateIdx]
    // Fill in template placeholders
    title = title
      .replace('%d', String(Math.floor(rng() * 200) + 1))
      .replace('%s', SERVICES[Math.floor(rng() * SERVICES.length)])

    const status = TODO_STATUSES[Math.floor(rng() * TODO_STATUSES.length)]
    const priority = PRIORITIES[Math.floor(rng() * PRIORITIES.length)]

    // Due date: some have none, some future, some past
    let dueDate: string | null = null
    const dueDateRoll = rng()
    if (dueDateRoll > 0.25) {
      const offset = Math.floor(rng() * 30) - 10 // -10 to +20 days
      dueDate = new Date(Date.now() + offset * 86400000).toISOString().split('T')[0]
    }

    todos.push({
      id: `todo_${userId}_${String(i + 1).padStart(2, '0')}`,
      title,
      status,
      priority,
      dueDate,
      userId,
    })
  }

  return todos
}

// Pre-generate all data
const ALL_USERS = generateUsers()
const ALL_TODOS = ALL_USERS.flatMap((u, idx) => generateTodos(u.id, idx))

// --- Hono app ---
const app = new Hono()

app.use('*', cors())

app.get('/api/users', async (c) => {
  const q = c.req.query('q')?.toLowerCase() ?? ''
  const delay = parseInt(c.req.query('delay') ?? '0', 10)
  const error = c.req.query('error') === 'true'

  if (delay > 0) {
    await new Promise((r) => setTimeout(r, Math.min(delay, 5000)))
  }

  if (error) {
    return c.json({ error: 'Internal server error (simulated)' }, 500)
  }

  const filtered = q
    ? ALL_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q),
      )
    : ALL_USERS

  return c.json(filtered)
})

app.get('/api/todos', async (c) => {
  const userId = c.req.query('userId') ?? ''
  const delay = parseInt(c.req.query('delay') ?? '0', 10)
  const error = c.req.query('error') === 'true'

  if (delay > 0) {
    await new Promise((r) => setTimeout(r, Math.min(delay, 5000)))
  }

  if (error) {
    return c.json({ error: 'Internal server error (simulated)' }, 500)
  }

  const filtered = userId
    ? ALL_TODOS.filter((t) => t.userId === userId)
    : ALL_TODOS

  return c.json(filtered)
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok', users: ALL_USERS.length, todos: ALL_TODOS.length }))

const PORT = 3035

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`\nHono backend running on http://localhost:${info.port}`)
  console.log(`  GET /api/users?q=<query>&delay=<ms>&error=true`)
  console.log(`  GET /api/todos?userId=<id>&delay=<ms>&error=true`)
  console.log(`  GET /health\n`)
  console.log(`Users generated: ${ALL_USERS.length}`)
  console.log(`Todos generated: ${ALL_TODOS.length}`)
  console.log('\nFirst 3 user IDs for testing:')
  ALL_USERS.slice(0, 3).forEach((u) => console.log(`  ${u.id} — ${u.name}`))
})

import { useState } from 'react'
import { UserSearchFormWired } from './components/wired/UserSearchFormWired'
import { DataTableWired } from './components/wired/DataTableWired'
import { TodoCardWired } from './components/wired/TodoCardWired'
import { cn } from './lib/utils'

type Tab = 'search' | 'table' | 'todos'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [theme, setTheme] = useState('catppuccin')

  const themes = [
    { value: 'solarized-dark', label: 'Solarized Dark' },
    { value: 'solarized-light', label: 'Solarized Light' },
    { value: 'catppuccin', label: 'Catppuccin' },
    { value: 'tokyo-night', label: 'Tokyo Night' },
    { value: 'rose-pine', label: 'Rosé Pine' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'gruvbox-dark', label: 'Gruvbox' },
    { value: 'vesper', label: 'Vesper' },
    { value: 'framer-dark', label: 'Framer Dark' },
    { value: 'high-contrast', label: 'High Contrast' },
  ]

  const tabs: { id: Tab; label: string; desc: string }[] = [
    { id: 'search', label: 'USER SEARCH', desc: 'UserSearchFormWired → UserSearchForm' },
    { id: 'table', label: 'DATA TABLE', desc: 'DataTableWired → DataTable' },
    { id: 'todos', label: 'TODOS', desc: 'TodoCardWired → TodoCard' },
  ]

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground font-mono">
      {/* Top bar */}
      <div className="border-b border-border bg-secondary">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent text-xs uppercase tracking-widest font-semibold">
              PURE vs WIRED
            </span>
            <span className="text-muted-foreground text-xs">component patterns demo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-background border border-border text-foreground text-xs px-2 py-1 font-mono uppercase cursor-pointer hover:border-accent transition-colors outline-none focus:border-ring"
            >
              {themes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Concept banner */}
      <div className="border-b border-border bg-accent/5">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-border p-3">
              <div className="text-accent uppercase tracking-wider mb-1 font-semibold">PURE COMPONENTS</div>
              <div className="text-muted-foreground leading-relaxed">
                Receive all state as props. No fetching, no side effects.
                Testable in isolation — just pass different props.
                Perfect for Storybook: every state is explicit.
              </div>
            </div>
            <div className="border border-accent/40 p-3">
              <div className="text-[var(--terminal-success)] uppercase tracking-wider mb-1 font-semibold">WIRED COMPONENTS</div>
              <div className="text-muted-foreground leading-relaxed">
                Manage state internally. Fetch data, handle errors.
                Delegate ALL rendering to the pure component.
                Thin adapter layer between API and UI.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tab bar */}
        <div className="flex gap-0 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-5 py-2.5 text-xs uppercase tracking-wider border-b-2 -mb-px transition-all font-mono',
                activeTab === tab.id
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Component path breadcrumb */}
        <div className="mb-4 text-xs text-muted-foreground">
          <span className="text-accent">$</span>{' '}
          {tabs.find((t) => t.id === activeTab)?.desc}
        </div>

        {/* Panels */}
        {activeTab === 'search' && (
          <div>
            <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
              The wired component manages all state. The pure component just renders.
              Try searching for &quot;a&quot; (validation), &quot;john&quot; (results), or start the server first.
            </div>
            <UserSearchFormWired />
          </div>
        )}

        {activeTab === 'table' && (
          <div>
            <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
              Fetches all users from the API. Click column headers to sort.
              The pure DataTable component handles zero knowledge of where data comes from.
            </div>
            <DataTableWired />
          </div>
        )}

        {activeTab === 'todos' && (
          <div>
            <div className="mb-3 text-xs text-muted-foreground border border-dashed border-border px-4 py-2">
              Enter a user ID to load their todos. Toggle/delete use optimistic updates.
              Actions are simulated — in production, they would call PATCH/DELETE endpoints.
            </div>
            <TodoCardWired />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>server: localhost:3035 &nbsp;|&nbsp; storybook: localhost:6008 &nbsp;|&nbsp; vite: localhost:5173</span>
          <span className="text-accent">pure vs wired demo</span>
        </div>
      </div>
    </div>
  )
}

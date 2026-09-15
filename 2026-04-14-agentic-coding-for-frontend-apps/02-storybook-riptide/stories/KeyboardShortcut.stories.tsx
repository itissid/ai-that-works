import type { Meta, StoryObj } from '@storybook/react'
import { KeyboardShortcut } from '../src/components/keyboard-shortcut'
import { Button } from '../src/components/button'

const meta = {
  title: 'Riptide/KeyboardShortcut',
  component: KeyboardShortcut,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof KeyboardShortcut>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '⌘+K',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <KeyboardShortcut size="xs">⌘+K</KeyboardShortcut>
      <KeyboardShortcut size="sm">⌘+K</KeyboardShortcut>
      <KeyboardShortcut size="md">⌘+K</KeyboardShortcut>
    </div>
  ),
}

export const CommonShortcuts: Story = {
  name: 'Common Shortcuts',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">&gt; KEYBOARD SHORTCUTS:</div>
      <div className="flex justify-between items-center gap-8">
        <span className="text-sm text-foreground">Command Palette</span>
        <KeyboardShortcut>⌘+K</KeyboardShortcut>
      </div>
      <div className="flex justify-between items-center gap-8">
        <span className="text-sm text-foreground">Submit Prompt</span>
        <KeyboardShortcut>⌘+Enter</KeyboardShortcut>
      </div>
      <div className="flex justify-between items-center gap-8">
        <span className="text-sm text-foreground">Auto-Accept</span>
        <KeyboardShortcut>⌥+A</KeyboardShortcut>
      </div>
      <div className="flex justify-between items-center gap-8">
        <span className="text-sm text-foreground">Quick Switch</span>
        <KeyboardShortcut>⌘+J</KeyboardShortcut>
      </div>
    </div>
  ),
}

export const InlineWithButton: Story = {
  name: 'Inline with Button',
  render: () => (
    <div className="flex gap-2 items-center">
      <Button variant="outline" size="sm">
        APPROVE <KeyboardShortcut size="xs">Y</KeyboardShortcut>
      </Button>
      <Button variant="destructive" size="sm">
        DENY <KeyboardShortcut size="xs">N</KeyboardShortcut>
      </Button>
    </div>
  ),
}

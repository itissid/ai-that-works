import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../src/components/input'

const meta = {
  title: 'Riptide/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter command...',
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
}

export const WithValue: Story = {
  args: {
    defaultValue: 'npm run build',
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
}

export const Disabled: Story = {
  args: {
    placeholder: 'Locked...',
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
}

export const TerminalPrompt: Story = {
  name: 'Terminal Prompt',
  render: () => (
    <div className="w-[400px] flex flex-col gap-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">&gt; Enter prompt:</label>
      <Input placeholder="Describe what you want to build..." />
      <div className="text-xs text-muted-foreground">Press ⌘+Enter to submit</div>
    </div>
  ),
}

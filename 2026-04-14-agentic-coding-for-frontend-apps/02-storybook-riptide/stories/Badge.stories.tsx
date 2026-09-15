import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../src/components/badge'

const meta = {
  title: 'Riptide/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'ACTIVE',
    variant: 'default',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 items-center flex-wrap">
      <Badge variant="default">DEFAULT</Badge>
      <Badge variant="secondary">SECONDARY</Badge>
      <Badge variant="destructive">DESTRUCTIVE</Badge>
      <Badge variant="outline">OUTLINE</Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  name: 'Status Badges',
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-muted-foreground">&gt; TASK STATUS:</div>
      <div className="flex gap-2">
        <Badge variant="default">RUNNING</Badge>
        <Badge variant="secondary">QUEUED</Badge>
        <Badge variant="destructive">FAILED</Badge>
        <Badge variant="outline">IDLE</Badge>
      </div>
    </div>
  ),
}

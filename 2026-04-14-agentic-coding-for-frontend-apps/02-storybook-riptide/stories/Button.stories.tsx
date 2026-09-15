import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../src/components/button'
import { RefreshCw, AlertCircle, ArrowRight } from 'lucide-react'

const meta = {
  title: 'Riptide/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'EXECUTE',
    variant: 'default',
    size: 'default',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-wrap">
        <Button variant="default">DEFAULT</Button>
        <Button variant="destructive">DESTRUCTIVE</Button>
        <Button variant="outline">OUTLINE</Button>
        <Button variant="secondary">SECONDARY</Button>
        <Button variant="ghost">GHOST</Button>
        <Button variant="link">LINK</Button>
        <Button variant="loud-success-cta">LOUD SUCCESS CTA</Button>
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Button size="lg">LARGE</Button>
      <Button size="default">DEFAULT</Button>
      <Button size="sm">SMALL</Button>
      <Button size="icon">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>
        <RefreshCw className="mr-2 h-4 w-4" />
        REFRESH
      </Button>
      <Button variant="destructive">
        <AlertCircle className="mr-2 h-4 w-4" />
        DELETE
      </Button>
    </div>
  ),
}

export const LoadingState: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button disabled>PROCESSING...</Button>
      <Button disabled>
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        LOADING
      </Button>
    </div>
  ),
}

export const TerminalStyle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-muted-foreground mb-2">&gt; SELECT ACTION:</div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          [Y] APPROVE
        </Button>
        <Button variant="destructive" size="sm">
          [N] DENY
        </Button>
        <Button variant="ghost" size="sm">
          [ESC] CANCEL
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-2">&gt; AWAITING INPUT_</div>
    </div>
  ),
}

export const LoudSuccessCta: Story = {
  name: 'Loud Success CTA',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-muted-foreground mb-2">Next step suggestion buttons:</div>
      <div className="flex gap-2 items-center">
        <Button variant="default" size="sm">SEND</Button>
        <Button variant="loud-success-cta" size="sm">
          Proceed to Structure
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <Button variant="default" size="sm">SEND</Button>
        <Button variant="loud-success-cta" size="sm">
          Begin Implementation
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  ),
}

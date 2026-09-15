import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../src/components/card'
import { Button } from '../src/components/button'
import { Badge } from '../src/components/badge'
import { Input } from '../src/components/input'

const meta = {
  title: 'Riptide/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>SESSION #042</CardTitle>
        <CardDescription>Active coding session — 3 tasks remaining</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="default">RUNNING</Badge>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Duration:</span>
            <span>00:42:18</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Model:</span>
            <span>claude-opus-4-6</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">VIEW LOGS</Button>
        <Button variant="destructive" size="sm">TERMINATE</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithForm: Story = {
  name: 'With Form',
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>NEW TASK</CardTitle>
        <CardDescription>Create a new coding task</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Task Name</label>
          <Input placeholder="Enter task name..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Prompt</label>
          <Input placeholder="Describe what to build..." />
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="ghost" size="sm">CANCEL</Button>
        <Button size="sm">CREATE</Button>
      </CardFooter>
    </Card>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>SYSTEM STATUS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">All systems operational.</div>
      </CardContent>
    </Card>
  ),
}

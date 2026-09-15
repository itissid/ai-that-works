import { Button } from './Button'

export default {
  title: 'Example/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
}

export const Primary = {
  args: { variant: 'primary', children: 'Button' },
}

export const Secondary = {
  args: { variant: 'secondary', children: 'Button' },
}

export const Danger = {
  args: { variant: 'danger', children: 'Delete' },
}

export const Large = {
  args: { size: 'large', children: 'Large Button' },
}

export const Small = {
  args: { size: 'small', children: 'Small' },
}

export const Disabled = {
  args: { disabled: true, children: 'Disabled' },
}

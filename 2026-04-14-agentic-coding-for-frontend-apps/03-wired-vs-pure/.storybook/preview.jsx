import '../src/globals.css'

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'catppuccin'
      return (
        <div data-theme={theme} className="bg-background text-foreground p-8 min-h-[200px] font-mono">
          <Story />
        </div>
      )
    },
  ],
  globalTypes: {
    theme: {
      description: 'Terminal theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'solarized-dark', title: 'Solarized Dark' },
          { value: 'solarized-light', title: 'Solarized Light' },
          { value: 'catppuccin', title: 'Catppuccin Mocha' },
          { value: 'tokyo-night', title: 'Tokyo Night' },
          { value: 'rose-pine', title: 'Rosé Pine' },
          { value: 'monokai', title: 'Monokai' },
          { value: 'gruvbox-dark', title: 'Gruvbox Dark' },
          { value: 'high-contrast', title: 'High Contrast' },
          { value: 'vesper', title: 'Vesper' },
          { value: 'framer-dark', title: 'Framer Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'catppuccin',
  },
}

export default preview

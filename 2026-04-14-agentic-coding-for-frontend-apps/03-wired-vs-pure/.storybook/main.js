/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    const tailwindcss = (await import('@tailwindcss/vite')).default
    config.plugins = config.plugins || []
    config.plugins.push(tailwindcss())
    return config
  },
}
export default config

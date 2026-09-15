import { ArticlePage } from './ArticlePage'

export default {
  title: 'Pages/Article',
  component: ArticlePage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    tags: { control: 'object' },
  },
}

const sampleBody = `The separation of presentation and business logic is one of the most impactful patterns in frontend development. When you build components that receive all their data as props — with zero side effects — you unlock a powerful testing and iteration workflow.

Consider a search form. It might have an empty state, a loading state, a results state, an error state, and a "no results found" state. Each of these is a distinct visual configuration that a designer or developer needs to review. If the component fetches its own data, you need a running backend, network mocking, or elaborate test fixtures to see each state.

But if the component is pure — if every state is driven by props — then Storybook becomes a visual test harness. You write one story per state, pass the right props, and every state is instantly visible. No network. No mocking. No waiting.

The wired component sits above the pure one. It manages the fetch, holds the state, handles errors and loading. Then it passes clean, typed props down to the pure component. The pure component doesn't know or care where the data came from.

This pattern scales beautifully. Your design team reviews pure components in Storybook. Your QA team tests wired components in the real app. Your unit tests verify the pure component renders correctly for each prop combination. Your integration tests verify the wired component orchestrates state correctly.`

export const FullArticle = {
  args: {
    title: 'Pure vs Wired: The Component Pattern That Changes Everything',
    author: 'Dex Horthy',
    date: 'April 14, 2026',
    readingTime: '5 min read',
    tags: ['Frontend', 'React', 'Architecture'],
    body: sampleBody,
    heroImage: 'https://picsum.photos/seed/article1/800/400',
  },
}

export const MinimalArticle = {
  args: {
    title: 'Quick Tip: Use Storybook for Every State',
    author: 'Dex Horthy',
    date: 'April 14, 2026',
    readingTime: '2 min read',
    tags: [],
    body: 'Write one story per component state. Pass different props for each. Review them all at a glance.\n\nThat\'s it. That\'s the tip.',
  },
}

export const NoImage = {
  args: {
    title: 'Why Agentic Coding Needs Good Component Boundaries',
    author: 'AI That Works',
    date: 'April 2026',
    readingTime: '8 min read',
    tags: ['AI', 'Dev Tools'],
    body: 'When an AI agent is iterating on your frontend, it needs fast feedback loops. Storybook gives it exactly that — isolated components with explicit props that can be visually verified without spinning up the entire app.\n\nThe agent can modify a component, check the story, and confirm the change looks right. No manual QA needed for each iteration.',
  },
}

export const LongformWithTags = {
  args: {
    title: 'Building a Design System from Terminal Aesthetics',
    author: 'Dex Horthy',
    date: 'March 2026',
    readingTime: '12 min read',
    tags: ['Design Systems', 'CSS', 'Tailwind', 'Theming'],
    body: sampleBody + '\n\n' + sampleBody,
    heroImage: 'https://picsum.photos/seed/article2/800/400',
  },
}

export const Empty = {
  args: {
    title: 'Draft Article',
    author: 'Unknown',
  },
}

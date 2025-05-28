export interface FeaturedApp {
  name: string;
  image: string;
  href: string;
  isMonochrome?: boolean;
}

// Electron apps with "logo power"
export const FEATURED_LOGOS: FeaturedApp[] = [
  {
    name: '1Password',
    image: '/assets/app-logos/1password.svg',
    href: 'https://1password.com/',
  },
  {
    name: 'OpenAI ChatGPT',
    image: '/assets/app-logos/openai.svg',
    href: 'https://openai.com/',
  },
  {
    name: 'Slack',
    image: '/assets/app-logos/slack.svg',
    href: 'https://slack.com/',
  },
  {
    name: 'Anthropic Claude',
    image: '/assets/app-logos/claude.svg',
    href: 'https://claude.ai/',
  },
  {
    name: 'Visual Studio Code',
    image: '/assets/app-logos/vscode.svg',
    href: 'https://code.visualstudio.com/',
  },
  {
    name: 'Figma',
    image: '/assets/app-logos/figma.svg',
    href: 'https://figma.com/',
  },
];

// Apps we _also_ love with less prominence
export const FEATURED_APPS: FeaturedApp[] = [
  {
    name: '1Password',
    image: '/assets/apps/1password.svg',
    href: 'https://1password.com/',
  },
  {
    name: 'Discord',
    image: '/assets/apps/discord.svg',
    href: 'https://discord.com/',
  },
  {
    name: 'Dropbox',
    image: '/assets/apps/dropbox.svg',
    href: 'https://dropbox.com/',
  },
  {
    name: 'Figma',
    image: '/assets/apps/figma.svg',
    href: 'https://figma.com/',
  },
  {
    name: 'Loom',
    image: '/assets/apps/loom.svg',
    href: 'https://www.loom.com/',
  },
  {
    name: 'Signal',
    image: '/assets/apps/signal.svg',
    href: 'https://signal.org/en/',
  },
  {
    name: 'Slack',
    image: '/assets/apps/slack.svg',
    href: 'https://slack.com/',
  },
  {
    name: 'Notion',
    image: '/assets/apps/notion.svg',
    href: 'https://www.notion.so/',
  },
  {
    name: 'VS Code',
    image: '/assets/apps/vscode.svg',
    href: 'https://code.visualstudio.com/',
  },
  {
    name: 'Microsoft Teams',
    image: '/assets/apps/teams.svg',
    href: 'https://microsoft.com/en-ca/microsoft-teams/group-chat-software/',
  },
  {
    name: 'Asana',
    image: '/assets/apps/asana.svg',
    href: 'https://asana.com/',
  },
  {
    name: 'GitHub Desktop',
    image: '/assets/apps/github-desktop.svg',
    href: 'https://desktop.github.com/',
  },
  {
    name: 'itch',
    image: '/assets/apps/itchio.svg',
    href: 'https://itch.io/app',
  },
  {
    name: 'MongoDB Compass',
    image: '/assets/apps/mongodb.svg',
    href: 'https://www.mongodb.com/products/compass',
  },
  {
    name: 'Obsidian',
    image: '/assets/apps/obsidian.svg',
    href: 'https://obsidian.md/',
  },
  {
    name: 'OOMOL Studio',
    image: '/assets/apps/oomol-studio.svg',
    href: 'https://oomol.com/',
  },
  {
    name: 'Polypane',
    image: '/assets/apps/polypane.svg',
    href: 'https://polypane.app/',
  },
  {
    name: 'Postman',
    image: '/assets/apps/postman.svg',
    href: 'https://postman.com/',
  },
  {
    name: 'Splice',
    image: '/assets/apps/splice.svg',
    isMonochrome: true,
    href: 'https://splice.com/',
  },
  {
    name: 'Screen Studio',
    image: '/assets/apps/screen-studio.png',
    href: 'https://screen.studio',
  },
  {
    name: 'Trello',
    image: '/assets/apps/trello.svg',
    href: 'https://trello.com/',
  },
  {
    name: 'Twitch',
    image: '/assets/apps/twitch.svg',
    href: 'https://www.twitch.tv/',
  },
];

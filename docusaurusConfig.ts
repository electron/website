import path from 'path';
import { Config } from '@docusaurus/types';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

import apiLabels from './src/transformers/api-labels';
import apiOptionsClass from './src/transformers/api-options-class';
import apiStructurePreviews from './src/transformers/api-structure-previews';
import esmCodeBlocks from './src/transformers/esm-code-blocks';
import fiddleEmbedder from './src/transformers/fiddle-embedder';

const config: Config = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  favicon: 'assets/img/favicon.ico',
  organizationName: 'electron',
  projectName: 'electron',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'],
    path: 'i18n',
    localeConfigs: {},
  },
  themeConfig: {
    colorMode: {
      //Default to light or dark depending on system theme.
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    navbar: {
      title: 'Electron',
      style: 'dark',
      logo: {
        alt: 'Electron homepage',
        src: 'assets/img/logo.svg',
      },
      items: [
        {
          label: 'Docs',
          type: 'doc',
          docId: 'latest/tutorial/introduction',
          position: 'left',
        },
        {
          label: 'API',
          type: 'doc',
          docId: 'latest/api/app',
          position: 'left',
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          type: 'dropdown',
          label: 'Tools',
          position: 'left',
          items: [
            { to: 'https://electronforge.io', label: 'Electron Forge' },
            { to: 'fiddle', label: 'Electron Fiddle' },
          ],
        },
        {
          type: 'dropdown',
          label: 'Community',
          position: 'left',
          items: [
            { to: 'governance', label: 'Governance' },
            { to: 'apps', label: 'Showcase' },
            { to: 'community', label: 'Resources' },
          ],
        },
        {
          href: 'https://releases.electronjs.org',
          label: 'Releases',
          position: 'right',
        },
        {
          href: 'https://github.com/electron/electron',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'OpenJS Foundation Logo',
        src: 'assets/img/openjsf_logo.svg',
        srcDark: 'assets/img/openjsf_logo-dark.svg',
        href: 'https://openjsf.org/',
      },
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/latest/',
            },
            {
              label: 'API Reference',
              to: '/docs/latest/api/app',
            },
          ],
        },
        {
          title: 'Checklists',
          items: [
            {
              label: 'Performance',
              to: '/docs/latest/tutorial/performance',
            },
            {
              label: 'Security',
              to: '/docs/latest/tutorial/security',
            },
          ],
        },
        {
          title: 'Tools',
          items: [
            {
              label: 'Electron Forge',
              to: 'https://electronforge.io',
            },
            {
              label: 'Electron Fiddle',
              to: '/fiddle',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Governance', to: '/governance' },
            { label: 'Resources', to: '/community' },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/APGC3k5yaH',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/electronjs',
            },
            {
              html: '<a href="https://social.lfx.dev/@electronjs" target="_blank" rel="me" class="footer__link-item">Mastodon<svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24" style="margin-left: 0.3rem;"><path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path></svg></a>',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/electron',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/electron/electron',
            },
            {
              label: 'Open Collective',
              href: 'https://opencollective.com/electron',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenJS Foundation and Electron contributors.`,
    },
    algolia: {
      appId: 'MG3SRMK3K0',
      apiKey: 'fdc2cf6080e499639d7e6b0278851ed4',
      indexName: 'electronjs',
      contextualSearch: true,
    },
  },
  plugins: [
    'docusaurus-plugin-sass',
    path.resolve(__dirname, './src/plugins/apps'),
    path.resolve(__dirname, './src/plugins/releases'),
    path.resolve(__dirname, './src/plugins/fiddle'),
    path.resolve(__dirname, './src/plugins/governance'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/docs/',
          editUrl: ({ docPath }) => {
            const fixedPath = docPath.replace('latest/', '');
            return `https://github.com/electron/electron/edit/main/docs/${fixedPath}`;
          },
          remarkPlugins: [
            apiLabels,
            apiOptionsClass,
            apiStructurePreviews,
            esmCodeBlocks,
            fiddleEmbedder,
            [npm2yarn, { sync: true, converters: ['yarn'] }],
          ],
        },
        blog: {
          // See `node_modules/@docusaurus/plugin-content-blog/src/pluginOptionSchema.ts` for full undocumented options
          blogSidebarCount: 50,
          blogSidebarTitle: 'Latest posts',
          blogTitle: `Electron's blog`,
          blogDescription: `Keep up to date with what's going on with the Electron project`,
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')],
        },
        googleAnalytics: {
          trackingID: 'UA-160365006-1',
        },
      },
    ],
  ],
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve('esbuild-loader'),
      options: {
        loader: 'tsx',
        format: isServer ? 'cjs' : undefined,
        target: isServer ? 'node12' : 'es2017',
      },
    }),
  },
};

export default config;

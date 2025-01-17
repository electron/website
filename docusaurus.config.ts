import fs from 'node:fs';
import path from 'node:path';

import logger from '@docusaurus/logger';
import { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';
import { themes as prismThemes } from 'prism-react-renderer';
import remarkGithubAdmonitionsToDirectives, {
  DEFAULT_MAPPING,
  DirectiveName,
  GithubAlertType,
} from 'remark-github-admonitions-to-directives';

import apiLabels from './src/transformers/api-labels';
import apiOptionsClass from './src/transformers/api-options-class';
import apiStructurePreviews from './src/transformers/api-structure-previews';
import jsCodeBlocks from './src/transformers/js-code-blocks';
import fiddleEmbedder from './src/transformers/fiddle-embedder';
import apiHistory from './src/transformers/api-history';

let docsSHA = undefined;

try {
  docsSHA = fs.readFileSync(
    path.resolve(__dirname, './docs/latest/.sha'),
    'utf-8',
  );
} catch {
  logger.warn('No .sha file found in docs/latest directory');
}

const config: Config = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  favicon: 'assets/img/favicon.ico',
  organizationName: 'electron',
  projectName: 'electron',
  headTags: docsSHA
    ? [
        {
          tagName: 'meta',
          attributes: {
            name: 'docs-sha',
            content: docsSHA,
          },
        },
      ]
    : [],
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
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
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['diff', 'json'],
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
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/electron/electron',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
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
              label: 'Bluesky',
              href: 'https://bsky.app/profile/electronjs.org',
            },
            {
              label: 'X',
              href: 'https://x.com/electronjs',
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
            {
              label: 'Infrastructure Dashboard',
              href: 'https://p.datadoghq.com/sb/c44e1df0-85d7-11ee-94c9-da7ad0900002-c245f7ef47d0d0c32abecdc0938c2a85',
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
  } satisfies Preset.ThemeConfig,
  plugins: [
    'docusaurus-plugin-sass',
    path.resolve(__dirname, './src/plugins/apps/index.ts'),
    path.resolve(__dirname, './src/plugins/releases/index.ts'),
    path.resolve(__dirname, './src/plugins/fiddle/index.ts'),
    path.resolve(__dirname, './src/plugins/governance/index.ts'),
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          beforeDefaultRemarkPlugins: [
            [
              remarkGithubAdmonitionsToDirectives,
              {
                mapping: {
                  ...DEFAULT_MAPPING,
                  [GithubAlertType.NOTE]: DirectiveName.INFO,
                },
              },
            ],
          ],
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
            jsCodeBlocks,
            fiddleEmbedder,
            apiHistory,
            [npm2yarn, { sync: true, converters: ['yarn'] }],
          ],
        },
        blog: {
          // See `node_modules/@docusaurus/plugin-content-blog/src/pluginOptionSchema.ts` for full undocumented options
          path: 'blog',
          beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives],
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'Latest posts',
          blogTitle: `Electron's blog`,
          blogDescription: `Keep up to date with what's going on with the Electron project`,
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')],
        },
        gtag: {
          trackingID: 'UA-160365006-1',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],
  future: {
    experimental_faster: true,
  },
};

export default config;

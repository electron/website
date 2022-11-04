/** @type {import('@docusaurus/types').DocusaurusConfig} */
const path = require('path');
const npm2yarn = require('@docusaurus/remark-plugin-npm2yarn');
const fiddleEmbedder = require('./src/transformers/fiddle-embedder.js');
const apiLabels = require('./src/transformers/api-labels.js');
const apiOptionsClass = require('./src/transformers/api-options-class.js');
const apiStructurePreviews = require('./src/transformers/api-structure-previews.js');
// const docVersions = require('./versions-info.json');

module.exports = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'assets/img/favicon.ico',
  organizationName: 'electron',
  projectName: 'electron',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'],
  },
  themeConfig: {
    announcementBar: {
      id: 'announcementBar',
      content: `Introducing Electron Forge 6, a complete pipeline for building your Electron apps. Read more in the <strong><a target="_blank" rel="noopener noreferrer" href="./blog/">Forge 6 announcement blog</a></strong>!`,
      backgroundColor: '#A2ECFB',
      isCloseable: true,
    },
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
        // TODO: This can be removed when the SPA root homepage is working
        href: 'https://electronjs.org',
        target: '_self',
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
        // FIXME: Enable when versioned docs work
        // {
        //   type: 'dropdown',
        //   label: docVersions[0].label,
        //   position: 'right',
        //   items: docVersions,
        // },
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
    ['@docusaurus/plugin-ideal-image', {}],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/docs/',
          editUrl: ({ docPath }) => {
            // TODO: remove when `latest/` is no longer hardcoded
            const fixedPath = docPath.replace('latest/', '');
            // TODO: versioning?
            return `https://github.com/electron/electron/edit/main/docs/${fixedPath}`;
          },
          remarkPlugins: [
            apiLabels,
            apiOptionsClass,
            apiStructurePreviews,
            fiddleEmbedder,
            [npm2yarn, { sync: true }],
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

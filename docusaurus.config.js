/** @type {import('@docusaurus/types').DocusaurusConfig} */
const npm2yarn = require('@docusaurus/remark-plugin-npm2yarn');
const fiddleEmbedder = require('./src/transformers/fiddle-embedder.js');
const apiLabels = require('./src/transformers/api-labels.js');

module.exports = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
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
      id: 'to_old_docs',
      content:
        'Want to go back to the <a href="https://www.electronjs.org/docs">old docs</a>?',
      backgroundColor: '#1a1b23',
      textColor: '#9feaf9',
    },
    navbar: {
      title: 'Electron',
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
        {
          label: 'Examples',
          to: 'docs/latest/tutorial/examples',
          position: 'left',
          activeBaseRegex: '^\b$', // never active
        },
        { to: 'blog', label: 'Blog', position: 'left' },
        {
          href: 'https://releases.electronjs.org',
          label: 'Releases',
          position: 'right',
        },
        // TODO: uncomment once the production site is pointing to Azure Storage
        // {
        //   type: 'localeDropdown',
        //   position: 'right',
        // },
        {
          href: 'https://github.com/electron/electron',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'OpenJS Foundation Logo',
        src: 'assets/img/openjsf_logo.svg',
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
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/electron',
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
      apiKey: 'f9fb1d51a99fc479d5979cfa2aae48b9',
      indexName: 'beta-electronjs',
      contextualSearch: true,
    },
    googleAnalytics: {
      trackingID: 'UA-160365006-1',
    },
  },
  plugins: ['docusaurus-plugin-sass'],
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
            fiddleEmbedder,
            apiLabels,
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

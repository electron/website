/** @type {import('@docusaurus/types').DocusaurusConfig} */
const fiddleEmbedder = require('./src/transformers/fiddle-embedder.js');

module.exports = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/docs/latest/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'electron',
  projectName: 'electron',
  themeConfig: {
    announcementBar: {
      id: 'to_old_docs',
      content:
        'Want to go back to the old docs? Click <a href="https://www.electronjs.org/docs">this link</a>.',
      backgroundColor: '#1a1b23',
      textColor: '#9feaf9'
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Electron homepage',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: 'Docs',
          type: 'doc',
          docId: 'get-started/introduction',
          position: 'left',
        },
        {
          label: 'API',
          type: 'doc',
          docId: 'api/app',
          position: 'left',
        },
        {
          label: 'Examples',
          type: 'doc',
          docId: 'how-to/examples',
          position: 'left',
        },
        {
          href: 'https://github.com/electron/electron',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/electron',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/electron',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/electronjs',
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
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    algolia: {
      apiKey: 'f9fb1d51a99fc479d5979cfa2aae48b9',
      indexName: 'beta-electronjs',
      contextualSearch: true,
    },
    googleAnalytics: {
      trackingID: 'UA-160365006-1'
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/electron/electronjs.org-new',
          remarkPlugins: [fiddleEmbedder],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

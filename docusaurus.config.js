/** @type {import('@docusaurus/types').DocusaurusConfig} */
const npm2yarn = require('@docusaurus/remark-plugin-npm2yarn');
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
        'Want to go back to the <a href="https://www.electronjs.org/docs">old docs</a>?',
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
      logo: {
        alt: 'OpenJS Foundation Logo',
        src: 'img/openjsf_logo.svg',
        href: 'https://openjsf.org/',
      },
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'API Reference',
              to: '/api/app',
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
          remarkPlugins: [fiddleEmbedder, [npm2yarn, { sync: true }]],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

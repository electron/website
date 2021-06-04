/** @type {import('@docusaurus/types').DocusaurusConfig} */
const fiddleEmbedder = require('./src/transformers/fiddle-embedder.js');

module.exports = {
  title: 'Electron',
  tagline: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
  url: 'https://electronjs.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'electron', // Usually your GitHub org/user name.
  projectName: 'electron', // Usually your repo name.
  themeConfig: {
    announcementBar: {
      id: 'to_old_docs', // Any value that will identify this message.
      content:
        'Want to go back to the old docs? Click <a target="_blank" rel="noopener noreferrer" href="https://electronjs.org/docs">this link</a>.',
    },
    navbar: {
      title: 'Electron',
      logo: {
        alt: 'My Site Logo',
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
              to: '/docs/latest/get-started/introduction/',
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
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: 'docs/latest',
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

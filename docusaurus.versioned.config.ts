/**
 * Docusaurus config for the per-version docs builds that are published to
 * `/docs/vX.Y.Z/` (stable and alpha/beta release tags) and `/docs/dev/`
 * (built from `electron/electron@main`).
 *
 * It derives from the main `docusaurus.config.ts` so that the docs render
 * exactly like `/docs/latest`, with these differences:
 *
 * - the docs plugin is rooted at `docs/<version>` and the site's `baseUrl`
 *   is `/docs/<version>/`, so routes come out as `/docs/v44.3.0/api/app`
 *   while the build stays self-contained: its JS/CSS bundles, images and
 *   static files all live under that same prefix, which is what the CDN
 *   routes to the docs storage account (the main site's `/assets/` are
 *   served from a different account and carry different bundle hashes)
 * - English only, no blog, no pages, no plugins that fetch data for the
 *   non-docs parts of the site
 * - every page is `noindex` and declares the `/docs/latest/` page as
 *   canonical (see `src/theme/DocItem/Metadata`)
 * - navbar / footer links to the rest of the website become absolute links
 *   to https://www.electronjs.org, since those routes are not in this build
 * - broken links only warn: older releases have links that were fixed later
 *
 * Usage: `ELECTRON_DOCS_VERSION=v44.3.0 yarn build:version`
 * (after `yarn pre-build:version v44.3.0`).
 */
import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@docusaurus/logger';
import type { Config, PluginConfig } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { NavbarItem, Footer } from '@docusaurus/theme-common';

import baseConfig from './docusaurus.config.ts';
import {
  DEV_VERSION,
  LATEST_VERSION,
  WEBSITE_ORIGIN,
  invalidDocsVersionHint,
  isReleaseVersion,
  isValidDocsVersion,
} from './src/util/docs-version.ts';

const version = process.env.ELECTRON_DOCS_VERSION;

if (!version || !isValidDocsVersion(version) || version === LATEST_VERSION) {
  throw new Error(
    `ELECTRON_DOCS_VERSION must be set to "${DEV_VERSION}", "vX.Y.Z" or "vX.Y.Z-(alpha|beta).N" (got "${version}"). ` +
      (invalidDocsVersionHint(version ?? '') ??
        'Use the default docusaurus.config.ts for the latest docs.'),
  );
}

const docsFolder = path.resolve(__dirname, 'docs', version);

if (!fs.existsSync(docsFolder)) {
  throw new Error(
    `${docsFolder} does not exist, run "yarn pre-build:version ${version}" first`,
  );
}

let docsSHA: string | undefined;

try {
  docsSHA = fs.readFileSync(path.join(docsFolder, '.sha'), 'utf-8').trim();
} catch {
  logger.warn(`No .sha file found in docs/${version} directory`);
}

/**
 * Turns a website-relative `to` into an absolute `href` on the main website,
 * for navbar/footer entries whose routes are not part of this build.
 */
const toWebsiteHref = (to: string): string => {
  if (/^https?:\/\//.test(to)) {
    return to;
  }

  return `${WEBSITE_ORIGIN}/${to.replace(/^\//, '')}`;
};

/**
 * Only the handful of static files the docs layout needs (favicon, logos)
 * are shipped with every version; the rest of `static/` belongs to the main
 * site (home page, blog, apps showcase...).
 */
const versionedStaticDir = path.resolve(__dirname, '.tmp', 'versioned-static');
fs.rmSync(versionedStaticDir, { recursive: true, force: true });
fs.cpSync(
  path.resolve(__dirname, 'static', 'assets', 'img'),
  path.join(versionedStaticDir, 'assets', 'img'),
  {
    recursive: true,
    filter: (source) => path.basename(source) !== 'blog',
  },
);

const externalizeNavbarItem = (item: NavbarItem): NavbarItem | undefined => {
  switch (item.type) {
    case 'doc': {
      // `latest/tutorial/introduction` → same doc in this version, whose
      // doc IDs carry no folder prefix (the plugin is rooted at the version)
      const docId = String(item.docId).replace(/^latest\//, '');
      if (fs.existsSync(path.join(docsFolder, `${docId}.md`))) {
        return { ...item, docId };
      }
      const { docId: _docId, type: _type, ...rest } = item;
      return {
        ...rest,
        href: toWebsiteHref(`/docs/${String(item.docId)}`),
      };
    }
    case 'localeDropdown':
      // This build is English-only
      return undefined;
    case 'dropdown':
      return {
        ...item,
        items: (item.items as NavbarItem[])
          .map(externalizeNavbarItem)
          .filter((child): child is NavbarItem => child !== undefined),
      };
    default: {
      if (typeof item.to === 'string') {
        const { to: _to, ...rest } = item;
        return { ...rest, href: toWebsiteHref(item.to) };
      }
      return item;
    }
  }
};

type FooterLinks = NonNullable<Footer['links']>;

const externalizeFooterLinks = (links: FooterLinks): FooterLinks =>
  links.map((column) => {
    if (!('items' in column)) {
      return column;
    }
    return {
      ...column,
      items: column.items.map((item) => {
        if (typeof item.to === 'string') {
          const { to: _to, ...rest } = item;
          return { ...rest, href: toWebsiteHref(item.to) };
        }
        return item;
      }),
    };
  });

const [presetName, basePresetOptions] = baseConfig.presets![0] as [
  string,
  Preset.Options,
];
const baseDocsOptions = basePresetOptions.docs as NonNullable<
  Exclude<Preset.Options['docs'], false>
>;
const baseThemeConfig = baseConfig.themeConfig as Preset.ThemeConfig;
const baseNavbar = baseThemeConfig.navbar!;
const baseFooter = baseThemeConfig.footer!;

const keptPlugins = new Set(['docusaurus-plugin-sass', 'markdown-output']);

const config: Config = {
  ...baseConfig,
  baseUrl: `/docs/${version}/`,
  staticDirectories: [versionedStaticDir],
  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  markdown: {
    ...baseConfig.markdown,
    hooks: {
      ...baseConfig.markdown?.hooks,
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },
  customFields: {
    ...baseConfig.customFields,
    electronDocsVersion: version,
  },
  headTags: [
    // Versioned docs are excluded from search engines and search indexes;
    // `/docs/latest/` is the canonical copy.
    {
      tagName: 'meta',
      attributes: { name: 'robots', content: 'noindex' },
    },
    ...(docsSHA
      ? [
          {
            tagName: 'meta',
            attributes: { name: 'docs-sha', content: docsSHA },
          },
        ]
      : []),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    path: 'i18n',
  },
  plugins: (baseConfig.plugins as PluginConfig[]).filter(
    (plugin) =>
      typeof plugin === 'string' &&
      [...keptPlugins].some((kept) => plugin.includes(kept)),
  ),
  presets: [
    [
      presetName,
      {
        ...basePresetOptions,
        docs: {
          ...baseDocsOptions,
          path: `docs/${version}`,
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.versioned.js'),
          // Release snapshots (stable or prerelease) are immutable, so there
          // is nothing to edit; `dev` tracks `main` and can link straight to it.
          editUrl:
            version === DEV_VERSION
              ? ({ docPath }) =>
                  `https://github.com/electron/electron/edit/main/docs/${docPath}`
              : undefined,
        },
        blog: false,
        pages: false,
        // Every page is noindex, do not advertise them
        sitemap: false,
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    ...baseThemeConfig,
    navbar: {
      ...baseNavbar,
      logo: { ...baseNavbar.logo!, href: `${WEBSITE_ORIGIN}/` },
      items: baseNavbar.items
        .map(externalizeNavbarItem)
        .filter((item): item is NavbarItem => item !== undefined),
    },
    footer: {
      ...baseFooter,
      links: externalizeFooterLinks(baseFooter.links ?? []),
    },
    algolia: baseThemeConfig.algolia
      ? {
          ...baseThemeConfig.algolia,
          // Search results point at the main website; open them as full
          // page loads instead of routing inside this build.
          externalUrlRegex: 'electronjs\\.org',
        }
      : undefined,
  } satisfies Preset.ThemeConfig,
};

if (isReleaseVersion(version)) {
  logger.info(`Building immutable docs snapshot for ${logger.green(version)}`);
} else {
  logger.info(`Building docs for ${logger.green(version)} from main`);
}

export default config;

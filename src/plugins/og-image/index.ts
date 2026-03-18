import fs from 'node:fs';
import path from 'node:path';

import logger from '@docusaurus/logger';
import type { Plugin } from '@docusaurus/types';
import matter from 'gray-matter';
import React from 'react';
import satori from 'satori';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';

interface OgAuthor {
  name: string;
  /** base64 data URI for the author's avatar */
  avatarDataUri?: string;
}

interface OgTemplateOptions {
  title: string;
  authors: OgAuthor[];
  tags: string[];
  /** base64 data URI for the Electron logo */
  logoDataUri: string;
}

function buildOgImage({
  title,
  authors,
  tags,
  logoDataUri,
}: OgTemplateOptions) {
  const h = React.createElement;

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(2, 131, 153, 0.6), transparent),' +
          'radial-gradient(ellipse 60% 80% at 110% 60%, rgba(2, 131, 153, 0.35), transparent),' +
          'radial-gradient(ellipse 40% 40% at -5% 100%, rgba(159, 234, 249, 0.15), transparent),' +
          'linear-gradient(to bottom, #1b1c26, #131420)',
        padding: '60px',
        fontFamily: 'Inter',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      },
    },
    // Bottom accent bar
    h('div', {
      style: {
        display: 'flex',
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '8px',
        backgroundImage: 'linear-gradient(to right, #028399, #9feaf9, #028399)',
      },
    }),
    // Header: logo + site name
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          },
        },
        h('img', {
          src: logoDataUri,
          width: 48,
          height: 48,
          style: { borderRadius: '50%' },
        }),
        h(
          'span',
          {
            style: {
              fontSize: '24px',
              fontWeight: 700,
              color: '#9feaf9',
            },
          },
          'Electron',
        ),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '20px',
            color: '#9feaf9',
          },
        },
        'electronjs.org',
      ),
    ),
    // Title
    h(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          marginTop: '20px',
        },
      },
      h(
        'span',
        {
          style: {
            fontSize: '52px',
            fontWeight: 700,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineClamp: 3,
          },
        },
        title,
      ),
    ),
    // Footer: authors (left) + tags (right)
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          width: '100%',
        },
      },
      // Authors
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          },
        },
        ...authors.map((author) =>
          h(
            'div',
            {
              key: author.name,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
            },
            ...(author.avatarDataUri
              ? [
                  h('img', {
                    src: author.avatarDataUri,
                    width: 48,
                    height: 48,
                    style: { borderRadius: '50%' },
                  }),
                ]
              : []),
            h(
              'span',
              { style: { fontSize: '24px', color: '#cccccc' } },
              author.name,
            ),
          ),
        ),
      ),
      // Tags
      ...(tags.length > 0
        ? [
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                },
              },
              ...tags.map((tag) =>
                h(
                  'span',
                  {
                    key: tag,
                    style: {
                      fontSize: '24px',
                      color: '#9feaf9',
                      opacity: 0.8,
                    },
                  },
                  `#${tag}`,
                ),
              ),
            ),
          ]
        : []),
    ),
  );
}

const SITE_URL = 'https://www.electronjs.org';

interface Author {
  name: string;
  image_url?: string;
}

type AuthorsMap = Record<string, Author>;

type PostBuildContext = Parameters<NonNullable<Plugin['postBuild']>>[0];

/**
 * Loads the blog's authors.yml configuration file
 */
function loadAuthorsMap(siteDir: string): AuthorsMap {
  const authorsPath = path.join(siteDir, 'blog', 'authors.yml');
  const raw = fs.readFileSync(authorsPath, 'utf-8');
  return parseYaml(raw) as AuthorsMap;
}

/**
 * In Docusaurus, Blog posts can exist under the direct slug.md path,
 * or under slug/index.md. This helper function helps check for both.
 */
function findMarkdownSource(routePath: string, siteDir: string): string | null {
  const relative = routePath.replace(/^\/blog\//, '');
  const blogDir = path.join(siteDir, 'blog');

  // Try direct file (e.g., blog/electron-41-0.md)
  const directPath = path.join(blogDir, `${relative}.md`);
  if (fs.existsSync(directPath)) return directPath;

  // Try index file (e.g., blog/electron-41-0/index.md)
  const indexPath = path.join(blogDir, relative, 'index.md');
  if (fs.existsSync(indexPath)) return indexPath;

  return null;
}

/**
 * Resolves the authors directly from the frontmatter or
 * from the blog's authors.yml ({@link loadAuthorsMap}).
 * We limit MAX_AUTHORS to 3 to ensure proper rendering
 * on the image.
 */
function resolveAuthors(
  frontmatterAuthors: unknown,
  authorsMap: AuthorsMap,
): Author[] {
  if (!frontmatterAuthors) return [];

  const authorsList = Array.isArray(frontmatterAuthors)
    ? frontmatterAuthors
    : [frontmatterAuthors];

  const resolved: Author[] = [];
  const MAX_AUTHORS = 3;
  for (const entry of authorsList) {
    if (resolved.length >= MAX_AUTHORS) break;

    if (typeof entry === 'string') {
      const mapped = authorsMap[entry];
      resolved.push({
        name: mapped?.name ?? entry,
        image_url:
          mapped?.image_url ?? `https://github.com/${entry}.png?size=96`,
      });
    } else if (typeof entry === 'object' && entry !== null) {
      const obj = entry as Record<string, unknown>;
      if (typeof obj.name === 'string') {
        resolved.push({
          name: obj.name,
          image_url:
            typeof obj.image_url === 'string'
              ? obj.image_url
              : `https://github.com/${obj.name}.png?size=96`,
        });
      }
    }
  }

  return resolved;
}

async function fetchAvatarAsDataUri(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return undefined;
  }
}

/** Routes that are blog listing/index pages, not individual posts. */
const NON_POST_PATTERNS = [
  /^\/blog\/?$/,
  /^\/blog\/page\//,
  /^\/blog\/tags/,
  /^\/blog\/archive/,
];

function isBlogPostRoute(routePath: string): boolean {
  if (!routePath.startsWith('/blog/')) return false;
  return !NON_POST_PATTERNS.some((p) => p.test(routePath));
}

/**
 * Plugin to run on `postBuild` to generate rich OG images for
 * link previews/sharing. Takes in the blog title and authors list
 * (max 3) to generate an SVG with satori. OG images need to be raster,
 * so we also process the vector with sharp.
 */
module.exports = function ogImagePlugin(): Plugin {
  return {
    name: 'og-image-plugin',
    async postBuild(context: PostBuildContext) {
      const { siteDir, outDir, routesPaths } = context;

      // Load Inter (fonts stored locally to make generation deterministic)
      const fontsDir = path.join(__dirname, 'fonts');
      const interRegular = fs.readFileSync(
        path.join(fontsDir, 'Inter-Regular.ttf'),
      );
      const interBold = fs.readFileSync(path.join(fontsDir, 'Inter-Bold.ttf'));

      // Load the Electron logo from static assets
      const logoSvg = fs.readFileSync(
        path.join(siteDir, 'static', 'assets', 'img', 'logo.svg'),
        'utf-8',
      );
      const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;

      logger.info('Loading authors.yml for OG image generation');
      const authorsMap = loadAuthorsMap(siteDir);

      const blogRoutes = routesPaths.filter(isBlogPostRoute);
      let generatedCount = 0;

      logger.info(
        `Generating OG images for ${blogRoutes.length} blog posts...`,
      );

      for (const routePath of blogRoutes) {
        const mdPath = findMarkdownSource(routePath, siteDir);
        if (!mdPath) continue;

        const raw = fs.readFileSync(mdPath, 'utf-8');
        const { data: frontmatter } = matter(raw);

        // Skip posts that already have a custom OG image
        if (frontmatter.image) continue;

        const title: string = frontmatter.title || 'Electron Blog';
        const tags: string[] = Array.isArray(frontmatter.tags)
          ? frontmatter.tags.filter(
              (t: unknown): t is string => typeof t === 'string',
            )
          : [];
        const authors = resolveAuthors(frontmatter.authors, authorsMap);

        const ogAuthors: OgAuthor[] = await Promise.all(
          authors.map(async (author) => ({
            name: author.name,
            avatarDataUri: author.image_url
              ? await fetchAvatarAsDataUri(author.image_url)
              : undefined,
          })),
        );

        const element = buildOgImage({
          title,
          authors: ogAuthors,
          tags,
          logoDataUri,
        });

        const svg = await satori(element, {
          width: 1200,
          height: 630,
          fonts: [
            { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
            { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
          ],
        });

        const png = await sharp(Buffer.from(svg)).png().toBuffer();

        // Write the PNG to the build output
        const outputDir = path.join(outDir, routePath);
        fs.mkdirSync(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, 'og-image.png');
        fs.writeFileSync(outputPath, png);

        // Inject meta tags into the HTML
        const htmlPath = path.join(outputDir, 'index.html');
        if (fs.existsSync(htmlPath)) {
          let html = fs.readFileSync(htmlPath, 'utf-8');

          const ogImageUrl = `${SITE_URL}${routePath}/og-image.png`;
          const metaTags = [
            `<meta property="og:image" content="${ogImageUrl}">`,
            `<meta property="og:image:width" content="1200">`,
            `<meta property="og:image:height" content="630">`,
            `<meta name="twitter:card" content="summary_large_image">`,
            `<meta name="twitter:image" content="${ogImageUrl}">`,
          ].join('\n    ');

          html = html.replace('</head>', `    ${metaTags}\n  </head>`);
          fs.writeFileSync(htmlPath, html);
        }

        generatedCount++;
      }

      logger.success(`Generated ${generatedCount} OG images for blog posts`);
    },
  };
};

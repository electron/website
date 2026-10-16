/**
 * Plugin that emits `/llms.txt` and `/llms-full.txt` into the build output.
 *
 * - `llms.txt` is a curated, machine-readable index of the documentation that
 *   follows the https://llmstxt.org convention: an `H1`, a short summary, and
 *   `H2`-delimited lists of links. Each link points at the markdown version of
 *   a docs page (emitted by the `markdown-output` plugin) so that an LLM can
 *   fetch clean source instead of rendered HTML.
 * - `llms-full.txt` is every documentation page concatenated into a single
 *   file, intended to be dropped directly into an LLM context window.
 *
 * Both files are generated from the documentation at build time, so they stay
 * in sync with the docs automatically and require no manual maintenance.
 */

import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@docusaurus/logger';
import type { Plugin } from '@docusaurus/types';
import matter from 'gray-matter';

/** Documentation lives under `docs/latest`; its routes are served at `/docs/`. */
const DOCS_ROUTE_BASE = '/docs';
/** Source files (by basename) that are not user-facing docs pages. */
const EXCLUDED_BASENAMES = new Set(['README.md', 'CLAUDE.md']);
/** Descriptions are trimmed to this many characters in the curated index. */
const MAX_DESCRIPTION_LENGTH = 160;

/** A documentation page discovered from the markdown source tree. */
interface DocPage {
  /** Grouping key derived from the source path, e.g. `api` or `guides`. */
  group: string;
  title: string;
  description: string;
  /** Absolute URL of the rendered page. */
  pageUrl: string;
  /**
   * Absolute URL the curated index links to: the markdown version of the page
   * when one is emitted (by the `markdown-output` plugin), otherwise the page.
   */
  linkUrl: string;
  /** Markdown body of the page, without frontmatter. */
  body: string;
}

interface SectionDefinition {
  group: string;
  heading: string;
}

/**
 * Main sections of the curated index, in display order. Pages whose group is
 * not listed here are appended under a generic heading derived from the group.
 */
const MAIN_SECTIONS: SectionDefinition[] = [
  { group: 'overview', heading: 'Overview' },
  { group: 'guides', heading: 'Guides' },
  { group: 'api', heading: 'API Reference' },
  { group: 'structures', heading: 'API Structures' },
];

/**
 * Sections rendered under the spec's special `## Optional` heading: secondary
 * material an LLM can skip when a shorter context is needed. Contributing to
 * Electron itself is not required to build an app, so it lives here.
 */
const OPTIONAL_SECTIONS: SectionDefinition[] = [
  { group: 'development', heading: 'Development' },
];

/** Derives a grouping key from a path relative to `docs/latest`. */
function groupForRelativePath(relativeFromLatest: string): string {
  const [first, second] = relativeFromLatest.split(path.sep);

  // Top-level files (e.g. `why-electron.md`, `glossary.md`).
  if (!second) return 'overview';
  if (first === 'tutorial') return 'guides';
  if (first === 'api') return second === 'structures' ? 'structures' : 'api';
  if (first === 'development') return 'development';

  return first;
}

/**
 * Resolves the public URL of a docs page from its source path and frontmatter
 * slug. Mirrors Docusaurus slug resolution: an absolute slug (`/foo`) is
 * relative to the docs route base, while a relative slug resolves against the
 * page's own directory.
 */
function resolvePageUrl(relativeFromDocsRoot: string, slug?: string): string {
  const relativeNoExt = relativeFromDocsRoot.replace(/\.md$/, '');
  const posixNoExt = relativeNoExt.split(path.sep).join('/');

  if (slug?.startsWith('/')) {
    return path.posix.join(DOCS_ROUTE_BASE, slug);
  }

  const dir = path.posix.dirname(posixNoExt);
  const leaf = slug ?? path.posix.basename(posixNoExt);
  return path.posix.join(DOCS_ROUTE_BASE, dir, leaf);
}

/** Collapses whitespace and trims a frontmatter description to one line. */
function normalizeDescription(description: unknown): string {
  if (typeof description !== 'string') return '';

  const collapsed = description.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= MAX_DESCRIPTION_LENGTH) return collapsed;

  const truncated = collapsed.slice(0, MAX_DESCRIPTION_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : undefined).trimEnd()}…`;
}

/** Recursively collects every markdown file under a directory. */
function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Reads the documentation source tree and returns one {@link DocPage} per page,
 * sorted by section order and then alphabetically by title.
 */
export function collectDocPages(siteDir: string, siteUrl: string): DocPage[] {
  const docsRoot = path.join(siteDir, 'docs');
  const latestDir = path.join(docsRoot, 'latest');
  const baseUrl = siteUrl.replace(/\/$/, '');

  const pages: DocPage[] = [];

  for (const filePath of collectMarkdownFiles(latestDir)) {
    if (EXCLUDED_BASENAMES.has(path.basename(filePath))) continue;

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const relativeFromDocsRoot = path.relative(docsRoot, filePath);
    const relativeFromLatest = path.relative(latestDir, filePath);

    const slug = typeof data.slug === 'string' ? data.slug : undefined;
    const pagePath = resolvePageUrl(relativeFromDocsRoot, slug);

    // `markdown-output` derives the page from its route, so it only emits a
    // `.md` file when the route maps cleanly back to the source path. Pages
    // with a custom slug (e.g. the intro page) link to the rendered page.
    const sourcePath = path.posix.join(
      DOCS_ROUTE_BASE,
      relativeFromDocsRoot.replace(/\.md$/, '').split(path.sep).join('/'),
    );
    const hasMarkdown = pagePath === sourcePath;

    const title =
      typeof data.title === 'string' && data.title.length > 0
        ? data.title
        : path.basename(filePath, '.md');

    pages.push({
      group: groupForRelativePath(relativeFromLatest),
      title,
      description: normalizeDescription(data.description),
      pageUrl: `${baseUrl}${pagePath}`,
      linkUrl: hasMarkdown
        ? `${baseUrl}${path.posix.join(pagePath, 'index.md')}`
        : `${baseUrl}${pagePath}`,
      body: content.trim(),
    });
  }

  const sectionOrder = [...MAIN_SECTIONS, ...OPTIONAL_SECTIONS].map(
    (section) => section.group,
  );
  const rank = (group: string) => {
    const index = sectionOrder.indexOf(group);
    return index === -1 ? sectionOrder.length : index;
  };

  return pages.sort(
    (a, b) =>
      rank(a.group) - rank(b.group) ||
      a.group.localeCompare(b.group) ||
      a.title.localeCompare(b.title),
  );
}

/** Renders a single `- [title](url): description` list item. */
function renderLink(page: DocPage): string {
  const link = `- [${page.title}](${page.linkUrl})`;
  return page.description ? `${link}: ${page.description}` : link;
}

/** Renders an `## Heading` section for the given pages, or `''` if none. */
function renderSection(heading: string, pages: DocPage[]): string {
  if (pages.length === 0) return '';
  return `## ${heading}\n\n${pages.map(renderLink).join('\n')}\n`;
}

/** Builds the curated `llms.txt` index. */
export function renderIndex(
  pages: DocPage[],
  siteUrl: string,
  tagline: string,
): string {
  const baseUrl = siteUrl.replace(/\/$/, '');
  const byGroup = (group: string) =>
    pages.filter((page) => page.group === group);

  const renderedGroups = new Set<string>();
  const sections: string[] = [];

  for (const { group, heading } of MAIN_SECTIONS) {
    sections.push(renderSection(heading, byGroup(group)));
    renderedGroups.add(group);
  }

  // Any group not covered by an explicit section, alphabetically.
  const extraGroups = [...new Set(pages.map((page) => page.group))]
    .filter(
      (group) =>
        !renderedGroups.has(group) &&
        !OPTIONAL_SECTIONS.some((section) => section.group === group),
    )
    .sort();
  for (const group of extraGroups) {
    const heading = group.charAt(0).toUpperCase() + group.slice(1);
    sections.push(renderSection(heading, byGroup(group)));
  }

  const optionalPages = OPTIONAL_SECTIONS.flatMap(({ group }) =>
    byGroup(group),
  );
  const optionalSection = renderSection('Optional', optionalPages);

  const header = [
    '# Electron',
    '',
    `> ${tagline}`,
    '',
    'Electron is a framework for building cross-platform desktop applications ' +
      'with JavaScript, HTML, and CSS. Each link below points to the markdown ' +
      'source of a documentation page.',
    '',
    `The complete documentation is also available as a single file at ${baseUrl}/llms-full.txt.`,
  ].join('\n');

  const body = [...sections, optionalSection].filter(Boolean).join('\n');

  return `${header}\n\n${body}`;
}

/** Builds the concatenated `llms-full.txt`. */
export function renderFull(
  pages: DocPage[],
  siteUrl: string,
  tagline: string,
): string {
  const header = [
    '# Electron Documentation',
    '',
    `> ${tagline}`,
    '',
    'This file contains the full text of the Electron documentation, ' +
      'concatenated into a single document for use in LLM context windows. ' +
      `A curated index is available at ${siteUrl.replace(/\/$/, '')}/llms.txt.`,
  ].join('\n');

  const documents = pages.map(
    (page) => `# ${page.title}\n\nSource: ${page.pageUrl}\n\n${page.body}`,
  );

  return `${[header, ...documents].join('\n\n---\n\n')}\n`;
}

export default function llmsTxtPlugin(): Plugin {
  return {
    name: 'llms-txt-plugin',
    async postBuild({ siteDir, outDir, siteConfig }) {
      const latestDir = path.join(siteDir, 'docs', 'latest');
      if (!fs.existsSync(latestDir)) {
        logger.warn(
          'llms-txt: `docs/latest` not found, skipping llms.txt generation.',
        );
        return;
      }

      const { url, tagline } = siteConfig;
      const pages = collectDocPages(siteDir, url);

      await fs.promises.writeFile(
        path.join(outDir, 'llms.txt'),
        renderIndex(pages, url, tagline),
      );
      await fs.promises.writeFile(
        path.join(outDir, 'llms-full.txt'),
        renderFull(pages, url, tagline),
      );

      logger.success(
        `llms-txt: wrote llms.txt and llms-full.txt (${pages.length} pages).`,
      );
    },
  };
}

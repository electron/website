/**
 * Plugin to output index.md files alongside index.html in the build directory.
 * This copies the original markdown source files to their corresponding locations
 * in the build output. API docs that inherit members from a parent class get
 * those members added, as on the HTML page (see `inheritedMembersMarkdown`).
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from '@docusaurus/types';
import { logger } from '@docusaurus/logger';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import apiInheritedMembers from '../../transformers/api-inherited-members.ts';

/** Route prefixes to copy markdown files within. */
const PREFIXES = ['docs/', 'blog/'];

type Context = Parameters<Plugin['postBuild']>[0];

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
/** A GitHub alert marker, such as the `[!NOTE]` in `> [!NOTE]` */
const ALERT_MARKER = /^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;

/**
 * Returns the Markdown source of the doc at `sourcePath` with the members it
 * inherits from its parent class added, as `api-inherited-members.ts` adds
 * them to the HTML page, or `undefined` when the doc inherits nothing.
 *
 * The source text is kept as is: only the injected members are serialized,
 * and each run of them is inserted after the source block it follows.
 */
export function inheritedMembersMarkdown(
  sourcePath: string,
): string | undefined {
  const source = fs.readFileSync(sourcePath, 'utf-8');
  // Docusaurus strips the front matter before running remark plugins
  const frontMatter = FRONTMATTER.exec(source)?.[0] ?? '';
  const body = source.slice(frontMatter.length);

  const processor = remark()
    .use(remarkGfm)
    .use(apiInheritedMembers)
    .data('settings', {
      bullet: '*',
      emphasis: '_',
      handlers: {
        // Keep alert markers unescaped (`[!NOTE]`, not `\[!NOTE]`)
        text(node, parent, state, info) {
          const marker =
            parent?.children[0] === node
              ? ALERT_MARKER.exec(node.value)?.[0]
              : undefined;
          if (!marker) return state.safe(node.value, info);
          const rest = node.value.slice(marker.length);
          return marker + state.safe(rest, { ...info, before: ']' });
        },
      },
    });
  // The transformer changes the tree in place
  const tree = processor.parse(body);
  processor.runSync(tree, { path: sourcePath, value: body });

  // Injected nodes are the root children without a source position
  const { children } = tree;
  let output = '';
  let offset = 0;
  let start = 0;
  while (start < children.length) {
    if (children[start].position) {
      start++;
      continue;
    }
    let end = start;
    while (end < children.length && !children[end].position) end++;
    const at = children[start - 1]?.position?.end.offset ?? 0;
    const injected = processor.stringify({
      type: 'root',
      children: children.slice(start, end),
    });
    output += `${body.slice(offset, at)}\n\n${injected.trimEnd()}`;
    offset = at;
    start = end;
  }

  if (output === '') return undefined;
  return frontMatter + output + body.slice(offset);
}

function findMarkdownSource(
  routePath: string,
  { siteDir }: Context,
): string | null {
  for (const prefix of PREFIXES) {
    const routePrefix = `/${prefix}`;

    if (!routePath.startsWith(routePrefix)) continue;

    // Since routePrefix is absolute and routePath starts with routePrefix, it too must be absolute
    // meaning we can safely use path.relative to get the relative path
    const relativePath = path.relative(routePrefix, routePath);
    const sourceDir = path.join(siteDir, prefix);

    // Try direct file path first (e.g., /docs/tutorial/intro.md)
    const directPath = path.join(sourceDir, `${relativePath}.md`);
    if (fs.existsSync(directPath)) return directPath;

    // Try index.md in directory (e.g., /docs/tutorial/intro/index.md)
    const indexPath = path.join(sourceDir, relativePath, 'index.md');
    if (fs.existsSync(indexPath)) return indexPath;
  }

  return null;
}

function copyMarkdownForRoute(routePath: string, context: Context): boolean {
  const { outDir } = context;

  // Find corresponding markdown source
  const mdSourcePath = findMarkdownSource(routePath, context);
  if (!mdSourcePath) return false;

  // Check if HTML output exists
  const htmlPath = path.join(outDir, routePath, 'index.html');
  if (!fs.existsSync(htmlPath)) return false;

  // Copy markdown to output directory, with inherited API members added on
  // docs pages (the transformer runs on docs only, as in docusaurus.config.ts)
  const outputMdPath = path.join(outDir, routePath, 'index.md');
  const markdown = routePath.startsWith('/docs/')
    ? inheritedMembersMarkdown(mdSourcePath)
    : undefined;
  if (markdown === undefined) {
    fs.copyFileSync(mdSourcePath, outputMdPath);
  } else {
    fs.writeFileSync(outputMdPath, markdown);
  }

  return true;
}

export default function markdownOutputPlugin(): Plugin {
  return {
    name: 'markdown-output-plugin',
    postBuild(context) {
      logger.info('Copying markdown files to build directory...');

      // Filter to only routes in target prefixes
      const routes = context.routesPaths.filter((routePath) =>
        PREFIXES.some((prefix) => routePath.startsWith(`/${prefix}`)),
      );

      // Process all routes
      let copiedCount = 0;
      for (const routePath of routes) {
        if (copyMarkdownForRoute(routePath, context)) {
          copiedCount += 1;
        }
      }

      logger.success(`Copied ${copiedCount} markdown files to build directory`);
    },
  };
}

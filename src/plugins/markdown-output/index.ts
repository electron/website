/**
 * Plugin to output index.md files alongside index.html in the build directory.
 * This copies the original markdown source files to their corresponding locations
 * in the build output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { Plugin } from '@docusaurus/types';
import logger from '@docusaurus/logger';

/** Route prefixes to copy markdown files within. */
const PREFIXES = ['docs/', 'blog/'];

type Context = Parameters<Plugin['postBuild']>[0];

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

  // Copy markdown to output directory
  const outputMdPath = path.join(outDir, routePath, 'index.md');
  fs.copyFileSync(mdSourcePath, outputMdPath);

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

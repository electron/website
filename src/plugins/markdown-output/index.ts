/**
 * Plugin to output index.md files alongside index.html in the build directory.
 * This copies the original markdown source files to their corresponding locations
 * in the build output.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from '@docusaurus/types';
import logger from '@docusaurus/logger';

/** Route prefixes to copy markdown files within. */
const PREFIXES = ['docs/', 'blog/'];

type Context = Parameters<Plugin['postBuild']>[0];

async function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(
    () => true,
    () => false,
  );
}

async function findMarkdownSource(
  routePath: string,
  { siteDir }: Context,
): Promise<string | null> {
  for (const prefix of PREFIXES) {
    const routePrefix = `/${prefix}`;

    if (!routePath.startsWith(routePrefix)) continue;

    // Since routePrefix is absolute and routePath starts with routePrefix, it too must be absolute
    // meaning we can safely use path.relative to get the relative path
    const relativePath = path.relative(routePrefix, routePath);
    const sourceDir = path.join(siteDir, prefix);

    // Try direct file path first (e.g., /docs/tutorial/intro.md)
    const directPath = path.join(sourceDir, `${relativePath}.md`);
    if (await fileExists(directPath)) return directPath;

    // Try index.md in directory (e.g., /docs/tutorial/intro/index.md)
    const indexPath = path.join(sourceDir, relativePath, 'index.md');
    if (await fileExists(indexPath)) return indexPath;
  }

  return null;
}

async function copyMarkdownForRoute(
  routePath: string,
  context: Context,
): Promise<boolean> {
  const { outDir } = context;

  // Find corresponding markdown source
  const mdSourcePath = await findMarkdownSource(routePath, context);
  if (!mdSourcePath) return false;

  // Check if HTML output exists
  const htmlPath = path.join(outDir, routePath, 'index.html');
  if (!(await fileExists(htmlPath))) return false;

  // Copy markdown to output directory
  const outputMdPath = path.join(outDir, routePath, 'index.md');
  await fs.copyFile(mdSourcePath, outputMdPath);

  return true;
}

export default async function markdownOutputPlugin(): Promise<Plugin> {
  return {
    name: 'markdown-output-plugin',
    async postBuild(context) {
      logger.info('Copying markdown files to build directory...');

      // Filter to only routes in target prefixes
      const routes = context.routesPaths.filter((routePath) =>
        PREFIXES.some((prefix) => routePath.startsWith(`/${prefix}`)),
      );

      // Process all routes in parallel
      const results = await Promise.allSettled(
        routes.map((routePath) => copyMarkdownForRoute(routePath, context)),
      );

      // Count successful copies
      const copiedCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value,
      ).length;

      logger.success(`Copied ${copiedCount} markdown files to build directory`);
    },
  };
}

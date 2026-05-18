/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '@docusaurus/logger';

import { addFrontmatterToAllDocs } from './tasks/add-frontmatter.ts';
import { fixContent } from './tasks/md-fixers.ts';

const DOCS_FOLDER = path.join('docs', 'latest');

const start = async () => {
  // TODO(dsanders11): This is a nasty hack to get around
  // CJS vs ESM issues with Node.js type stripping. Once
  // Docusaurus fully supports ESM, switch this back to
  // just importing the config file directly and drop this.
  const configPath = path.join(
    import.meta.dirname,
    '..',
    'docusaurus.config.ts',
  );
  const configSource = await fs.readFile(configPath, 'utf8');
  const localesMatch = configSource.match(/locales:\s*\[([^\]]*)\]/);
  if (!localesMatch) {
    throw new Error('Could not find locales array in docusaurus.config.ts');
  }
  const locales = new Set(
    Array.from(
      localesMatch[1].matchAll(/'([^']+)'|"([^"]+)"/g),
      (m) => m[1] ?? m[2],
    ),
  );
  locales.delete('en');
  for (const locale of locales) {
    const localeDocs = path.join(
      'i18n',
      locale,
      'docusaurus-plugin-content-docs',
      'current',
    );
    const staticResources = ['fiddles', 'images'];

    logger.info(`Copying static assets to ${logger.green(locale)}`);
    for (const staticResource of staticResources) {
      await fs.cp(
        path.join(DOCS_FOLDER, staticResource),
        path.join(localeDocs, 'latest', staticResource),
        { recursive: true },
      );
    }

    logger.info(`Fixing markdown (${logger.green(locale)})`);
    await fixContent(localeDocs, 'latest');

    logger.info(`Adding automatic frontmatter (${logger.green(locale)})`);
    await addFrontmatterToAllDocs(path.join(localeDocs, 'latest'));
  }
};

start();

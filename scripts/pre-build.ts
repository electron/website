/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { logger } from '@docusaurus/logger';

import { latestElectronVersion } from '../src/util/latest-electron-version.ts';

import { copyLocalDocumentation, download } from './tasks/download-docs.ts';
import { addFrontmatterToAllDocs } from './tasks/add-frontmatter.ts';
import { fixContent } from './tasks/md-fixers.ts';
import { copyNewContent } from './tasks/copy-new-content.ts';
import { preprocessApiHistory } from './tasks/preprocess-api-history.ts';

const DOCS_FOLDER = path.join(import.meta.dirname, '..', 'docs', 'latest');

/**
 *
 * @param source The SHA to use to download our documentation.
 * This value should be passed only when targeting the latest stable.
 */
const start = async (source: string): Promise<void> => {
  logger.info(`Running ${logger.green('electronjs.org')} pre-build scripts...`);
  logger.info(`Deleting previous content at ${logger.green(DOCS_FOLDER)}`);
  await fs.rm(DOCS_FOLDER, { recursive: true, force: true });

  const localElectron =
    source && (source.includes('/') || source.includes('\\'));

  if (!localElectron) {
    const version = await latestElectronVersion();
    const stableBranch = version.replace(/\.\d+\.\d+/, '-x-y');
    logger.info(
      `Fetching ${logger.green(
        `electron`,
      )} information from npm: \n\t Latest version: ${logger.green(
        version,
      )} \n\t Stable branch: ${logger.green(stableBranch)}`,
    );

    const target = source || stableBranch;

    logger.info(`Downloading docs from ${logger.green(target)}`);
    await download({
      target,
      org: process.env.ORG || 'electron',
      repository: 'electron',
      destination: DOCS_FOLDER,
      downloadMatch: '/docs/',
    });
    await fs.writeFile(path.join(DOCS_FOLDER, '.sha'), target);
  } else if (existsSync(source)) {
    logger.info(
      `Copying local docs from ${logger.green(path.resolve(logger.green(source)))}`,
    );
    await copyLocalDocumentation({
      source,
      destination: DOCS_FOLDER,
      copyMatch: 'docs',
    });
  } else {
    logger.error(`Local path ${logger.red(source)} does not exist`);
    return process.exit(1);
  }

  logger.info('Copying additional content from website repository');
  await copyNewContent(DOCS_FOLDER);

  logger.info('Finding, validating, and uncommenting API history blocks');
  await preprocessApiHistory(DOCS_FOLDER);

  logger.info('Fixing markdown');
  await fixContent('docs', 'latest');

  logger.info('Adding automatic frontmatter');
  await addFrontmatterToAllDocs(DOCS_FOLDER);
};

start(process.argv[2]);

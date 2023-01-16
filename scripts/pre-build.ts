/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
import path from 'path';

import { existsSync, remove } from 'fs-extra';
import latestVersion from 'latest-version';
import logger from '@docusaurus/logger';

import { copy, download } from './tasks/download-docs';
import { addFrontmatterToAllDocs } from './tasks/add-frontmatter';
import { createSidebar } from './tasks/create-sidebar';
import { fixContent } from './tasks/md-fixers';
import { copyNewContent } from './tasks/copy-new-content';

const DOCS_FOLDER = path.join(__dirname, '..', 'docs', 'latest');

/**
 *
 * @param source The SHA to use to download our documentation.
 * This value should be passed only when targeting the latest stable.
 */
const start = async (source: string): Promise<void> => {
  logger.info(`Running ${logger.green('electronjs.org')} pre-build scripts...`);
  logger.info(`Deleting previous content at ${logger.green(DOCS_FOLDER)}`);
  await remove(DOCS_FOLDER);

  const localElectron =
    source && (source.includes('/') || source.includes('\\'));

  if (!localElectron) {
    const version = await latestVersion('electron');
    const stableBranch = version.replace(/\.\d+\.\d+/, '-x-y');
    logger.info(
      `Fetching ${logger.green(
        `electron`
      )} information from npm: \n\t Latest version: ${logger.green(
        version
      )} \n\t Stable branch: ${logger.green(stableBranch)}`
    );

    const target = source || stableBranch;

    logger.info(`Downloading docs from ${logger.green(target)}`);
    await download({
      target,
      org: process.env.ORG || 'electron',
      repository: 'electron',
      destination: DOCS_FOLDER,
      downloadMatch: 'docs',
    });
  } else if (existsSync(source)) {
    await copy({
      target: source,
      destination: DOCS_FOLDER,
      copyMatch: 'docs',
    });
  } else {
    logger.error(`Path ${localElectron} does not exist`);
    return process.exit(1);
  }

  logger.info('Copying new content');
  await copyNewContent(DOCS_FOLDER);

  logger.info('Fixing markdown');
  await fixContent('docs', 'latest');

  logger.info('Adding automatic frontmatter');
  await addFrontmatterToAllDocs(DOCS_FOLDER);

  logger.info('Updating website sidebar');
  await createSidebar('docs', path.join(process.cwd(), 'sidebars.js'));
};

start(process.argv[2]);

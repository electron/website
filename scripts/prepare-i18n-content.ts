/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
import path from 'path';
import fs from 'fs-extra';
import logger from '@docusaurus/logger';

import { addFrontmatterToAllDocs } from './tasks/add-frontmatter';
import { fixContent } from './tasks/md-fixers';
import config from '../docusaurusConfig';

const DOCS_FOLDER = path.join('docs', 'latest');

const start = async () => {
  const locales = new Set(config.i18n.locales);
  locales.delete('en');
  for (const locale of locales) {
    const localeDocs = path.join(
      'i18n',
      locale,
      'docusaurus-plugin-content-docs',
      'current'
    );
    const staticResources = ['fiddles', 'images'];

    logger.info(`Copying static assets to ${logger.green(locale)}`);
    for (const staticResource of staticResources) {
      await fs.copy(
        path.join(DOCS_FOLDER, staticResource),
        path.join(localeDocs, 'latest', staticResource)
      );
    }

    logger.info(`Fixing markdown (${logger.green(locale)})`);
    await fixContent(localeDocs, 'latest');

    logger.info(`Adding automatic frontmatter (${logger.green(locale)})`);
    await addFrontmatterToAllDocs(path.join(localeDocs, 'latest'));
  }
};

start();

/**
 * This is a pre-hook task that checks if the files `docusaurus.config.js` or
 * `sidebars.js` have been modified and if so makes sure that the files
 * needed for localization are regenerated.
 */
import logger from '@docusaurus/logger';

import { getChanges } from './utils/git-commands';
import { execute } from './utils/execute';

const files = ['docusaurus.config.js', 'sidebars.js'];

const start = async () => {
  logger.info(`Checking if the following files have been modified:
${files.join('\n')}`);
  const output = await getChanges();

  const needsRegeneration = files.some((file) => {
    return new RegExp(`M\\s+${file}`).test(output);
  });

  if (!needsRegeneration) {
    logger.info(`No changes found`);
    return;
  }

  await execute('yarn write-translations --locale en');

  const localeModified = (await getChanges()) !== output;

  if (localeModified) {
    logger.error(
      logger.red(
        'Contents in "/i18n/en/" have been modified. Please add the changes to your commit'
      )
    );
    process.exit(1);
  }
};

start();

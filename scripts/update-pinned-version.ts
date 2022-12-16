import path from 'path';

import logger from '@docusaurus/logger';
import fs from 'fs-extra';

const packageJsonPath = path.join(__dirname, '..', 'package.json');

/**
 * Updates the field `sha` of the `package.json` with the value passed
 * via parameter in the CLI.
 */
const updateSha = async (sha: string) => {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  const oldSha = packageJson.sha;
  logger.info(`New SHA: ${logger.green(sha)}`);
  logger.info(`Old SHA: ${logger.green(oldSha)}`);

  if (sha === oldSha) {
    logger.info(`Nothing to update`);
    return;
  }

  packageJson.sha = sha;

  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf-8'
  );

  logger.info(`SHA updated`);
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  const sha = process.argv[2];

  if (!sha) {
    logger.error('Please provide an SHA value as follows:');
    logger.error('yarn update-pinned-version <SHA>');
  } else {
    updateSha(sha);
  }
}

module.exports = {
  updateSha,
};

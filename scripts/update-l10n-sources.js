//@ts-check

/**
 * This is a pre-hook task that checks if the files `docusaurus.config.js` or
 * `sidebars.js` have been modified and if so makes sure that the files
 * needed for localization are regenerated.
 */

const { getChanges } = require('./utils/git-commands');
const del = require('del');
const { execute } = require('./utils/execute');

const files = ['docusaurus.config.js', 'sidebars.js'];

const start = async () => {
  console.log(`Checking if the following files have been modified:
${files.join('\n')}`);
  const output = await getChanges();

  const needsRegeneration = files.some((file) => {
    return new RegExp(`M\\s+${file}`).test(output);
  });

  if (!needsRegeneration) {
    console.log(`No changes found`);
    return;
  }

  await del('i18n/en-US');
  await execute('yarn write-translations --locale en-US');

  const localeModified = (await getChanges()) !== output;

  if (localeModified) {
    const pleaseCommit =
      'Contents in "/i18n/en-US/" have been modified. Please add the changes to your commit';
    console.error('\x1b[31m%s\x1b', pleaseCommit);
    process.exit(1);
  }
};

start();

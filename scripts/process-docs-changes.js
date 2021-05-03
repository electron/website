/**
 * Checks if there are any changes in the repo and creates or updates
 * a PR if needed. This is part of the `update-docs.yml` workflow and
 * depends on `update-pinned-version` and `prebuild` being run before
 * in order to produce the right result.
 */

//@ts-check
if (!(process.env.CI || process.env.NODE_ENV === 'test') && !GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN environment variable');
  process.exit(1);
}

const { createPR, getChanges, pushChanges } = require('./utils/git-commands');

const HEAD = 'main';
const PR_BRANCH = 'chore/docs-updates';
const COMMIT_MESSAGE = '"chore: update ref to docs (🤖)"';
const EMAIL = 'electron@github.com';
const NAME = 'electron-bot';

/**
 * Wraps a function on a try/catch and changes the exit code if it fails.
 * @param {Function} func
 */
const changeExitCodeIfException = async (func) => {
  try {
    await func();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

const processDocsChanges = async () => {
  const output = await getChanges();

  if (output === '') {
    console.log('Nothing updated, skipping');
    return;
  } else if (!output.includes('M package.json')) {
    console.log('package.json is not modified, skipping');
    return;
  } else {
    const lines = output.split('\n');
    if (lines.length > 1) {
      console.log(`New documents available, creating PR.`);
      await createPR(PR_BRANCH, HEAD, EMAIL, NAME, COMMIT_MESSAGE);
    } else {
      console.log(
        `Only existing content has been modified. Pushing changes directly.`
      );
      await pushChanges(HEAD, EMAIL, NAME, COMMIT_MESSAGE);
    }
  }
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  changeExitCodeIfException(processDocsChanges);
}

module.exports = {
  processDocsChanges,
};

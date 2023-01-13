import logger from '@docusaurus/logger';

import {
  createPR,
  getChanges,
  pushChanges,
  isCurrentBranchTracked,
  getCurrentBranchName,
} from './utils/git-commands';

const PR_BRANCH = 'chore/docs-updates';
const COMMIT_MESSAGE = '"chore: update ref to docs (🤖)"';
const EMAIL = 'electron@github.com';
const NAME = 'electron-bot';

/**
 * Checks if there are any changes in the repo and creates or updates
 * a PR if needed. This is part of the `update-docs.yml` workflow and
 * depends on `update-pinned-version` and `pre-build` being run before
 * in order to produce the right result.
 */
if (
  !(
    process.env.CI ||
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  ) &&
  !process.env.GITHUB_TOKEN
) {
  logger.error(`Missing ${logger.yellow('GITHUB_TOKEN')} environment variable`);
  process.exit(1);
}

/**
 * Checks if there are new document files (*.md) by parsing the given
 * `git status --porcelain` input.
 * This is done by looking at the status of each file:
 * - `A` means it is new and has been staged
 * - `??` means it is a new file and has not been staged yet
 */
const newDocFiles = (gitOutput: string) => {
  const lines = gitOutput.split('\n');
  const newFiles = lines.filter((line) => {
    const trimmedLine = line.trim();
    return (
      trimmedLine.endsWith('.md') &&
      (trimmedLine.startsWith('U') || trimmedLine.startsWith('??'))
    );
  });

  return newFiles;
};

/**
 * Analyzes the current `git status` of the local repo and branch to
 * see if there are new files or just modifications to existing ones.
 *
 * - If there is just modifications it pushes the changes directly to
 *   the branch upstream.
 * - If there is new content it creates a new branch and opens a PR for
 *   review. The format of the pr branch name is `chore/docs-updates` for `main`
 *   and `chore/docs-updates-vXX-Y-X` for the ones targetting `vXX-Y-X`.
 * - Creates a new branch and pushes the changes directly if it does
 *   not exist.
 */
export const processDocsChanges = async () => {
  const output = await getChanges();
  const branchIsTracked = await isCurrentBranchTracked();
  const branchName = await getCurrentBranchName();

  if (output === '') {
    logger.info('Nothing updated, skipping');
    return;
  } else {
    const newFiles = newDocFiles(output);
    const prBranchName =
      branchName === 'main' ? PR_BRANCH : `${PR_BRANCH}-${branchName}`;

    if (newFiles.length > 0 && branchIsTracked) {
      logger.info(`New documents available:
${newFiles.join('\n')}`);
      await createPR(prBranchName, branchName, EMAIL, NAME, COMMIT_MESSAGE);
    } else {
      logger.info(
        `Only existing content has been modified. Pushing changes directly.`
      );
      await pushChanges(branchName, EMAIL, NAME, COMMIT_MESSAGE);
    }
  }
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  process.addListener('unhandledRejection', (e) => {
    logger.error(e);
    process.exit(1);
  });

  processDocsChanges();
}

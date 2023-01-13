import github from '@actions/github';
import { execute } from './execute';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REVIEWERS = ['molant', 'erickzhao'];

/**
 * Creates a new commit with the current changes.
 */
export const createCommit = async (
  email: string,
  name: string,
  commitMessage: string
) => {
  await execute('git remote -vv');
  await execute('git status');
  await execute(`git config --global user.email ${email}`);
  await execute(`git config --global user.name ${name}`);
  await execute(`git add .`);
  await execute(`git commit -m ${commitMessage} --no-verify`);
};

/**
 * Returns the current modified files in the repo.
 */
export const getChanges = async () => {
  const { stdout } = await execute('git status --porcelain');

  return stdout.trim();
};

/**
 * Creates a new commit and pushes the given branch, creating it
 * upstream if needed.
 */
export const pushChanges = async (
  branch: string,
  email: string,
  name: string,
  message: string
) => {
  await createCommit(email, name, message);
  if (await isCurrentBranchTracked()) {
    await execute(`git pull --rebase`);
    await execute(`git push origin ${branch} --follow-tags`);
  } else {
    await execute(`git push --set-upstream origin ${branch}`);

    // HACK: This way GitHub actions for `pushes` on new branches are picked up
    await execute(`git push --force`);
  }
};

/**
 * Force pushes the changes to the documentation update branch
 * and creates a new PR if there is none available with review
 * request for `REVIEWERS`.
 */
export const createPR = async (
  branch: string,
  base: string,
  email: string,
  name: string,
  message: string
) => {
  await createCommit(email, name, message);

  if ((await getCurrentBranchName()) !== branch) {
    await execute(`git checkout -b ${branch}`);
  }

  await execute(`git push --force --set-upstream origin ${branch}`);

  console.log(`Changes pushed to ${branch}`);

  const { context } = github;
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const pulls = await octokit.pulls.list({
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open',
  });

  const doesExist = pulls.data.some((pull) => {
    return pull.head.ref === branch;
  });

  if (doesExist) {
    console.log('PR already exists, nothing to do');
  } else {
    console.log('Creating PR');
    const result = await octokit.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: message,
      base,
      head: branch,
    });

    console.log(`PR created (#${result.data.id})`);

    await octokit.pulls.requestReviewers({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: result.data.id,
      reviewers: REVIEWERS,
    });
  }
};

/**
 * Returns an array with the remote branches.
 */
export const getRemoteBranches = async () => {
  const { stdout } = await execute(`git branch -r`);

  /**
   * The output of the command above is similar to
   *
   * ```
   * origin/HEAD -> origin/main
   * origin/v15-x-y
   * origin/v14-x-y
   * origin/feat/i18n
   * ```
   *
   * We do not need `HEAD` so we filter it out
   */
  const branches = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !line.includes('->') && line.startsWith('origin'));

  return branches;
};

/**
 * Determines if the active branch is current tracked in the
 * remote by calling `git branch -vv` and parsing the output.
 *
 * The output has the following form:
 *
 * ```plain
 *   bots             3527526ae110 fix: docs automerge
 * * versioned-docs   0fe736ed2529 [origin/versioned-docs] feat: versioned docs
 * ```
 *
 * In the case above the branch `bots` is not tracked (no
 * `[origin/]` information) and is not the active branch (no `*`).
 */
export const isCurrentBranchTracked = async () => {
  const { stdout } = await execute(`git branch -vv`);

  const lines = stdout.trim().split('\n');
  const current = lines.filter((line) => line.trim().startsWith('*'));

  if (!current) {
    throw new Error(`Couldn't determine current branch`);
  }

  return current.includes(`[origin/`);
};

/**
 * Returns the name of the current branch
 */
export const getCurrentBranchName = async () => {
  const { stdout } = await execute(`git branch --show-current`);
  return stdout;
};

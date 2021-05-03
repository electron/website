const github = require('@actions/github');
const { execute } = require('./execute');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Creates a new commit with the current changes.
 * @param {string} email
 * @param {string} name
 * @param {string} commitMessage
 */
const createCommit = async (email, name, commitMessage) => {
  await execute('git remote -vv');
  await execute('git status');
  await execute(`git config --global user.email ${email}`);
  await execute(`git config --global user.name ${name}`);
  await execute(`git add .`);
  await execute(`git commit -am ${commitMessage}`);
};

/**
 * Returns the current modified files in the repo.
 */
const getChanges = async () => {
  const { stdout } = await execute('git status --porcelain');

  return stdout.trim();
};

/**
 * Creates a new commit and pushes the given branch
 * @param {string} branch
 * @param {string} email
 * @param {string} name
 * @param {string} message
 */
const pushChanges = async (branch, email, name, message) => {
  await createCommit(email, name, message);
  await execute(`git pull --rebase`);
  await execute(`git push origin ${branch} --follow-tags`);
};

/**
 * Force pushes the changes to the documentation update branch
 * and creates a new PR if there is none available.
 * @param {string} branch
 * @param {string} base
 * @param {string} email
 * @param {string} name
 * @param {string} message
 */
const createPR = async (branch, base, email, name, message) => {
  await createCommit(email, name, message);
  await execute(`git checkout -b ${branch}`);
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
  }
};

module.exports = {
  createPR,
  getChanges,
  pushChanges,
};

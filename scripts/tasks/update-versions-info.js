//@ts-check
const fs = require('fs').promises;

const {
  getRemoteBranches,
  getCurrentBranchName,
} = require('../utils/git-commands');

const VERSIONS_INFO = 'versions-info.json';

const createVersionEntry = (options) => {
  return {
    label: options.label || options.version,
    href: `https://electronjs.org/docs/${options.version}`,
    target: `_blank`,
  };
};

/**
 * Updates the `versions-info.json` file if it is
 * in the `main` branch, and creates a default
 * one with a link to `latest` if on a versioned branch.
 * @param {string} latest
 */
const updateVersionsInfo = async (latest) => {
  const current = await getCurrentBranchName();
  const versions = [createVersionEntry({ label: latest, version: 'latest' })];

  if (!/v\d+-x-y/.test(current)) {
    const branches = await getRemoteBranches();
    const tracked = branches
      .map((branch) => branch.split('/').pop())
      .filter((branch) => /v\d+-x-y/.test(branch))
      .map((version) => createVersionEntry({ version }));

    versions.push(...tracked);
  }

  await fs.writeFile(VERSIONS_INFO, JSON.stringify(versions, null, 2), 'utf-8');
};

module.exports = {
  updateVersionsInfo,
};

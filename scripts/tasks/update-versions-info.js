//@ts-check
const fs = require('fs').promises;

const {
  getRemoteBranches,
  getCurrentBranchName,
} = require('../utils/git-commands');

const VERSIONS_INFO = 'versions-info.json';

const updateVersionsInfo = async () => {
  const branches = await getRemoteBranches();
  const versions = branches
    .map((branch) => branch.split('/').pop())
    .filter((branch) => /v\d+-x-y/.test(branch));

  // We might be creating a new docs version branch
  const current = await getCurrentBranchName();
  if (!versions.includes(current)) {
    versions.push(current);
  }

  const localVersions = JSON.parse(await fs.readFile(VERSIONS_INFO, 'utf-8'));

  for (const version of versions) {
    let exists = false;
    for (const localVersion of localVersions) {
      console.log(localVersion);
      console.log(version);
      exists = exists || localVersion.label === version;
    }

    if (!exists) {
      console.log(`New version ${version} found`);
      localVersions.push({
        label: version,
        href: `https://electronjs.org/docs/${version}`,
        target: '_blank',
      });
    }
  }

  await fs.writeFile(
    VERSIONS_INFO,
    JSON.stringify(localVersions, null, 2),
    'utf-8'
  );
};

module.exports = {
  updateVersionsInfo: updateVersionsInfo,
};

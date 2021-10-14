//@ts-check
const fs = require('fs').promises;

const { getRemoteBranches } = require('../utils/git-commands');

const VERSIONS_INFO = 'versions-info.json';

const updateVersionsInfo = async () => {
  const branches = await getRemoteBranches();
  const versions = branches
    .map((branch) => branch.split('/').pop())
    .filter((branch) => /v\d+-x-y/.test(branch));

  const localVersions = JSON.parse(
    await fs.readFile(VERSIONS_INFO, 'utf-8')
  ).map((item) => item.label);

  for (const version of versions) {
    if (!localVersions.includes(version)) {
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

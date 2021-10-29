//@ts-check
const got = require('got');
const remark = require('remark');
const toString = require('mdast-util-to-string');
const fs = require('fs-extra');
const path = require('path');
const { getChanges, getCurrentBranchName, pushChanges } = require('./utils/git-commands');

const COMMIT_MESSAGE = '"chore: update governance member data (🤖)"';
const EMAIL = 'electron@github.com';
const NAME = 'electron-bot';

/**
 * Fetch the contents of each `electron/governance` working group
 * README.md file, parse the contents using `remark`, and write the
 * output array to `_data.json`.
 */
async function main() {
  const data = JSON.stringify(await fetchGovernanceData());
  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'pages', 'governance', '_data.json'),
    data
  );

  const output = await getChanges();

  if (output === '') {
    console.log('Nothing updated, skipping');
    return;
  } else {
    console.log('Changes in governance members detected, pushing...');
    const branchName = await getCurrentBranchName();
    await pushChanges(branchName, EMAIL, NAME, COMMIT_MESSAGE);
  }
}

/**
 * Working Group information to display on the governance page.
 * @typedef {Object} WorkingGroup
 * @property {string} name - Name of the WG.
 * @property {string} description - Short description of the WG's responsibilities.
 * @property {string} chair - GitHub handle for the WG chair.
 * @property {string[]} members - List of members-at-large of the WG.
 */
async function fetchGovernanceData() {
  const groupNames = [
    'administrative',
    'api',
    'community-safety',
    'ecosystem',
    'outreach',
    'releases',
    'security',
    'upgrades',
  ];

  const groups = await Promise.all(groupNames.map(getWGInfo));
  return groups;
}

/**
 * @param {string} workingGroup 
 * @returns {Promise<WorkingGroup>}
 */
async function getWGInfo(workingGroup) {
  const readme = await getGitHubREADME(workingGroup);
  const rootNode = remark().parse(readme);


  if (!Array.isArray(rootNode.children)) {
    throw new Error('Incorrect README file?');
  }

  // All governance READMEs have the WG name
  // as the first line and the WG description in the
  // second line.
  const name = toString(rootNode.children[0])
    .replace(' WG', '')
    .replace(' Working Group', '');
  const description = toString(rootNode.children[1]);
  const table = rootNode.children
    .find(child => child.type === 'table');
  
  const rows = table.children.slice(1); // get rid of first header row
  const wgMembers = rows.reduce((acc, row) => {
    // skip rows that have empty table cells
    if (row.children.some(cell => !toString(cell))) return acc;
    const member = row.children[1].children[1].url.replace('https://github.com/', '');
    const status = toString(row.children[2].children[0]);
  
    if (status === 'Chair') {
      acc.chair = member;
    } else {
      acc.members.push(member);
    }
    return acc;
  }, {chair: '', members: []});

  return { name, description, ...wgMembers };
}

/**
 * Fetches the string content of a working group's
 * README file in the `electron/governance` repo.
 * @param {string} workingGroup - Name of the WG
 * @returns String contents of the WG's README
 */
async function getGitHubREADME(workingGroup) {
  const headers = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  // @ts-ignore: export error?
  const res = await got(`https://api.github.com/repos/electron/governance/contents/wg-${workingGroup}/README.md`,
    { headers }
  );
  const { content } = JSON.parse(res.body);
  return Buffer.from(content, 'base64').toString();
}

if (require.main === module) {
  process.addListener('unhandledRejection', (e) => {
    console.error(e);
    process.exit(1);
  });

  main();
}

module.exports = { fetchGovernanceData };

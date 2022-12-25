//@ts-check
const del = require('del');
const globby = require('globby');
const got = require('got').default;
const remark = require('remark');
const gfm = require('remark-gfm');
const toString = require('mdast-util-to-string');
const fs = require('fs-extra');
const path = require('path');
const {
  getChanges,
  getCurrentBranchName,
  pushChanges,
} = require('./utils/git-commands');
const { download } = require('./tasks/download-docs');

const COMMIT_MESSAGE = '"chore: update governance member data (🤖)"';
const EMAIL = 'electron@github.com';
const GOVERNANCE_FOLDER = 'governance';
const GOVERNANCE_STAGING_FOLDER = '.governance';
const NAME = 'electron-bot';

const headers = {};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}
const client = got.extend({
  // @ts-ignore: export error?
  headers,
});

/**
 * Fetch the contents of each `electron/governance` working group
 * README.md file, parse the contents using `remark`, and write the
 * output array to `_data.json`.
 */
async function main() {
  console.log('Fetching governance data...');
  const data = JSON.stringify(await fetchGovernanceData());
  const targetPath = path.join(
    __dirname,
    '..',
    'src',
    'components',
    'governance',
    '_data.json'
  );
  console.log('Writing to disk...');
  await fs.writeFile(targetPath, data);
  console.log('✅');

  console.log('Fetching governance docs...');
  await del(GOVERNANCE_STAGING_FOLDER);
  if (process.env.LOCAL_GOVERNANCE) {
    fs.copySync(process.env.LOCAL_GOVERNANCE, GOVERNANCE_STAGING_FOLDER);
  } else {
    await download({
      target: 'main',
      org: process.env.ORG || 'electron',
      repository: 'governance',
      destination: GOVERNANCE_STAGING_FOLDER,
      downloadMatch: '',
    });
  }
  console.log('✅');

  console.log('Processing governance docs...');
  await processGovernanceFiles();

  await del(GOVERNANCE_FOLDER);
  await fs.move(GOVERNANCE_STAGING_FOLDER, GOVERNANCE_FOLDER);
  console.log('✅');

  const output = await getChanges();

  if (output.includes('governance/')) {
    console.log('Changes in governance members detected, pushing...');
    const branchName = await getCurrentBranchName();
    await pushChanges(branchName, EMAIL, NAME, COMMIT_MESSAGE);
  } else {
    console.log('Nothing updated, skipping');
    return;
  }
}

/**
 * Removes / cleans the files downloaded from the governance repository
 * for display on the electron website.
 */
async function processGovernanceFiles() {
  const currentFolders = await fs.readdir(GOVERNANCE_STAGING_FOLDER);
  for (const folder of currentFolders) {
    // Allow working group folders
    if (folder.startsWith('wg-')) {
      const groupFolder = path.join(GOVERNANCE_STAGING_FOLDER, folder);

      // Remove folders we don't particularly want to host / index on the website
      for (const badSubFolder of ['meeting-notes', 'spec-documents', 'emails', 'incidents', 'scripts']) {
        await fs.remove(path.join(groupFolder, badSubFolder));
      }

      // Add some useful frontmatter
      const readmePath = path.join(groupFolder, 'README.md');
      const currentReadme = await fs.readFile(readmePath, 'utf8')
      const noWG = currentReadme.substr(2).split(' WG')[0];
      await fs.writeFile(readmePath, `---
title: ${noWG}
---

${currentReadme}`);

      // Then move it somewhere cool and allow it
      await fs.move(groupFolder, path.join(GOVERNANCE_STAGING_FOLDER, 'groups', folder.substr(3)));
      continue;
    }
    // Allow charter and policy folders
    if (folder === 'charter' || folder === 'policy') continue;
    // We're moving /wg-* to /groups/$1 so allow it
    if (folder === 'groups') continue;

    await fs.remove(path.join(GOVERNANCE_STAGING_FOLDER, folder));
  }

  await fs.writeJson(path.join(GOVERNANCE_STAGING_FOLDER, 'groups', '_category_.json'), {
    label: 'Working Groups',
    collapsible: false,
    collapsed: false,
  });

  await fs.writeJson(path.join(GOVERNANCE_STAGING_FOLDER, 'groups', 'administrative', 'initiatives', '_category_.json'), {
    label: 'Initiatives',
  });

  await fs.writeJson(path.join(GOVERNANCE_STAGING_FOLDER, 'groups', 'infra', 'policy', '_category_.json'), {
    label: 'Policies',
  });

  await fs.writeJson(path.join(GOVERNANCE_STAGING_FOLDER, 'groups', 'releases', 'retros', '_category_.json'), {
    label: 'Retros',
  });

  await fs.writeFile(path.join(GOVERNANCE_STAGING_FOLDER, 'index.mdx'), `---
title: Governance
hide_title: true
sidebar_position: 0
hide_table_of_contents: true
---

import Governance from '@site/src/components/governance';

<Governance />`);
}

/**
 * Gets a list of all current working groups, e.g. api,releases,upgrades
 * @returns {Promise<string[]>} array of working group names without wg prefix
 */
async function fetchGovernanceWorkingGroupNames() {
  const topLevelEntries = await client('https://api.github.com/repos/electron/governance/contents/').json();
  return topLevelEntries
    .filter(entry => entry.type === 'dir' && entry.name.startsWith('wg-'))
    .map(entry => entry.name.substr(3));
}

/**
 * Working Group information to display on the governance page.
 * @typedef {Object} WorkingGroup
 * @property {string} name - Name of the WG.
 * @property {string} description - Short description of the WG's responsibilities.
 * @property {string} link - Link to WG README on GitHub.
 * @property {string} chair - GitHub handle for the WG chair.
 * @property {string[]} members - List of members-at-large of the WG.
 */
async function fetchGovernanceData() {
  const groupNames = await fetchGovernanceWorkingGroupNames();

  const groups = await Promise.all(groupNames.map(getWGInfo));
  return groups;
}

/**
 * @param {string} workingGroup
 * @returns {Promise<WorkingGroup>}
 */
async function getWGInfo(workingGroup) {
  const readme = await getGitHubREADME(workingGroup);
  const rootNode = remark()
    .use(gfm)
    .parse(readme);

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
  const table = rootNode.children.find((child) => child.type === 'table');

  const rows = table.children.slice(1); // get rid of first header row
  const wgMembers = rows.reduce(
    (acc, row) => {
      // skip rows that have empty table cells
      if (row.children.some((cell) => !toString(cell))) return acc;
      const member = row.children[1].children[1].url.replace(
        'https://github.com/',
        ''
      );
      const status = toString(row.children[2].children[0]);

      if (status === 'Chair') {
        acc.chair = member;
      } else {
        acc.members.push(member);
      }
      return acc;
    },
    { chair: '', members: [] }
  );

  return { name, slug: workingGroup, description, ...wgMembers };
}

/**
 * Fetches the string content of a working group's
 * README file in the `electron/governance` repo.
 * @param {string} workingGroup - Name of the WG
 * @returns String contents of the WG's README
 */
async function getGitHubREADME(workingGroup) {
  const data = await client(
    `https://api.github.com/repos/electron/governance/contents/wg-${workingGroup}/README.md`
  ).json();
  // the `content` property is a base64-encoded string
  // containing the file contents.
  const { content } = data;
  // use a buffer to extract the README string.
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

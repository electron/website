//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
const path = require('path');
const { existsSync } = require('fs');

const del = require('del');
const latestVersion = require('latest-version');

const { copy, download } = require('./tasks/download-docs');
const { addFrontmatter } = require('./tasks/add-frontmatter');
const { createSidebar } = require('./tasks/create-sidebar');
const { fixContent } = require('./tasks/md-fixers');
const { copyNewContent } = require('./tasks/copy-new-content');
const { updateVersionsInfo } = require('./tasks/update-versions-info');
const { sha } = require('../package.json');
const { interpolate } = require('./tasks/interpolators');

const DOCS_FOLDER = path.join('docs', 'latest');

/**
 *
 * @param {string} source The SHA to use to download
 * @param {string} [targetVersion] The branch where the SHA is comming from.
 * This value should be passed only when targetting the latest stable.
 */
const start = async (source, targetVersion) => {
  console.log(`Deleting previous content`);
  await del(DOCS_FOLDER);

  const localElectron =
    source && (source.includes('/') || source.includes('\\'));

  if (!localElectron) {
    console.log(`Detecting latest Electron version`);
    const version = await latestVersion('electron');
    const stableBranch = version.replace(/\.\d+\.\d+/, '-x-y');
    console.log(`Latest version: ${version}`);
    console.log(`Stable branch:  ${stableBranch}`);
    console.log(`Specified SHA:  ${sha}`);

    const target = source || sha || stableBranch;

    console.log(`Downloading docs using "${target}"`);
    await download({
      target,
      org: process.env.ORG || 'electron',
      repository: 'electron',
      destination: DOCS_FOLDER,
      downloadMatch: 'docs',
    });
  } else if (existsSync(source)) {
    await copy({
      target: source,
      destination: DOCS_FOLDER,
      downloadMatch: 'docs',
    });
  } else {
    console.error(`Path ${localElectron} does not exist`);
    return process.exit(-1);
  }

  console.log('Copying new content');
  await copyNewContent(DOCS_FOLDER);

  console.log('Fixing markdown');
  await fixContent('docs', 'latest');

  console.log('Adding automatic frontmatter');
  await addFrontmatter(DOCS_FOLDER);

  console.log('Updating sidebar.js');
  await createSidebar('docs', path.join(process.cwd(), 'sidebars.js'));

  console.log(`Interpolating tables`);
  await interpolate('docs');

  console.log('Updating docs versions');
  await updateVersionsInfo(targetVersion || 'Latest');
};

start(process.argv[2], process.argv[3]);

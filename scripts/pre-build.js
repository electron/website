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

const DOCS_FOLDER = 'docs';
// const BLOG_FOLDER = 'blog';

/**
 *
 * @param {string} localElectron
 */
const start = async (localElectron) => {
  console.log(`Detecting latest Electron version`);
  const version = await latestVersion('electron');
  const stableBranch = version.replace(/\.\d+\.\d+/, '-x-y');
  console.log(`Latest version: ${version}`);
  console.log(`Stable branch: ${stableBranch}`);

  console.log(`Deleting previous content`);
  await del(DOCS_FOLDER);
  // TODO: Uncomment once we have the blog up and running
  // await del(BLOG_FOLDER);

  if (!localElectron) {
    console.log(`Downloading docs from branch "${stableBranch}"`);
    await download({
      target: stableBranch,
      repository: 'electron',
      destination: DOCS_FOLDER,
      downloadMatch: 'docs',
    });
  } else if (existsSync(localElectron)) {
    await copy({
      target: localElectron,
      destination: DOCS_FOLDER,
      downloadMatch: 'docs',
    });
  } else {
    console.error(`Path ${localElectron} does not exist`);
    return process.exit(-1);
  }

  // TODO: Uncoment once we have the blog enabled
  // console.log(`Downloading posts`);
  // await download({
  //   target: 'master',
  //   repository: 'electronjs.org',
  //   destination: BLOG_FOLDER,
  //   downloadMatch: 'data/blog',
  // });

  console.log('Fixing markdown');
  await fixContent(DOCS_FOLDER);

  console.log('Adding automatic frontmatter');
  await addFrontmatter(DOCS_FOLDER);

  console.log('Updating sidebar.js');
  await createSidebar(DOCS_FOLDER, path.join(process.cwd(), 'sidebars.js'));
};

start(process.argv[2]);

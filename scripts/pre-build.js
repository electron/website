//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
const path = require('path');
const del = require('del');

const { copy, download } = require('./tasks/download-docs');
const { addFrontmatter } = require('./tasks/add-frontmatter');
const { createSidebar } = require('./tasks/create-sidebar');
const { fixContent } = require('./tasks/md-fixers');
const { existsSync, fstat } = require('fs');

const DOCS_FOLDER = 'docs';
const BLOG_FOLDER = 'blog';
// TODO: Figure out the latest release
const VERSION = '12-x-y';

/**
 *
 * @param {string} localElectron
 */
const start = async (localElectron) => {
  console.log(`Deleting previous content`);
  await del(DOCS_FOLDER);
  // TODO: Uncomment once we have the blog up and running
  // await del(BLOG_FOLDER);

  if (!localElectron) {
    console.log(`Downloading docs for "v${VERSION}"`);
    await download({
      target: VERSION,
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

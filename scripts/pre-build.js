//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
const path = require('path');
const del = require('del');

const { download } = require('./tasks/download-docs');
const { addFrontmatter } = require('./tasks/add-frontmatter');
const { createSidebar } = require('./tasks/create-sidebar');
const { fixContent } = require('./tasks/md-fixers');

const DOCS_FOLDER = 'docs';
const BLOG_FOLDER = 'blog';
// TODO: Figure out the latest release
const VERSION = '12-x-y';

const start = async () => {
  console.log(`Deleting previous content`);
  await del(DOCS_FOLDER);
  await del(BLOG_FOLDER);

  console.log(`Downloading docs for "v${VERSION}"`);
  await download({
    target: VERSION,
    repository: 'electron',
    destination: DOCS_FOLDER,
    downloadMatch: 'docs',
  });

  console.log(`Downloading posts`);
  await download({
    target: 'master',
    repository: 'electronjs.org',
    destination: BLOG_FOLDER,
    downloadMatch: 'data/blog',
  });

  console.log('Adding automatic frontmatter');
  await addFrontmatter(DOCS_FOLDER);

  console.log('Updating sidebar.js');
  await createSidebar(DOCS_FOLDER, path.join(process.cwd(), 'sidebars.js'));

  console.log('Fixing markdown');
  await fixContent(DOCS_FOLDER);
};

start();

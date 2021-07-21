//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const path = require('path');
const { existsSync } = require('fs');
const fs = require('fs-extra');

const del = require('del');
const latestVersion = require('latest-version');

const { copy, download } = require('./tasks/download-docs');
const { addFrontmatter } = require('./tasks/add-frontmatter');
const { createSidebar } = require('./tasks/create-sidebar');
const { fixContent } = require('./tasks/md-fixers');
const { copyNewContent } = require('./tasks/copy-new-content');
const { sha } = require('../package.json');
const { downloadTranslations } = require('./tasks/download-translations');

const DOCS_FOLDER = path.join('docs', 'latest');
const I18N_FOLDER = 'i18n';
// const BLOG_FOLDER = 'blog';

/**
 *
 * @param {string} source
 */
const start = async (source) => {
  console.log(`Deleting previous content`);
  await del(DOCS_FOLDER);

  const localElectron =
    source && (source.includes('/') || source.includes('\\'));

  // TODO: Uncomment once we have the blog up and running
  // await del(BLOG_FOLDER);

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

  console.log('Downloading translations');
  const locales = await downloadTranslations(I18N_FOLDER);

  for (const locale of locales) {
    const localeDocs = path.join(
      I18N_FOLDER,
      locale,
      'docusaurus-plugin-content-docs',
      'current'
    );
    const staticResources = ['fiddles', 'images'];

    console.log(`Copying static assets to ${locale}`);
    for (const staticResource of staticResources) {
      await fs.copy(
        path.join(DOCS_FOLDER, staticResource),
        path.join(localeDocs, 'latest', staticResource)
      );
    }

    console.log(`Fixing markdown (${locale})`);
    await fixContent(localeDocs, 'latest');

    console.log(`Adding automatic frontmatter (${locale})`);
    await addFrontmatter(path.join(localeDocs, 'latest'));
  }
};

process.on('unhandledRejection', (error) => {
  console.error(error);

  process.exit(1);
});

start(process.argv[2]);

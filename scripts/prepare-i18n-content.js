//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
const path = require('path');
const fs = require('fs-extra');

const { addFrontmatter } = require('./tasks/add-frontmatter');
const { fixContent } = require('./tasks/md-fixers');

const DOCS_FOLDER = path.join('docs', 'latest');
const {
  i18n: { locales: configuredLocales },
} = require('../docusaurus.config');

const start = async () => {
  const locales = new Set(configuredLocales);
  locales.delete('en');
  for (const locale of locales) {
    const localeDocs = path.join(
      'i18n',
      locale,
      'docusaurus-plugin-content-docs',
      'current'
    );
    const staticResources = ['fiddles', 'images'];

    console.log(`Copying static assets to ${locale}`);
    await Promise.all(staticResources.map((staticResource) => fs.copy(
      path.join(DOCS_FOLDER, staticResource),
      path.join(localeDocs, 'latest', staticResource)
    )));

    console.log(`Fixing markdown (${locale})`);
    await fixContent(localeDocs, 'latest');

    console.log(`Adding automatic frontmatter (${locale})`);
    await addFrontmatter(path.join(localeDocs, 'latest'));
  }
};

start();

/**
 * This script takes a version passed as a parameter (i.e. v15-x-y), the
 * current contents available under `/docs/latest`, and builds the project
 * in such a way that the documentation is made available under
 * `/docs/v15-x-y` or equivalent.
 */

//@ts-check

const fs = require('fs-extra');
const globby = require('globby');

/**
 *
 * @param {string} version
 */
const moveDocs = async (version) => {
  await fs.move('docs/latest', `docs/${version}`);

  const files = await globby([`docs/${version}/**/*.md`]);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    let updatedContent = content.replace(/docs\/latest/gm, `docs/${version}`);
    updatedContent = content.replace(/latest\//gm, `${version}/`);
    await fs.writeFile(file, updatedContent, 'utf-8');
  }
};

/**
 *
 * @param {string} version
 */
const updateConfigFiles = async (version) => {
  const configFiles = ['docusaurus.config.js', 'sidebars.js'];
  for (const configFile of configFiles) {
    const content = await fs.readFile(configFile, 'utf-8');
    const updatedContent = content.replace(/latest/g, version);

    await fs.writeFile(configFile, updatedContent, 'utf-8');
  }
};

/**
 *
 * @param {string} version
 */
const publishAsVersion = async (version) => {
  await moveDocs(version);
  await updateConfigFiles(version);
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  const version = process.argv[2];

  if (!version) {
    console.error('Please provide a version');
  } else if (!version.match(/v\d+/)) {
    console.error('Version should be like "v12"');
  } else {
    publishAsVersion(version);
  }
}

module.exports = {
  publishAsVersion,
};

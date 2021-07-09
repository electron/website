//@ts-check

/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 */
const path = require('path');
const { existsSync } = require('fs');
const fs = require('fs-extra');

const latestVersion = require('latest-version');

const { cleanProject } = require('./tasks/clean-project');
const { download } = require('./tasks/download-docs');
const { copy, copyStaticAssets } = require('./tasks/reorg-docs');
const { addFrontmatter } = require('./tasks/add-frontmatter');
const { createSidebar } = require('./tasks/create-sidebar');
const { fixContent } = require('./tasks/md-fixers');
const { copyNewContent } = require('./tasks/copy-new-content');
const { downloadTranslations } = require('./tasks/download-translations');

const { sha } = require('../package.json');

const DOCS_FOLDER = 'docs';
const DOCS_TEMP_FOLDER = 'temp-docs';
const TEMP_I18N_FOLDER = 'temp-i18n';
const I18N_FOLDER = 'i18n';

const CROWDIN_CONTENT_PATH = path.join(
  TEMP_I18N_FOLDER,
  '[electron.i18n] master/content'
);
// const BLOG_FOLDER = 'blog';

/**
 * Performs all the required transformations and fixes for the given path.
 * @param {string} localeTarget The root where or the markdown docs are. For the
 * original content it should be `docs/`, and
 * `i18n/%locale%/docusaurus-plugin-content-docs/current/` for the localized one.
 */
const processLocale = async (localeTarget) => {
  console.log('Copying new content');
  await copyNewContent(localeTarget);

  console.log('Fixing markdown');
  await fixContent(localeTarget);

  console.log('Adding automatic frontmatter');
  await addFrontmatter(localeTarget);
};

/**
 * Updates the navbar for the original content and the localized one.
 * @param {string} localeTarget
 */
const processNavigations = async (localeTarget) => {
  console.log('Updating sidebar.js');
  if (!localeTarget.includes(I18N_FOLDER)) {
    await createSidebar(localeTarget, path.join(process.cwd(), 'sidebars.js'));
  }
};

/**
 * Downloads the translations from Crowdin and makes sure all the files
 * are in the right place or generated if needed.
 */
const processLocales = async () => {
  console.log('Downloading latest translations');
  await downloadTranslations(TEMP_I18N_FOLDER);

  // The contents are the locales folders names, i.e.: `de-DE`, `es-ES`, etc.
  const locales = await fs.readdir(CROWDIN_CONTENT_PATH);

  for (const locale of locales) {
    const source = path.join(CROWDIN_CONTENT_PATH, locale);
    const localeTarget = path.join('i18n', locale);
    const docsTarget = path.join(
      localeTarget,
      'docusaurus-plugin-content-docs',
      'current'
    );
    console.log(`Copying contents from "${source}" to "${docsTarget}"`);
    await copy(source, docsTarget, 'docs');
    await copyStaticAssets(DOCS_FOLDER, docsTarget);
    // The non-markdown content is under the `website/i18n` folder in crowdin
    // It keeps the right structure so it just needs to be copy over to the locale folder
    await fs.copy(path.join(source, 'website', 'i18n'), localeTarget);

    await processLocale(docsTarget);
    await processNavigations(localeTarget);
  }
};

/**
 *
 * @param {string} source
 */
const start = async (source) => {
  console.log(`Cleaning project`);
  await cleanProject(path.join(process.cwd(), '.gitignore'));

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
      downloadMatch: 'docs',
      destination: DOCS_TEMP_FOLDER,
    });
    await copy(DOCS_TEMP_FOLDER, DOCS_FOLDER);
  } else if (existsSync(source)) {
    await copy(source, DOCS_FOLDER, 'docs');
  } else {
    console.error(`Path ${localElectron} does not exist`);
    return process.exit(-1);
  }
  await processLocale(DOCS_FOLDER);
  await processNavigations(DOCS_FOLDER);

  // No need to download translations if the source content is local
  if (localElectron) {
    return;
  }

  if(process.env.CROWDIN_TOKEN && process.env.CROWDIN_PROJECT_ID) {
    await processLocales();
  }else{
    console.log(`CROWDIN_TOKEN and/or CROWDIN_PROJECT_ID are missing. Skipping downloading translations.`);
  }

  // TODO: Uncoment once we have the blog enabled
  // console.log(`Downloading posts`);
  // await download({
  //   target: 'master',
  //   repository: 'electronjs.org',
  //   destination: BLOG_FOLDER,
  //   downloadMatch: 'data/blog',
  // });
};

start(process.argv[2]);

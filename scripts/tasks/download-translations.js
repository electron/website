//@ts-check
const stream = require('stream');
const { join } = require('path');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const got = require('got').default;
const unzipper = require('unzipper');
const { tmpdir } = require('os');
const fs = require('fs-extra');

// Assumes running from the root of the repo
const OUTPUT_PATH = join(process.cwd(), 'temp-i18n');
const { CROWDIN_TOKEN, CROWDIN_PROJECT_ID } = process.env;
const PROJECT_ID = parseInt(CROWDIN_PROJECT_ID);
const crowdin = require('@crowdin/crowdin-api-client').default;

const { translationsApi } = new crowdin({
  token: CROWDIN_TOKEN,
});

/**
 * Downloads the Crowdin file and unzips the contents
 * @param {string} url
 * @param {string} destination
 */
const downloadFiles = async (url, destination) => {
  const tmpPath = join(
    tmpdir(),
    'electronjs.org',
    `${Math.ceil(Math.random() * 1000)}`
  );

  await pipeline(got.stream(url), unzipper.Extract({ path: tmpPath }));

  const contentPath = join(tmpPath, `[electron.i18n] master`, `content`);

  const locales = await fs.readdir(contentPath);

  for (const locale of locales) {
    const localeDestination = join(destination, locale.toLowerCase());
    const docsDestination = join(
      localeDestination,
      'docusaurus-plugin-content-docs',
      'current',
      'latest'
    );
    await fs.mkdirp(docsDestination);

    await fs.copy(join(contentPath, locale, 'docs'), docsDestination);

    await fs.copy(
      join(contentPath, locale, 'website', 'i18n'),

      localeDestination
    );
  }

  return locales.map((locale) => locale.toLowerCase());
};

/**
 * Waits for the given number of seconds
 * @param {number} seconds
 * @returns
 */
const waitFor = (seconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
};

/**
 * @param {number} buildId
 * @returns
 */
const getBuild = async (buildId) => {
  const { data } = await translationsApi.checkBuildStatus(PROJECT_ID, buildId);

  return data;
};

/**
 * Kicks a build for `PROJECT_ID` and returns the download link once it
 * has finished.
 * If a build is not kicked we risked downloading outdated files.
 * @param {number} projectId
 */
const buildAndDownloadLink = async (projectId) => {
  const {
    data: { id: buildId },
  } = await translationsApi.buildProject(projectId);

  let counter = 10;
  let interval = 30;
  let build;

  for (let i = 0; i < counter; i++) {
    build = await getBuild(buildId);
    console.log(`Crowdin status: Project ${buildId} - ${build.status}`);

    if (build.status === 'finished') {
      break;
    } else {
      console.log(
        `Crowdin status: Waiting ${interval} seconds (retry ${i}/${counter} - ${build.progress}%)`
      );
      await waitFor(interval);
    }
  }

  if (build.status !== 'finished') {
    throw new Error(`The project didn't build fast enough on Crowdin`);
  }

  const {
    data: { url },
  } = await translationsApi.downloadTranslations(PROJECT_ID, buildId);

  return url;
};

/**
 * Gets the download link for the latest available build
 * @param {number} projectId
 */
const getLatestBuildLink = async (projectId) => {
  const { data: builds } = await translationsApi.listProjectBuilds(projectId);

  // We use the first item `builds[0]` because for some reason Crowdin only returns the latest build for this project
  const {
    data: { url },
  } = await translationsApi.downloadTranslations(PROJECT_ID, builds[0].data.id);

  return url;
};

/**
 * Downloads the translations into the given target
 * or the default one otherwise.
 * @param {string} [target]
 */
const downloadTranslations = async (target) => {
  let downloadLink = '';
  if (process.env.NODE_ENV === 'production') {
    console.log(
      `Starting a Crowdin build to download translations. This might take a few minutes.`
    );
    downloadLink = await buildAndDownloadLink(PROJECT_ID);
  } else {
    console.log(`Downloading the latest available Crowdin build.`);
    downloadLink = await getLatestBuildLink(PROJECT_ID);
  }

  const destination = target || OUTPUT_PATH;
  return await downloadFiles(downloadLink, destination);
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  downloadTranslations();
}

module.exports = {
  downloadTranslations,
};

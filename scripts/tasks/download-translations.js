//@ts-check
const stream = require('stream');
const { join } = require('path');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const got = require('got').default;
const unzipper = require('unzipper');

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
 * @returns {Promise<void>}
 */
const downloadFiles = async (url, destination) => {
  await pipeline(got.stream(url), unzipper.Extract({ path: destination }));
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
  const builds = await translationsApi.listProjectBuilds(PROJECT_ID);
  const build = builds.data.find((item) => item.data.id === buildId);

  return build.data;
};

/**
 * Kicks a build for `PROJECT_ID` and returns the download link once it
 * has finished.
 * If a build is not kicked we risked downloading outdated files.
 */
const getDownloadLink = async () => {
  const {
    data: { id: buildId },
  } = await translationsApi.buildProject(PROJECT_ID);

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
        `Crowdin status: Waiting ${interval} seconds (retry ${i}/${counter})`
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
 * Downloads the translations into the given target
 * or the default one otherwise.
 * @param {string} [target]
 */
const downloadTranslations = async (target) => {
  const downloadLink = await getDownloadLink();
  const destination = target || OUTPUT_PATH;
  await downloadFiles(downloadLink, destination);
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

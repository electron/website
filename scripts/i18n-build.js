//@ts-check
const fs = require('fs').promises;
const { join } = require('path');
const { execute } = require('./utils/execute');
const {
  i18n: { locales, defaultLocale },
} = require('../docusaurus.config');

/**
 *
 * @param {string} [locale]
 */
const updateConfig = async (locale) => {
  const baseUrl = locale !== defaultLocale ? `/${locale}/` : '/';
  const configPath = join(__dirname, '../docusaurus.config.js');

  let docusaurusConfig = await fs.readFile(configPath, 'utf-8');

  docusaurusConfig = docusaurusConfig.replace(
    /baseUrl: '.*?',/,
    `baseUrl: '${baseUrl}',`
  );

  await fs.writeFile(configPath, docusaurusConfig, 'utf-8');
};

/**
 *
 * @param {string} [locale]
 */
const processLocale = async (locale) => {
  const start = Date.now();
  const outdir = locale !== defaultLocale ? `--out-dir build/${locale}` : '';
  await execute(`yarn docusaurus build --locale ${locale} ${outdir}`);
  console.log(`Locale ${locale} finished in ${(Date.now() - start) / 1000}s`);
};

/**
 *
 * @param {string} [locale]
 */
const buildLocale = async (locale) => {
  try {
    await updateConfig(locale);
    await processLocale(locale);
  } catch (e) {
    // TODO: It will be nice to do some clean up and point to the right file and line
    console.error(`Locale ${locale} failed. Please check the logs above.`);

    throw e;
  }
};

/**
 *
 * @param {string | undefined} [locale]
 */
const start = async (locale) => {
  const start = Date.now();

  const localesToBuild = locale ? [locale] : locales;

  console.log('Building the following locales:');
  console.log(localesToBuild);

  try {
    await Promise.all(localesToBuild.map(buildLocale));
  } catch (e) {
    // We catch instead of just stopping the process because we want to restore docusaurus.config.js
    console.error(e);
  }

  // Restore `docusaurus.config.js` to the default values
  await updateConfig(defaultLocale);

  console.log(`Process finished in ${(Date.now() - start) / 1000}s`);
};

start(process.argv[2]);

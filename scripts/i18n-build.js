//@ts-check
const { execute } = require('./utils/execute');
const {
  i18n: { locales, defaultLocale },
} = require('../docusaurus.config');

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
const start = async (locale) => {
  const start = Date.now();

  const localesToBuild = locale ? [locale] : locales;

  console.log('Building the following locales:');
  console.log(localesToBuild);

  for (const locale of localesToBuild) {
    try {
      await processLocale(locale);
    } catch (e) {
      // We catch instead of just stopping the process because we want to restore docusaurus.config.js
      console.error(e);
      // TODO: It will be nice to do some clean up and point to the right file and line
      console.error(`Locale ${locale} failed. Please check the logs above.`);
    }
  }
  console.log(`Process finished in ${(Date.now() - start) / 1000}s`);
};

start(process.argv[2]);

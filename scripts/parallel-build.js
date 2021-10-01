const plimit = require('p-limit');
const limit = plimit(1);

const { execute } = require('./utils/execute');
const { prebuild } = require('./pre-build');
const {
  i18n: { locales },
} = require('../docusaurus.config');

const processLocale = (locale) => {
  return limit(async () => {
    const start = Date.now();
    const outdir = locale.includes('-') ? `--out-dir build/${locale}` : '';
    await execute(`yarn build --locale ${locale} ${outdir}`);
    console.log(`Locale ${locale} finished in ${(Date.now() - start) / 1000}s`);
  });
};

const start = async () => {
  const start = Date.now();

  await prebuild();

  console.log('Building the locales');

  const parallelLocales = locales.filter(locale => locale !== 'en');

  await processLocale('en');

  const localeProcesses = parallelLocales.map((locale) => {
    return processLocale(locale);
  });

  await Promise.all(localeProcesses);

  console.log(`Process finished in ${(Date.now() - start) / 1000}s`);
};

process.on('unhandledRejection', (e) => {
  console.error(e);

  process.exit(-1);
});

start();

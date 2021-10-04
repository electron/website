//@ts-check
const fs = require('fs').promises;
const { join } = require('path');
const { execute } = require('./utils/execute');
const { prebuild } = require('./pre-build');
const {
  i18n: { locales },
} = require('../docusaurus.config');

const updateBaseUrl = async (locale) => {
  const baseUrl = locale.includes('-') ? `/${locale}/` : '/';
  const configPath = join(__dirname, '../docusaurus.config.js');

  let docusaurusConfig = await fs.readFile(configPath, 'utf-8');

  docusaurusConfig = docusaurusConfig.replace(
    /baseUrl: '.*?',/,
    `baseUrl: '${baseUrl}',`
  );

  await fs.writeFile(configPath, docusaurusConfig, 'utf-8');
};

const processLocale = async (locale) => {
  const start = Date.now();
  const outdir = locale.includes('-') ? `--out-dir build/${locale}` : '';
  await execute(`yarn build --locale ${locale} ${outdir}`);
  console.log(`Locale ${locale} finished in ${(Date.now() - start) / 1000}s`);
};

const start = async () => {
  const start = Date.now();

  await prebuild();

  console.log('Building the locales');

  for (const locale of locales) {
    await updateBaseUrl(locale);
    await processLocale(locale);
  }

  // Restore `baseUrl` to the default value
  await updateBaseUrl('en');

  console.log(`Process finished in ${(Date.now() - start) / 1000}s`);
};

process.on('unhandledRejection', (e) => {
  console.error(e);

  process.exit(-1);
});

start();

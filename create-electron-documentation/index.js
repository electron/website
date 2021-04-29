#!/usr/bin/env node
//@ts-check

const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

const loadContent = (route) => {
  const finalPath = path.join(__dirname, route);

  return fs.readFile(finalPath, 'utf-8');
};

/**
 * Loads the templates required to create a new Electron guide
 */
const loadTemplates = async () => {
  const templatePaths = [
    {
      content: await loadContent('./templates/documentation.md'),
      destination: './${slug}.md',
    },
    {
      content: await loadContent('./templates/fiddle/index.html'),
      destination: '/fiddles/${slug}/index.html',
    },
    {
      content: await loadContent('./templates/fiddle/main.js'),
      destination: '/fiddles/${slug}/main.js',
    },
    {
      content: await loadContent('./templates/fiddle/preload.js'),
      destination: '/fiddles/${slug}/preload.js',
    },
    {
      content: await loadContent('./templates/fiddle/renderer.js'),
      destination: '/fiddles/${slug}/renderer.js',
    },
  ];

  return templatePaths;
};

/**
 *
 * @param {string} content
 * @param {{key: string;value: string;}[]} values
 * @returns
 */
const interpolate = (content, values) => {
  let interpolated = content;
  for (const { key, value } of values) {
    interpolated = interpolated.replace(
      new RegExp(`\\$\\{${key}\\}`, 'g'),
      value
    );
  }

  return interpolated;
};

/**
 * Naively creates all the necessary folders for the given `route`.
 * @param {string} route The route to create, has to be absolute and no filename
 */
const mkdirp = async (route) => {
  if (existsSync(route)) {
    return;
  }

  const parent = path.dirname(route);

  if (!existsSync(parent)) {
    await mkdirp(parent);
  }

  await fs.mkdir(route);
};

/**
 * Writes the files interpolating the different values
 * @param {{content: string;destination: string;}[]} templates
 * @param {{key: string; value: string;}[]} information
 * @param {string} docsRoot
 */
const writeFiles = async (templates, information, docsRoot) => {
  const createdFiles = [];
  for (const { destination, content } of templates) {
    const finalContent = interpolate(content, information);
    const root = destination.startsWith('/') ? docsRoot : process.cwd();
    const finalDestination = path.join(
      root,
      interpolate(destination, information)
    );

    await mkdirp(path.dirname(finalDestination));

    await fs.writeFile(finalDestination, finalContent, 'utf-8');

    createdFiles.push(finalDestination);
  }

  return createdFiles;
};

/**
 * Listens for stdin and returns the first line of text received.
 * @returns {Promise<string>}
 */
const getInput = () => {
  return new Promise((resolve) => {
    process.stdin.addListener('data', function (data) {
      const input = data.toString().trim();
      if (input.length > 0) {
        process.stdin.removeAllListeners('data');
        resolve(input);
      }
    });
  });
};

/** Returns the absolute path to `docs`. */
const getDocsRoot = () => {
  const current = process.cwd();
  const docs = `${path.sep}docs${path.sep}`;
  if (current.includes(docs)) {
    const parts = current.split(docs);
    return path.join(parts[0], 'docs');
  }

  return '';
};

const start = async () => {
  const docsRoot = getDocsRoot();

  if (!docsRoot) {
    console.error(
      'Please execute this command in one of the folders under the electron documentation (e.g.: electron/electron/docs/tutorial)'
    );
    process.exitCode = 1;

    return;
  }

  console.log(
    'Welcome to the Electron documentation generator. Please answer the following questions:'
  );
  console.log(`Title:`);

  const title = await getInput();

  console.log(`Description:`);

  const description = await getInput();

  const information = [
    { key: 'title', value: title },
    { key: 'description', value: description },
    { key: 'slug', value: title.toLowerCase().replace(/\s/g, '-') },
  ];

  const templates = await loadTemplates();

  const createdFiles = await writeFiles(templates, information, docsRoot);

  console.log(`The following files have been created:`);
  for (const file of createdFiles) {
    console.log(`  - ${file}`);
  }

  // Need to pause reading so the process exists correctly
  process.stdin.pause();
};

start();

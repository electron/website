//@ts-check
const fs = require('fs-extra').promises;
const { existsSync } = require('fs-extra');
const path = require('path');

const makeDir = require('make-dir');
const globby = require('globby');

const pathRewrites = require('./reorg-docs.json');
const fixedFolders = ['api', 'images', 'fiddles'];

/**
 * @typedef Entry
 * @property {string} filename
 * @property {string} slug
 * @property {Buffer} content
 */

/**
 * Checks if the given folder is one of those that do not have to be
 * modified
 * @param {string} folder
 * @returns
 */
const isFixedFolder = (folder) => {
  for (const fixedFolder of fixedFolders) {
    if (folder.includes(`${fixedFolder}/`)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the right folder where the given document needs to be place
 * taking into consideration:
 * 1. If it's a "fixed" folder (api, images, fiddles)
 * 1. It has an entry in `docs-reorg.json`
 * 1. Using the default or puts it the default folder ('how-to')
 * @param {string} destination
 * @param {string} filename
 */
const getFinalPath = (destination, filename) => {
  let finalPath = '';

  if (isFixedFolder(filename)) {
    finalPath = path.join(destination, filename);
  } else if (pathRewrites[filename] === '') {
    return '';
  } else if (pathRewrites[filename]) {
    finalPath = path.join(destination, pathRewrites[filename]);
  } else {
    const basename = path.basename(filename);
    finalPath = path.join(destination, 'how-to', basename);
  }

  return path.join(process.cwd(), finalPath);
};

/**
 * Saves the file on disk creating the necessary folders
 * @param {Entry[]} files
 * @param {string} destination
 */
const saveContents = async (files, destination) => {
  for (const file of files) {
    const { content, filename } = file;
    const finalPath = getFinalPath(destination, filename);

    // These are files we do not need to copy
    if (finalPath === '') {
      continue;
    }

    await makeDir(path.dirname(finalPath));

    await fs.writeFile(finalPath, content);
  }
};

/**
 * Copies the contents of the given folder to the destination,
 * filtering by path, and reorganizing the folder structure
 * as needed.
 * @param {string} root Where to start looking for the files
 * @param {string} destination Where the files need to be copied to
 * @param {string} rootPath The path under root to search for files
 */
const copy = async (root, destination, rootPath = '.') => {
  const filesPaths = await globby(`${rootPath}/**/*`, {
    cwd: root,
  });

  const contents = [];

  for (const filePath of filesPaths) {
    const content = {
      filename: filePath.replace(`${rootPath}/`, ''),
      content: await fs.readFile(path.join(root, filePath)),
      slug: path.basename(filePath, '.md'),
    };

    contents.push(content);
  }

  await saveContents(contents, destination);
};

/**
 * The translations do not have the images or fiddles. This method
 * is used to copy the "fixed folders" from the source to the destination
 * if they do not exist
 * @param {string} source
 * @param {string} destination
 */
const copyStaticAssets = async (source, destination) => {
  for (const fixedFolder of fixedFolders) {
    const files = await globby(`${fixedFolder}/**/*`, { cwd: source });

    for (const file of files) {
      const finalDestination = path.join(destination, file);
      if (!existsSync(finalDestination)) {
        await makeDir(path.dirname(finalDestination));
        await fs.copyFile(
          path.join(source, file),
          path.join(destination, file)
        );
      }
    }
  }
};

module.exports = {
  copy,
  copyStaticAssets,
};

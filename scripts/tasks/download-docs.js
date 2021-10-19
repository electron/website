//@ts-check
const fs = require('fs').promises;

const path = require('path');
const makeDir = require('make-dir');
const tar = require('tar-stream');
const got = require('got');
const globby = require('globby');

const fixedFolders = ['api', 'images', 'fiddles'];

/**
 * @typedef DownloadOptions
 * @type {object}
 * @property {string} [org] - The organization to download the contents from
 * @property {string} [repository] - The repository to download the contents from
 * @property {string} destination - The destination absolute path.
 * @property {string} target - The branch, commit, version. (e.g. `v1.0.0`, `main`)
 * @property {string} downloadMatch - The math to use to filter the downloaded contents
 */

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
    if (folder.includes(`/${fixedFolder}`)) {
      return true;
    }
  }
  return false;
};

/**
 * Saves the file on disk creating the necessary folders
 * @param {Entry[]} files
 * @param {string} destination
 */
const saveContents = async (files, destination) => {
  for (const file of files) {
    const { content, filename } = file;
    const finalPath = path.join(destination, filename);

    // These are files we do not need to copy
    if (finalPath === '') {
      continue;
    }

    await makeDir(path.dirname(finalPath));

    await fs.writeFile(finalPath, content);
  }
};

/**
 * Downloads the contents of a branch or release from GitHub
 * @param {DownloadOptions} options
 */
const downloadFromGitHub = async (options) => {
  const { org, repository, target, downloadMatch = '' } = options;

  const tarballUrl = `https://github.com/${org}/${repository}/archive/${target}.tar.gz`;

  const contents = [];

  return new Promise((resolve) => {
    got
      .stream(tarballUrl)
      .pipe(require('gunzip-maybe')())
      .pipe(
        tar
          .extract()
          .on('entry', (header, stream, next) => {
            header.name = header.name.replace(`${repository}-${target}`, '');

            if (header.type === 'file' && header.name.match(downloadMatch)) {
              let chunks = [];
              stream.on('data', (data) => {
                chunks.push(data);
              });
              stream.on('end', () => {
                const content = Buffer.concat(chunks);
                contents.push({
                  filename: header.name.replace(`${downloadMatch}/`, ''),
                  slug: path.basename(header.name, '.md'),
                  content,
                });

                next();
              });
            } else {
              next();
            }
            stream.resume();
          })
          .on('finish', () => {
            resolve(contents);
          })
      );
  });
};

/**
 * Downloads the contents of GitHub repo (branch, release)
 * with the option to choose the download destination,
 * filtering by path, and reorganizing the folder structure
 * as needed.
 * @param {DownloadOptions} userOptions
 */
const download = async (userOptions) => {
  const options = {
    ...{ target: 'main' },
    ...userOptions,
  };

  const contents = await downloadFromGitHub(options);

  await saveContents(contents, userOptions.destination);
};

/**
 * Copies the contents of the given folder to the destination,
 * filtering by path, and reorganizing the folder structure
 * as needed.
 * @param {DownloadOptions} userOptions
 */
const copy = async ({ target, destination, downloadMatch = '.' }) => {
  const filesPaths = await globby(`${downloadMatch}/**/*`, {
    cwd: target,
  });

  const contents = [];

  for (const filePath of filesPaths) {
    const content = {
      filename: filePath.replace(`${downloadMatch}/`, ''),
      content: await fs.readFile(path.join(target, filePath)),
      slug: path.basename(filePath, '.md'),
    };

    contents.push(content);
  }

  await saveContents(contents, destination);
};

module.exports = {
  download,
  copy,
};

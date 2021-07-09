//@ts-check
const fs = require('fs').promises;

const path = require('path');
const makeDir = require('make-dir');
const tar = require('tar-stream');
const got = require('got');

/**
 * @typedef DownloadOptions
 * @type {object}
 * @property {string} [org] - The organization to download the contents from
 * @property {string} [repository] - The repository to download the contents from
 * @property {string} destination - Where the files should be saved
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
 * Downloads the contents of a branch or release from GitHub
 * @param {DownloadOptions} options
 * @returns {Promise<Entry[]>}
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

  const files = await downloadFromGitHub(options);

  for (const file of files) {
    const destination = path.join(options.destination, file.filename);
    await makeDir(path.dirname(destination));
    await fs.writeFile(destination, file.content);
  }
};

module.exports = {
  download,
};

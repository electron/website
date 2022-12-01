import fs from 'fs-extra';

import path from 'path';
import makeDir from 'make-dir';
import tar from 'tar-stream';
import got from 'got';
import globby from 'globby';

interface DownloadOptions {
  /** The GitHub organization to download the contents from */
  org: string;
  /** The GitHub repository to download the contents from */
  repository: string;
  /** The download destination as an absolute path */
  destination: string;
  /** The git ref (e.g. `v1.0.0`, `main`) to use for the download */
  target: string;
  /** The glob match to use to filter the downloaded contents */
  downloadMatch: string;
}

interface CopyOptions {
  /** The copy destination as an absolute path */
  destination: string;
  /** The source source to use for the copy action */
  target: string;
  /** The glob match to use to filter the copied contents */
  copyMatch: string;
}

/**
 * Entry for each documentation page
 */
interface Entry {
  /** File name of the page */
  filename: string;
  /** Slug of the page */
  slug: string;
  /** Buffer contents of the page */
  content: Buffer;
}

/**
 * Saves the file on disk creating the necessary folders
 * @param files Array of page entries
 * @param destination Destination path on disk
 */
const saveContents = async (files: Entry[], destination: string) => {
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
 * Downloads the contents of Electron's documentation from a GitHub ref
 * @param options
 */
const downloadFromGitHub = async (
  options: DownloadOptions
): Promise<Entry[]> => {
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
                } satisfies Entry);

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
 * @param userOptions
 */
export const download = async (userOptions: DownloadOptions) => {
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
 * @param userOptions
 */
export const copy = async ({
  target,
  destination,
  copyMatch = '.',
}: CopyOptions) => {
  const filesPaths = await globby(`${copyMatch}/**/*`, {
    cwd: target,
  });

  const contents = [];

  for (const filePath of filesPaths) {
    const content = {
      filename: filePath.replace(`${copyMatch}/`, ''),
      content: await fs.readFile(path.join(target, filePath)),
      slug: path.basename(filePath, '.md'),
    };

    contents.push(content);
  }

  await saveContents(contents, destination);
};

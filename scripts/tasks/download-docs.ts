import fs from 'node:fs/promises';
import path from 'node:path';
import stream from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { createGunzip } from 'node:zlib';

import tar from 'tar-stream';

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
  /** The source to use for the copy action */
  source: string;
  /** The copy destination as an absolute path */
  destination: string;
  /** The glob match to use to filter the copied contents */
  copyMatch: string;
}

/**
 * Entry for each documentation page
 */
interface Entry {
  /** Relative path of the file with respect to `/docs/latest/` */
  relativeFilePath: string;
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
    const { content, relativeFilePath } = file;
    const finalPath = path.join(destination, relativeFilePath);

    // These are files we do not need to copy
    if (finalPath === '') {
      continue;
    }

    await fs.mkdir(path.dirname(finalPath), { recursive: true });
    await fs.writeFile(finalPath, content);
  }
};

/**
 * Downloads the contents of Electron's documentation from a GitHub ref
 * @param options
 */
const downloadFromGitHub = async (
  options: DownloadOptions,
): Promise<Entry[]> => {
  const { org, repository, target, downloadMatch = '' } = options;

  const tarballUrl = `https://github.com/${org}/${repository}/archive/${target}.tar.gz`;

  const contents = [];

  return new Promise((resolve) => {
    fetch(tarballUrl).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${tarballUrl}: ${response.statusText}`,
        );
      }

      // Type assertion is necessary because of a SNAFU with @types/node
      // and the built-in fetch types. See this discussion for more info:
      // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542
      stream.Readable.fromWeb(response.body as ReadableStream<Uint8Array>)
        // We know the response is a tarball so we don't need to check before gunzipping
        .pipe(createGunzip())
        .pipe(
          tar
            .extract()
            .on('entry', (header, stream, next) => {
              header.name = header.name.replace(`${repository}-${target}`, '');

              if (header.type === 'file' && header.name.match(downloadMatch)) {
                const chunks = [];
                stream.on('data', (data) => {
                  chunks.push(data);
                });
                stream.on('end', () => {
                  const content = Buffer.concat(chunks);
                  contents.push({
                    relativeFilePath: header.name.replace(
                      `${downloadMatch}`,
                      '',
                    ),
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
            }),
        );
    });
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
export const copyLocalDocumentation = async ({
  source,
  destination,
  copyMatch = '.',
}: CopyOptions) => {
  const dirents = fs.glob(`${copyMatch}/**/*`, {
    cwd: source,
    withFileTypes: true,
  });

  const contents: Entry[] = [];

  for await (const dirent of dirents) {
    if (!dirent.isFile()) {
      continue;
    }

    const sourceFilePath = path.join(dirent.parentPath, dirent.name);
    // Transform path from `{REPO}/docs/my/file/path.md` to `my/file/path.md`
    const relativeFilePath = path.relative(
      path.join(source, 'docs'),
      sourceFilePath,
    );

    const content = {
      relativeFilePath,
      content: await fs.readFile(sourceFilePath),
      slug: path.basename(dirent.name, '.md'),
    };

    contents.push(content);
  }

  await saveContents(contents, destination);
};

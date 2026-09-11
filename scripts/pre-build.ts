/**
 * Takes care of downloading the documentation from the
 * right places, and transform it to make it ready to
 * be used by docusaurus.
 *
 * Usage:
 *
 *   yarn pre-build [source]                       → docs/latest
 *   yarn pre-build --version vX.Y.Z [source]      → docs/vX.Y.Z (tag vX.Y.Z)
 *   yarn pre-build --version next [source]        → docs/next   (branch main)
 *
 * `source` is either a git ref of `electron/electron` (a SHA, branch or tag)
 * or a path to a local `electron/electron` checkout.
 */
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import { logger } from '@docusaurus/logger';

import {
  LATEST_VERSION,
  NEXT_VERSION,
  isReleaseVersion,
  isValidDocsVersion,
} from '../src/util/docs-version.ts';
import { latestElectronVersion } from '../src/util/latest-electron-version.ts';

import { copyLocalDocumentation, download } from './tasks/download-docs.ts';
import { addFrontmatterToAllDocs } from './tasks/add-frontmatter.ts';
import { fixContent } from './tasks/md-fixers.ts';
import { copyNewContent } from './tasks/copy-new-content.ts';
import { preprocessApiHistory } from './tasks/preprocess-api-history.ts';
import { resolveElectronRef } from './tasks/resolve-ref.ts';

interface PreBuildArgs {
  /** The docs version folder to write to: `latest`, `next` or `vX.Y.Z` */
  version: string;
  /** Optional git ref or local path to get the docs from */
  source?: string;
}

const parseArgs = (argv: string[]): PreBuildArgs => {
  let version = LATEST_VERSION;
  let source: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--version') {
      version = argv[++i];
    } else if (arg.startsWith('--version=')) {
      version = arg.slice('--version='.length);
    } else {
      source = arg;
    }
  }

  if (!version || !isValidDocsVersion(version)) {
    logger.error(
      `Invalid --version ${logger.red(String(version))}. Expected ${logger.green('latest')}, ${logger.green('next')} or ${logger.green('vX.Y.Z')}`,
    );
    process.exit(1);
  }

  return { version, source };
};

/**
 * Figures out which `electron/electron` ref to download for a docs version
 * when no explicit source is given.
 */
const defaultTarget = async (version: string): Promise<string> => {
  if (version === NEXT_VERSION) {
    return 'main';
  }

  if (isReleaseVersion(version)) {
    return version;
  }

  const latest = await latestElectronVersion();
  const stableBranch = latest.replace(/\.\d+\.\d+/, '-x-y');
  logger.info(
    `Fetching ${logger.green(
      `electron`,
    )} information from npm: \n\t Latest version: ${logger.green(
      latest,
    )} \n\t Stable branch: ${logger.green(stableBranch)}`,
  );

  return stableBranch;
};

/**
 * The value written to `docs/<version>/.sha`, which ends up in the
 * `<meta name="docs-sha">` tag of every page.
 *
 * `latest` keeps its historical behaviour of storing the ref as given
 * (CI always passes an explicit SHA). Other versions are resolved to a
 * commit SHA through the GitHub API so that the tag/branch name can be
 * traced back to the exact commit that was published.
 */
const shaForTarget = async (
  version: string,
  target: string,
): Promise<string> => {
  if (version === LATEST_VERSION) {
    return target;
  }

  const resolved = await resolveElectronRef(target);

  if (!resolved) {
    logger.warn(
      `Could not resolve ${logger.green(target)} to a commit, storing the ref name instead`,
    );
    return target;
  }

  return resolved;
};

/**
 *
 * @param args.source The SHA/ref to use to download our documentation, or a
 * local path to an `electron/electron` checkout.
 * @param args.version The docs version folder to produce.
 */
const start = async ({ source, version }: PreBuildArgs): Promise<void> => {
  const docsFolder = path.join(import.meta.dirname, '..', 'docs', version);

  logger.info(
    `Running ${logger.green('electronjs.org')} pre-build scripts for ${logger.green(version)}...`,
  );
  logger.info(`Deleting previous content at ${logger.green(docsFolder)}`);
  await fs.rm(docsFolder, { recursive: true, force: true });

  const localElectron =
    source && (source.includes('/') || source.includes('\\'));

  if (!localElectron) {
    const target = source || (await defaultTarget(version));

    logger.info(`Downloading docs from ${logger.green(target)}`);
    await download({
      target,
      org: process.env.ORG || 'electron',
      repository: 'electron',
      destination: docsFolder,
      downloadMatch: '/docs/',
    });
    await fs.writeFile(
      path.join(docsFolder, '.sha'),
      await shaForTarget(version, target),
    );
  } else if (existsSync(source)) {
    logger.info(
      `Copying local docs from ${logger.green(path.resolve(logger.green(source)))}`,
    );
    await copyLocalDocumentation({
      source,
      destination: docsFolder,
      copyMatch: 'docs',
    });
  } else {
    logger.error(`Local path ${logger.red(source)} does not exist`);
    return process.exit(1);
  }

  logger.info('Copying additional content from website repository');
  await copyNewContent(docsFolder);

  logger.info('Finding, validating, and uncommenting API history blocks');
  await preprocessApiHistory(docsFolder);

  logger.info('Fixing markdown');
  await fixContent('docs', version);

  logger.info('Adding automatic frontmatter');
  await addFrontmatterToAllDocs(docsFolder, version);
};

start(parseArgs(process.argv.slice(2)));

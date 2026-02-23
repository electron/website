import logger from '@docusaurus/logger';
import { ElectronVersions, SemVer } from '@electron/fiddle-core';
import AdmZip from 'adm-zip';
import { Code, Node } from 'mdast';
import semver from 'semver';
import { Parent } from 'unist';
import { ActionTuple, SKIP, visitParents } from 'unist-util-visit-parents';
import { parse as parseYaml } from 'yaml';

import { getJSXImport, isCode, isImport } from '../util/mdx-utils';

const GH_ACTIONS_ARTIFACTS_URL =
  'https://api.github.com/repos/electron/website/actions/artifacts';

export type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string; 'breaking-changes-header'?: string }[];
  changes?: { 'pr-url': string; description: string }[];
};

export interface PrReleaseVersions {
  release: string | null;
  backports: Array<string>;
}
export type PrReleaseVersionsContainer = { [key: number]: PrReleaseVersions };

interface PrReleaseArtifact {
  data: PrReleaseVersionsContainer;
  endCursor: string;
}

type GithubArtifactsListResponse = {
  artifacts: Array<{ id: number; name: string; archive_download_url: string }>;
};

function isObject(
  value: unknown,
): value is Record<string | number | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGithubArtifactsListResponse(
  value: unknown,
): value is GithubArtifactsListResponse {
  return isObject(value) && 'artifacts' in value;
}

function isPrReleaseArtifact(value: unknown): value is PrReleaseArtifact {
  return isObject(value) && 'data' in value && 'endCursor' in value;
}

function isApiHistory(value: unknown): value is ApiHistory {
  return (
    isObject(value) &&
    ('added' in value || 'deprecated' in value || 'changes' in value)
  );
}

export default async function attacher() {
  // Fetch and cache Electron versions before starting plugin
  await getAllElectronVersions();
  return transformer;
}

function matchApiHistoryCodeBlock(node: Node): node is Code {
  return (
    isCode(node) &&
    node.lang?.toLowerCase() === 'yaml' &&
    node.meta?.toLowerCase() === 'history'
  );
}

let _allElectronVersions: SemVer[] | undefined;

async function getAllElectronVersions(): Promise<SemVer[]> {
  if (_allElectronVersions) {
    return _allElectronVersions;
  }

  const { versions } = await ElectronVersions.create({
    ignoreCache: true,
  });

  _allElectronVersions = versions;
  return _allElectronVersions;
}

let _allPrReleaseVersions: PrReleaseVersionsContainer | undefined;

async function getAllPrReleaseVersions(): Promise<PrReleaseVersionsContainer> {
  if (_allPrReleaseVersions) {
    return _allPrReleaseVersions;
  }

  if (!process.env.GH_TOKEN) {
    logger.warn(
      'No GitHub token found, skipping fetching PR release versions.',
    );
    _allPrReleaseVersions = {};
    return _allPrReleaseVersions;
  }

  const fetchOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
    },
  };

  const artifactsListResponse = await fetch(
    GH_ACTIONS_ARTIFACTS_URL,
    fetchOptions,
  );
  const artifactsListResponseJson = await artifactsListResponse.json();

  if (!isGithubArtifactsListResponse(artifactsListResponseJson)) {
    throw new Error('Invalid GitHub artifacts list response.');
  }

  const latestArtifact = artifactsListResponseJson.artifacts
    .filter(({ name }) => name === 'resolved-pr-versions')
    .sort((a, b) => b.id - a.id)[0];

  if (!latestArtifact) {
    throw new Error('No resolved-pr-versions artifact found.');
  }

  const archiveDownloadResponse = await fetch(
    latestArtifact.archive_download_url,
    fetchOptions,
  );
  const archiveDownloadResponseBuffer =
    await archiveDownloadResponse.arrayBuffer();
  const archiveDownloadBuffer = Buffer.from(archiveDownloadResponseBuffer);

  const zip = new AdmZip(archiveDownloadBuffer);
  const zipEntries = zip.getEntries();
  const firstZipEntry = zipEntries[0];

  if (firstZipEntry == null) {
    throw new Error('No entries found in the artifact archive.');
  }

  const zipText = zip.readAsText(firstZipEntry);
  const parsedData = JSON.parse(zipText);
  if (!isPrReleaseArtifact(parsedData)) {
    throw new Error('Invalid PR release artifact.');
  }

  _allPrReleaseVersions = parsedData.data;
  return _allPrReleaseVersions;
}

// Most of this is copy-pasted from: <https://github.com/electron/website/blob/ac3bab3131fc0f5de563574189ad5eab956a60b9/src/transformers/js-code-blocks.ts>
async function transformer(tree: Parent) {
  try {
    let needImport = false;
    const allElectronVersions = await getAllElectronVersions();
    const allPrReleaseVersions = await getAllPrReleaseVersions();
    visitParents(tree, matchApiHistoryCodeBlock, maybeGenerateApiHistoryTable);
    visitParents(tree, 'mdxjsEsm', checkForApiHistoryTableImport);

    if (needImport) {
      tree.children.unshift(getJSXImport('ApiHistoryTable'));
    }

    // eslint-disable-next-line no-inner-declarations
    function checkForApiHistoryTableImport(node: Node) {
      if (
        isImport(node) &&
        node.value.includes('@site/src/components/ApiHistoryTable')
      ) {
        needImport = false;
      }
    }

    // eslint-disable-next-line no-inner-declarations
    function maybeGenerateApiHistoryTable(
      node: Code,
      ancestors: Parent[],
    ): ActionTuple | void {
      const parent = ancestors[0];
      const idx = parent!.children.indexOf(node);

      const apiHistory = parseYaml(node.value);
      if (!isApiHistory(apiHistory)) {
        logger.error('Invalid API history YAML');
        throw new Error('Invalid API history YAML');
      }

      const prsInHistory: Array<string> = [];

      apiHistory.added?.forEach((added) => {
        prsInHistory.push(added['pr-url'].split('/').at(-1)!);
      });

      apiHistory.changes?.forEach((change) => {
        prsInHistory.push(change['pr-url'].split('/').at(-1)!);
      });

      apiHistory.deprecated?.forEach((deprecated) => {
        prsInHistory.push(deprecated['pr-url'].split('/').at(-1)!);
      });

      const relevantPrReleaseVersions = Object.fromEntries(
        Object.entries(allPrReleaseVersions).filter(([prNumber]) =>
          prsInHistory.includes(prNumber),
        ),
      );

      function findReleasedStableVersionContainingRelease(
        release: SemVer,
      ): string | null {
        let stableVersion: string;

        if (release.prerelease.length > 0) {
          stableVersion = semver.inc(release, 'patch')!;
        } else {
          stableVersion = release.version;
        }

        return (
          allElectronVersions.find(({ version }) => version === stableVersion)
            ?.version || null
        );
      }

      const stableReleasedRelevantPrReleaseVersions = relevantPrReleaseVersions;

      // If release is a prerelease, find the stable version containing the release and
      //  update the release version to the stable version. Otherwise, set the release version to null.
      //  Do the same for backports except remove the backport from the array instead of setting it to null.
      for (const relevantPrNumber in stableReleasedRelevantPrReleaseVersions) {
        const release =
          stableReleasedRelevantPrReleaseVersions[relevantPrNumber]?.release;

        if (release) {
          const parsedRelease = semver.parse(release)!;
          const releasedStableVersionContainingRelease =
            findReleasedStableVersionContainingRelease(parsedRelease);
          stableReleasedRelevantPrReleaseVersions[relevantPrNumber]!.release =
            releasedStableVersionContainingRelease;
        }

        const backports =
          stableReleasedRelevantPrReleaseVersions[relevantPrNumber]?.backports;

        if (backports) {
          for (const [index, backport] of backports.entries()) {
            const parsedBackport = semver.parse(backport)!;
            const releasedStableVersionContainingBackport =
              findReleasedStableVersionContainingRelease(parsedBackport);

            if (releasedStableVersionContainingBackport) {
              stableReleasedRelevantPrReleaseVersions[
                relevantPrNumber
              ]!.backports[index] = releasedStableVersionContainingBackport;
            } else {
              stableReleasedRelevantPrReleaseVersions[
                relevantPrNumber
              ]!.backports.splice(index, 1);
            }
          }
        }
      }

      const apiHistoryTable = {
        type: 'mdxJsxFlowElement',
        name: 'ApiHistoryTable',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'apiHistoryJson',
            value: JSON.stringify(apiHistory),
          },
          {
            type: 'mdxJsxAttribute',
            name: 'prReleaseVersionsJson',
            value: JSON.stringify(stableReleasedRelevantPrReleaseVersions),
          },
        ],
        children: [],
        data: {
          _mdxExplicitJsx: true,
        },
      };

      parent!.children[idx] = apiHistoryTable;
      needImport = true;

      // Return an ActionTuple [Action, Index], where
      // Action SKIP means we want to skip visiting these new children
      // Index is the index of the AST we want to continue parsing at.
      return [SKIP, idx + 1];
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

import { Code, Node } from 'mdast';
import { getJSXImport, isCode, isImport } from '../util/mdx-utils';
import { ActionTuple, SKIP, visitParents } from 'unist-util-visit-parents';
import { ElectronVersions, SemVer } from '@electron/fiddle-core';
import { Parent } from 'unist';
import { parse as parseYaml } from 'yaml';
import semver from 'semver';
import AdmZip from 'adm-zip';

export type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string; 'breaking-changes-header': string }[];
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

export default function attacher() {
  return transformer;
}

function matchApiHistoryCodeBlock(node: Node): node is Code {
  return isCode(node) && node.lang === 'YAML' && node.meta === 'history';
}

let _allElectronVersions: SemVer[];

async function getAllElectronVersions(): Promise<SemVer[]> {
  if (_allElectronVersions) {
    return _allElectronVersions;
  }

  // TODO: Error handling
  const { versions } = await ElectronVersions.create(undefined, {
    ignoreCache: true,
  });
  _allElectronVersions = versions;
  return _allElectronVersions;
}

let _allPrReleaseVersions: PrReleaseVersionsContainer;

async function getAllPrReleaseVersions(): Promise<PrReleaseVersionsContainer> {
  if (_allPrReleaseVersions) {
    return _allPrReleaseVersions;
  }

  // TODO: Add error handling and logging
  if (process.env.GITHUB_ACTIONS === 'true' && !process.env.GH_TOKEN) {
    throw new Error('GH_TOKEN is required when running in GitHub Actions.');
  }

  // TODO: Remove this
  if (!process.env.GH_TOKEN) {
    const versions: PrReleaseVersionsContainer = {
      35658: {
        release: 'v30.0.0-nightly.20231214',
        backports: ['v29.0.0-alpha.9'],
      },
      41391: {
        release: 'v31.0.0-alpha.1',
        backports: [] as string[],
      },
      42086: {
        release: 'v32.0.0-nightly.20240531',
        backports: ['v31.0.0'],
      },
    };

    _allPrReleaseVersions = versions;
    return _allPrReleaseVersions;
  }

  // ? Maybe log this?
  if (!process.env.GH_TOKEN) {
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
    'https://api.github.com/repos/electron/website/actions/artifacts',
    fetchOptions
  );
  const latestArtifact = (await artifactsListResponse.json()).artifacts
    .filter(({ name }: { name: string }) => name === 'resolved-pr-versions')
    .sort((a: { id: number }, b: { id: number }) => a.id > b.id)[0];

  // ? Maybe use streams/workers
  const archiveDownloadResponse = await fetch(
    latestArtifact.archive_download_url,
    fetchOptions
  );
  const buffer = Buffer.from(await archiveDownloadResponse.arrayBuffer());

  const zip = new AdmZip(buffer);
  const parsedData = JSON.parse(
    zip.readAsText(zip.getEntries()[0]!)
  ) as PrReleaseArtifact;

  if (!parsedData?.data) {
    throw new Error('No data found in the artifact.');
  }

  _allPrReleaseVersions = parsedData.data;
  return _allPrReleaseVersions;
}

// Most of this is copy-pasted from: <https://github.com/electron/website/blob/ac3bab3131fc0f5de563574189ad5eab956a60b9/src/transformers/js-code-blocks.ts>
async function transformer(tree: Parent) {
  let needImport = false;
  const allElectronVersions = await getAllElectronVersions();
  const allPrReleaseVersions = await getAllPrReleaseVersions();
  visitParents(tree, matchApiHistoryCodeBlock, maybeGenerateApiHistoryTable);
  visitParents(tree, 'mdxjsEsm', checkForApiHistoryTableImport);

  if (needImport) {
    tree.children.unshift(getJSXImport('ApiHistoryTable'));
  }

  function checkForApiHistoryTableImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/ApiHistoryTable')
    ) {
      needImport = false;
    }
  }

  function maybeGenerateApiHistoryTable(
    node: Code,
    ancestors: Parent[]
  ): ActionTuple | void {
    const parent = ancestors[0];
    const idx = parent!.children.indexOf(node);

    const apiHistory = parseYaml(node.value) as ApiHistory;

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
        prsInHistory.includes(prNumber)
      )
    );

    function findReleasedStableVersionContainingRelease(
      release: SemVer
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
    // TODO: Check if this line needs to be changed for this use case
    return [SKIP, idx + 1];
  }
}
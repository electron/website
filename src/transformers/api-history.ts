import ExpiryMap from 'expiry-map';
import {
  BlockContent,
  DefinitionContent,
  InlineCode,
  Link,
  Node,
  Paragraph,
  RootContentMap,
  TableRow,
} from 'mdast';
import {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElementData,
} from 'mdast-util-mdx-jsx';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import pMemoize from 'p-memoize';
import semver from 'semver';
import { parse as parseYaml } from 'yaml';
import { fromMarkdown } from 'mdast-util-from-markdown';

enum Change {
  ADDED = 'API ADDED',
  CHANGED = 'API CHANGED',
  DEPRECATED = 'API DEPRECATED',
}

type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string; 'breaking-changes-header': string }[];
  changes?: { 'pr-url': string; description: string }[];
};

// ! Typescript witchcraft to avoid adding `remark-mdx` as a dependency <https://mdxjs.com/packages/remark-mdx/#types>
interface MdxJsxFlowElementWithSummary extends ParentWithMdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string | null;
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>;
  children: Array<
    | BlockContent
    | DefinitionContent
    | MdxJsxFlowElementWithSummary
    | { type: 'text'; value: string }
  >;
  data?: MdxJsxFlowElementData | undefined;
}
interface RootContentMapWithMdxJsxFlowElement extends RootContentMap {
  mdxJsxFlowElement: MdxJsxFlowElementWithSummary;
}
type RootContentWithMdxJsxFlowElement =
  RootContentMapWithMdxJsxFlowElement[keyof RootContentMapWithMdxJsxFlowElement];
interface ParentWithMdxJsxFlowElement extends Node {
  children: Array<RootContentWithMdxJsxFlowElement>;
}

type ElectronRelease = {
  version: string;
  date: string;
  node: string;
  v8: string;
  uv: string;
  zlib: string;
  openssl: string;
  modules: string;
  chrome: string;
  files: string[];
};

type Backport = {
  targetBranch: string; // e.g. 29-x-y
  state: 'merged' | 'pending' | 'needs-manual' | 'in-flight' | 'released';
  pr?: RestEndpointMethodTypes['pulls']['get']['response']['data'] | null;
  availableIn?: ElectronRelease | null;
};

type PRReleaseStatus = {
  primary?: {
    pr?: RestEndpointMethodTypes['pulls']['get']['response']['data'] | null;
    availableIn?: ElectronRelease | null;
  } | null;
  backports?: Backport[];
};

export default function attacher() {
  return transformer;
}

let octokit: Octokit | null = null;

// ? Probably need to get auth token from somewhere
// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
const getOctokit = async () => {
  if (octokit) return octokit;

  // const { RELEASE_STATUS_GITHUB_APP_CREDS, GITHUB_TOKEN } = process.env;

  // if (RELEASE_STATUS_GITHUB_APP_CREDS) {
  //   const authOpts = await getAuthOptionsForRepo(
  //     {
  //       owner: 'electron',
  //       name: 'electron',
  //     },
  //     appCredentialsFromString(RELEASE_STATUS_GITHUB_APP_CREDS),
  //   );
  //   octokit = new Octokit({
  //     ...authOpts,
  //   });
  // } else if (GITHUB_TOKEN) {
  //   octokit = new Octokit({
  //     auth: GITHUB_TOKEN,
  //   });
  // } else {
  //   octokit = new Octokit();
  // }

  octokit = new Octokit();

  return octokit;
};

// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
const compareTagToCommit = pMemoize(
  async (tag: string, commitSha: string) => {
    const compare = await (
      await getOctokit()
    ).repos.compareCommits({
      owner: 'electron',
      repo: 'electron',
      base: tag,
      head: commitSha,
    });
    return compare.data;
  },
  {
    cache: new ExpiryMap(60 * 60 * 24 * 1000),
    cacheKey: ([tag, commitSha]) => `compare/${tag}/${commitSha}`,
  }
);

// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
const getPR = pMemoize(
  async (prNumber: number) => {
    try {
      return (
        await (
          await getOctokit()
        ).pulls.get({
          owner: 'electron',
          repo: 'electron',
          pull_number: prNumber,
          mediaType: {
            format: 'html',
          },
        })
      ).data;
    } catch {
      return null;
    }
  },
  {
    cache: new ExpiryMap(30 * 1000),
    cacheKey: ([prNumber]) => `pr/${prNumber}`,
  }
);

// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
const getPRComments = pMemoize(
  async (prNumber: number) => {
    const octo = await getOctokit();
    try {
      // ! This is some TypeScript witchcraft that may not be fully correct
      return await octo.paginate<
        RestEndpointMethodTypes['issues']['listComments']['response']['data'][0]
      >(
        octo.issues.listComments.endpoint.merge({
          owner: 'electron',
          repo: 'electron',
          issue_number: prNumber,
          per_page: 100,
        })
      );
    } catch {
      return [];
    }
  },
  {
    cache: new ExpiryMap(60 * 1000),
    cacheKey: ([prNumber]) => `pr-comments/${prNumber}`,
  }
);

// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
const getReleasesOrUpdate = pMemoize(
  async () => {
    const response = await fetch('https://electronjs.org/headers/index.json');
    const releases = (await response.json()) as ElectronRelease[];
    return releases.sort((a, b) => semver.compare(b.version, a.version));
  },
  {
    cache: new ExpiryMap(60 * 1000),
    cacheKey: () => 'releases',
  }
);

// ? Maybe network requests shouldn't be done in a transformer
// ? Maybe use GraphQL to only fetch what's needed
// ? Need to handle rate limiting, caching, and how to limit no. of concurrent requests
// This entire function including its comments is taken from https://github.com/electron/release-status/tree/6718e2627b614fca0bc96f48f9778ba45de8f9ba
async function getPRReleaseStatus(
  prNumber: number
): Promise<PRReleaseStatus | null> {
  const releases = [...(await getReleasesOrUpdate())].reverse();
  const [prInfo, comments] = await Promise.all([
    getPR(prNumber),
    getPRComments(prNumber),
  ]);

  if (!prInfo) return null;

  const { base, merged, merged_at, merge_commit_sha } = prInfo;

  // PR is somehow targeting a repo that isn't in the electron org
  // or that isn't electron/electron.
  if (base.user.login !== 'electron' || base.repo.name !== 'electron') {
    return null;
  }

  // PRs merged before we renamed the default branch to main from master
  // will have a base.ref of master and a base.repo.default_branch of main.
  const primaryPRBeforeRename =
    base.ref === 'master' &&
    merged_at !== null &&
    new Date(merged_at) < new Date('June 1 2021');
  if (primaryPRBeforeRename || base.ref === base.repo.default_branch) {
    const backports: Promise<Backport>[] = [];
    let availableIn: ElectronRelease | null = null;

    // We've been merged, let's find out if this is available in a nightly
    if (merged) {
      const allNightlies = releases.filter(
        (r) => semver.parse(r.version)?.prerelease[0] === 'nightly'
      );
      for (const nightly of allNightlies) {
        const dateParts = nightly.date.split('-').map((n) => parseInt(n, 10));
        const releaseDate = new Date(
          dateParts[0]!,
          dateParts[1]! - 1,
          dateParts[2]! + 1
        );
        if (releaseDate > new Date(merged_at!)) {
          const comparison = await compareTagToCommit(
            `v${nightly.version}`,
            merge_commit_sha!
          );
          if (comparison.status === 'behind') {
            availableIn = nightly;
            break;
          }
        }
      }
    }

    const tropComments = comments.filter((c) => c.user?.login === 'trop[bot]');

    for (const label of prInfo.labels) {
      let targetBranch: string | null = null;
      let state: Backport['state'] | null = null;

      if (label.name.startsWith('merged/')) {
        targetBranch = label.name.substr('merged/'.length);
        state = 'merged';
      } else if (label.name.startsWith('target/')) {
        targetBranch = label.name.substr('target/'.length);
        state = 'pending';
      } else if (label.name.startsWith('needs-manual-bp/')) {
        targetBranch = label.name.substr('needs-manual-bp/'.length);
        state = 'needs-manual';
      } else if (label.name.startsWith('in-flight/')) {
        targetBranch = label.name.substr('in-flight/'.length);
        state = 'in-flight';
      }

      if (targetBranch && state) {
        const backportComment = tropComments.find(
          (c) =>
            (c.body?.startsWith('I have automatically backported') ||
              c.body?.includes('has manually backported this PR ')) &&
            c.body?.includes(`"${targetBranch}"`)
        );

        backports.push(
          (async () => {
            let pr: Backport['pr'] | null = null;
            let backportAvailableIn: ElectronRelease | null = null;
            if (backportComment) {
              const prNo = parseInt(
                backportComment.body?.split('#')[1] ?? '',
                10
              );
              if (!Number.isNaN(prNo) && prNo != null) {
                pr = await getPR(prNo);
              }
              if (pr?.merged) {
                state = 'merged';

                const allInMajor = releases.filter((r) => {
                  const parsed = semver.parse(r.version);
                  return (
                    parsed?.major ===
                      parseInt(targetBranch.split('-')[0]!, 10) &&
                    parsed?.prerelease[0] !== 'nightly'
                  );
                });
                for (const release of allInMajor) {
                  const dateParts = release.date
                    .split('-')
                    .map((n) => parseInt(n, 10));
                  const releaseDate = new Date(
                    dateParts[0]!,
                    dateParts[1]! - 1,
                    dateParts[2]! + 1
                  );
                  if (releaseDate > new Date(pr.merged_at!)) {
                    const comparison = await compareTagToCommit(
                      `v${release.version}`,
                      pr.merge_commit_sha!
                    );
                    if (comparison.status === 'behind') {
                      backportAvailableIn = release;
                      state = 'released';
                      break;
                    }
                  }
                }
              }
            }

            return {
              targetBranch,
              state,
              pr,
              availableIn: backportAvailableIn,
            };
          })()
        );
      }
    }

    // This is the primary PR, we can scan from here for backports
    return {
      primary: {
        pr: prInfo,
        availableIn,
      },
      backports: (await Promise.all(backports)).sort((a, b) =>
        semver.compare(
          a.targetBranch.replace(/-/g, '.').replace(/[xy]/g, '0'),
          b.targetBranch.replace(/-/g, '.').replace(/[xy]/g, '0')
        )
      ),
    };
  }

  // This is a backport PR, we should scan from here for the primary PR and then re-call getPRReleaseStatus with that primary PR

  // c.f. https://github.com/electron/trop/blob/master/src/utils/branch-util.ts#L62
  const backportPattern =
    /(?:^|\n)(?:manual |manually )?backport (?:of )?(?:#(\d+)|https:\/\/github.com\/.*\/pull\/(\d+))/gim;
  const match = backportPattern.exec(prInfo.body ?? '');

  if (!match) return null;
  const parentPRNumber = match[1]
    ? parseInt(match[1], 10)
    : parseInt(match[2]!, 10);

  return { ...(await getPRReleaseStatus(parentPRNumber)) };
}

// TODO: Add styling based on type
async function generateTableRow(type: Change, prUrl: string, changes?: string) {
  const prNumber = prUrl.split('/').at(-1);

  let changesParagraphAst: Paragraph | null = null;

  if (changes != null) {
    const changesAst = fromMarkdown(changes);
    const [changesParagraph] = changesAst.children;
    changesParagraphAst = changesParagraph as Paragraph;
  }

  const releaseStatus = await getPRReleaseStatus(Number(prNumber));
  const allReleasePorts = [
    releaseStatus?.primary,
    ...(releaseStatus?.backports ?? []),
  ];

  const formattedVersions = allReleasePorts.flatMap((port, index, array) => {
    const version = port?.availableIn?.version;
    if (version == null) return [];

    const isNotLastPortInArray = index !== array.length - 1;
    if (isNotLastPortInArray) {
      return [
        { type: 'inlineCode', value: version },
        // Add <br> in between versions for spacing
        {
          type: 'mdxJsxTextElement',
          name: 'br',
          data: { _mdxExplicitJsx: true },
        },
      ];
    }

    return [{ type: 'inlineCode', value: version }];
  });

  return {
    type: 'tableRow',
    children: [
      {
        type: 'tableCell',
        children: formattedVersions || { type: 'inlineCode', value: 'None' },
      },
      {
        type: 'tableCell',
        children: [
          {
            type: 'link',
            title: null,
            url: prUrl,
            children: [{ type: 'inlineCode', value: '#' + prNumber }],
          },
        ],
      },
      {
        type: 'tableCell',
        children: [
          ...(changes
            ? changesParagraphAst!.children
            : [{ type: 'inlineCode', value: type }]),
        ],
      },
    ],
  } as TableRow;
}

async function transformer(tree: ParentWithMdxJsxFlowElement) {
  for (let nodeIdx = 0; nodeIdx < tree.children.length; nodeIdx++) {
    const node = tree.children[nodeIdx]!;

    const isYamlHistoryCodeBlock =
      node.type === 'code' && node.lang === 'YAML' && node.meta === 'history';
    if (!isYamlHistoryCodeBlock) continue;

    // TODO: Handle validation
    const apiHistory = parseYaml(node.value) as ApiHistory;

    // ? Maybe this is too much abstraction?
    const apiHistoryChangeRows: TableRow[] = await Promise.all([
      ...(apiHistory.added?.map((added) =>
        generateTableRow(Change.ADDED, added['pr-url'])
      ) ?? []),
      ...(apiHistory.changes?.map(async (change) =>
        generateTableRow(
          Change.CHANGED,
          change['pr-url'],
          change['description']
        )
      ) ?? []),
      ...(apiHistory.deprecated?.map((deprecated) =>
        generateTableRow(Change.DEPRECATED, deprecated['pr-url'])
      ) ?? []),
    ]);

    // Sort by PR number, lower number on bottom of table
    apiHistoryChangeRows.sort((a, b) => {
      const [, aPR] = a.children;
      const [aLink] = aPR!.children;
      const [aInlineCode] = (aLink as Link).children;

      const aPrNumber = parseInt(
        (aInlineCode as InlineCode).value.slice(1) // Remove the #
      );

      const [, bPR] = b.children;
      const [bLink] = bPR!.children;
      const [bInlineCode] = (bLink as Link).children;

      const bPrNumber = parseInt(
        (bInlineCode as InlineCode).value.slice(1) // Remove the #
      );

      return bPrNumber - aPrNumber;
    });

    const apiHistoryDetails = {
      type: 'mdxJsxFlowElement',
      name: 'details',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'class',
          value: 'api-history',
        },
      ],
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'summary',
          attributes: [] as MdxJsxAttribute[],
          children: [
            {
              type: 'text',
              value: 'History',
            },
          ],
          data: {
            _mdxExplicitJsx: true,
          },
        },
        {
          type: 'table',
          align: ['center', 'center', 'center'],
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'Version(s)' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'PR' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'Changes' }],
                },
              ],
            },
            ...apiHistoryChangeRows,
          ],
        },
      ],
      data: {
        _mdxExplicitJsx: true,
      },
    } satisfies MdxJsxFlowElementWithSummary;

    tree.children[nodeIdx] = apiHistoryDetails;
  }
}

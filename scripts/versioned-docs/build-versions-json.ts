/**
 * Builds `/docs/versions.json` from what is actually in the docs storage
 * container, so concurrent publish runs cannot race each other:
 *
 *   {
 *     "latest": "v44.3.0",                            // newest stable
 *     "next": "v45.0.0-alpha.6",                      // newest prerelease newer than latest, or null
 *     "versions": ["v44.3.0", "v44.2.1", ...],        // stable releases, newest first
 *     "prereleases": ["v45.0.0-alpha.6", ...],        // alpha/beta releases, newest first
 *     "dev": { "sha": "<40-hex>", "updated": "<ISO 8601>" }  // if /docs/dev was published
 *   }
 *
 * The CDN uses `next` to redirect `/docs/next/*` to that prerelease's docs.
 *
 * Usage (from the workflow):
 *
 *   az storage blob list ... --prefix docs/v --delimiter / --output json \
 *     | DEV_SHA=... DEV_UPDATED=... node scripts/versioned-docs/build-versions-json.ts \
 *     > versions.json
 *
 * stdin is the JSON output of `az storage blob list` (any array of objects
 * with a `name`); the `docs/vX.Y.Z/` and `docs/vX.Y.Z-<pre>/` prefixes found
 * in it are the published versions.
 */
import semver from 'semver';

import {
  isPrereleaseVersion,
  isStableVersion,
} from '../../src/util/docs-version.ts';

export interface VersionsJson {
  latest: string | null;
  next: string | null;
  versions: string[];
  prereleases: string[];
  dev?: { sha: string; updated: string };
}

export interface PublishedVersions {
  /** Stable `vX.Y.Z` releases, newest first */
  versions: string[];
  /** `vX.Y.Z-alpha.N` / `vX.Y.Z-beta.N` releases, newest first */
  prereleases: string[];
}

/**
 * Sorts release tags newest first by semver: `major.minor.patch`, then the
 * prerelease identifiers (`alpha` < `beta`, numeric segments compared
 * numerically, so `alpha.10` > `alpha.9`), a release sorting after all its
 * prereleases.
 */
export function sortReleasesDescending(versions: string[]): string[] {
  return semver.rsort([...new Set(versions)]);
}

/**
 * Extracts the published versions from blob or prefix names such as
 * `docs/v44.3.0/`, `docs/v44.3.0/api/app/index.html`,
 * `docs/v45.0.0-alpha.6/`. Anything else (`docs/dev/`, `docs/latest/`,
 * nightlies...) is ignored.
 */
export function versionsFromBlobNames(names: string[]): PublishedVersions {
  const versions: string[] = [];
  const prereleases: string[] = [];

  for (const name of names) {
    const match = name.match(/^docs\/([^/]+)\//);
    if (!match) {
      continue;
    }
    if (isStableVersion(match[1])) {
      versions.push(match[1]);
    } else if (isPrereleaseVersion(match[1])) {
      prereleases.push(match[1]);
    }
  }

  return {
    versions: sortReleasesDescending(versions),
    prereleases: sortReleasesDescending(prereleases),
  };
}

/**
 * The version `/docs/next/` should resolve to: the newest published
 * prerelease that is newer than the latest stable release, or `null` when
 * the newest stable already supersedes every published prerelease (or no
 * prerelease is published).
 */
export function nextVersion(
  latest: string | null,
  prereleases: string[],
): string | null {
  const [newest] = sortReleasesDescending(prereleases);

  if (!newest) {
    return null;
  }

  return latest === null || semver.gt(newest, latest) ? newest : null;
}

export function buildVersionsJson(
  names: string[],
  dev?: { sha?: string; updated?: string },
): VersionsJson {
  const { versions, prereleases } = versionsFromBlobNames(names);
  const latest = versions[0] ?? null;
  const result: VersionsJson = {
    latest,
    next: nextVersion(latest, prereleases),
    versions,
    prereleases,
  };

  if (dev?.sha?.trim()) {
    result.dev = {
      sha: dev.sha.trim(),
      updated: dev.updated?.trim() || new Date().toISOString(),
    };
  }

  return result;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const input = (await readStdin()).trim();
  const blobs = input ? (JSON.parse(input) as Array<{ name: string }>) : [];
  const names = blobs
    .map((blob) => blob?.name)
    .filter((name): name is string => typeof name === 'string');

  const json = buildVersionsJson(names, {
    sha: process.env.DEV_SHA,
    updated: process.env.DEV_UPDATED,
  });

  process.stdout.write(`${JSON.stringify(json, null, 2)}\n`);
}

if (
  process.argv[1] &&
  import.meta.filename &&
  process.argv[1] === import.meta.filename
) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

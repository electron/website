/**
 * Computes which docs versions the `publish-versioned-docs` workflow should
 * build on a scheduled (gap-fill) run:
 *
 * - the alpha/beta prereleases of every major that has no stable release
 *   yet (the line `/docs/next/` points at) that are not published, newest
 *   first so `next` resolves to the newest one as soon as possible.
 *   Prereleases of majors that already shipped a stable release are never
 *   backfilled; nightlies are never published.
 * - every stable Electron release since `MIN_VERSION` that is not yet
 *   published, oldest first.
 *
 * The combined list is capped so the backfill proceeds incrementally, and
 * `dev` (always rebuilt from `main`) is appended.
 *
 * Prints a JSON array to stdout, e.g.
 * `["v45.0.0-alpha.6","v38.0.0","v38.0.1","dev"]`.
 */
import { ElectronVersions } from '@electron/fiddle-core';
import semver from 'semver';

import { DEV_VERSION, WEBSITE_ORIGIN } from '../../src/util/docs-version.ts';

/** Oldest stable release that gets a versioned docs snapshot */
export const MIN_VERSION = 'v38.0.0';

/** Maximum number of releases a single scheduled run publishes */
export const MAX_VERSIONS_PER_RUN = 10;

const PUBLISHED_PRERELEASE_TYPES = new Set(['alpha', 'beta']);

export interface SelectMissingOptions {
  /** Oldest stable release to consider, inclusive (default {@link MIN_VERSION}) */
  minVersion?: string;
  /** Cap on the number of releases returned (default {@link MAX_VERSIONS_PER_RUN}) */
  cap?: number;
}

/** `true` for `X.Y.Z-alpha.N` / `X.Y.Z-beta.N` (not nightlies) */
const isPublishedPrereleaseType = (version: string): boolean => {
  const [type] = semver.prerelease(version) ?? [];
  return typeof type === 'string' && PUBLISHED_PRERELEASE_TYPES.has(type);
};

/**
 * Pure selection logic.
 *
 * @param allVersions Every known Electron version (with or without `v`)
 * @param published Versions already available under `/docs/` (stable and
 * prereleases)
 * @returns the missing prereleases of the unreleased majors (newest first),
 * then the missing stable releases ≥ `minVersion` (oldest first), at most
 * `cap` of them in total, followed by `dev`.
 */
export function selectMissingVersions(
  allVersions: string[],
  published: string[],
  {
    minVersion = MIN_VERSION,
    cap = MAX_VERSIONS_PER_RUN,
  }: SelectMissingOptions = {},
): string[] {
  const publishedSet = new Set(published.map((v) => `v${semver.clean(v)}`));

  const known = [
    ...new Set(
      allVersions
        .map((v) => semver.clean(v))
        .filter((v): v is string => v !== null),
    ),
  ];

  const stable = known.filter((v) => semver.prerelease(v) === null);
  const stableMajors = new Set(stable.map((v) => semver.major(v)));

  const missingStable = semver
    .sort(stable.filter((v) => semver.gte(v, minVersion)))
    .map((v) => `v${v}`)
    .filter((v) => !publishedSet.has(v));

  const missingPrereleases = semver
    .rsort(
      known.filter(
        (v) =>
          isPublishedPrereleaseType(v) && !stableMajors.has(semver.major(v)),
      ),
    )
    .map((v) => `v${v}`)
    .filter((v) => !publishedSet.has(v));

  return [
    ...[...missingPrereleases, ...missingStable].slice(0, cap),
    DEV_VERSION,
  ];
}

/**
 * Fetches `/docs/versions.json` and returns every published release (stable
 * and prerelease); a 404 (nothing published yet) or any other failure counts
 * as "nothing published".
 */
export async function fetchPublishedVersions(
  url = `${WEBSITE_ORIGIN}/docs/versions.json`,
): Promise<string[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as {
      versions?: unknown;
      prereleases?: unknown;
    };
    return [data.versions, data.prereleases].flatMap((list) =>
      Array.isArray(list)
        ? list.filter((v): v is string => typeof v === 'string')
        : [],
    );
  } catch {
    return [];
  }
}

async function main() {
  const { versions } = await ElectronVersions.create({ ignoreCache: true });
  const published = await fetchPublishedVersions();
  const selected = selectMissingVersions(
    versions.map((v) => v.version),
    published,
  );
  process.stdout.write(`${JSON.stringify(selected)}\n`);
}

// Only run when executed directly (the tests import the pure functions)
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

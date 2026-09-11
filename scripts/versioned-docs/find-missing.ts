/**
 * Computes which docs versions the `publish-versioned-docs` workflow should
 * build on a scheduled (gap-fill) run: every stable Electron release since
 * `MIN_VERSION` that is not yet published, oldest first and capped so the
 * backfill proceeds incrementally, plus `next` (always republished from
 * `main`).
 *
 * Prints a JSON array to stdout, e.g. `["v38.0.0","v38.0.1","next"]`.
 */
import { ElectronVersions } from '@electron/fiddle-core';
import semver from 'semver';

import { NEXT_VERSION, WEBSITE_ORIGIN } from '../../src/util/docs-version.ts';

/** Oldest release that gets a versioned docs snapshot */
export const MIN_VERSION = 'v38.0.0';

/** Maximum number of releases a single scheduled run publishes */
export const MAX_VERSIONS_PER_RUN = 10;

export interface SelectMissingOptions {
  /** Oldest release to consider, inclusive (default {@link MIN_VERSION}) */
  minVersion?: string;
  /** Cap on the number of releases returned (default {@link MAX_VERSIONS_PER_RUN}) */
  cap?: number;
}

/**
 * Pure selection logic.
 *
 * @param allVersions Every known Electron version (with or without `v`)
 * @param published Versions already available under `/docs/`
 * @returns the stable releases ≥ `minVersion` missing from `published`,
 * oldest first, at most `cap` of them, followed by `next`.
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

  const stable = allVersions
    .map((v) => semver.clean(v))
    .filter((v): v is string => v !== null)
    .filter((v) => semver.prerelease(v) === null)
    .filter((v) => semver.gte(v, minVersion));

  const missing = semver
    .sort([...new Set(stable)])
    .map((v) => `v${v}`)
    .filter((v) => !publishedSet.has(v));

  return [...missing.slice(0, cap), NEXT_VERSION];
}

/**
 * Fetches `/docs/versions.json`; a 404 (nothing published yet) or any other
 * failure counts as "nothing published".
 */
export async function fetchPublishedVersions(
  url = `${WEBSITE_ORIGIN}/docs/versions.json`,
): Promise<string[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { versions?: unknown };
    return Array.isArray(data.versions)
      ? data.versions.filter((v): v is string => typeof v === 'string')
      : [];
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

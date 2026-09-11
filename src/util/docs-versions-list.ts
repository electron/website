/**
 * Turns the published `/docs/versions.json` into the entries shown by the
 * docs version dropdown. Shared with the tests; no browser or Node APIs.
 */
import semver from 'semver';

import { LATEST_VERSION, NEXT_VERSION } from './docs-version.ts';

/** Contract of https://www.electronjs.org/docs/versions.json */
export interface DocsVersionsJson {
  /** The newest published release, e.g. `v44.3.0` */
  latest: string;
  /** Every published release snapshot, newest first */
  versions: string[];
  /** Present when `/docs/next` has been published */
  next?: { sha: string; updated: string };
}

export interface DocsVersionEntry {
  /** The docs version folder / URL segment: `latest`, `next` or `vX.Y.Z` */
  version: string;
  /** What to show in the dropdown */
  label: string;
}

/**
 * Sorts release versions newest first, dropping anything that is not a
 * valid semver.
 */
export function sortVersionsDescending(versions: string[]): string[] {
  return semver.rsort(versions.filter((version) => semver.valid(version)));
}

/**
 * Keeps only the newest release of every major version, newest major first.
 */
export function newestPerMajor(versions: string[]): string[] {
  const seen = new Set<number>();
  const result: string[] = [];

  for (const version of sortVersionsDescending(versions)) {
    const major = semver.major(version);
    if (seen.has(major)) continue;
    seen.add(major);
    result.push(version);
  }

  return result;
}

/**
 * Builds the dropdown entries: `latest`, `next` (when published), then the
 * newest release of every major. The version currently being viewed is
 * always included so it can be highlighted, even if it is an older patch.
 */
export function buildDocsVersionEntries(
  data: DocsVersionsJson,
  currentVersion: string,
): DocsVersionEntry[] {
  const entries: DocsVersionEntry[] = [
    {
      version: LATEST_VERSION,
      label: data.latest ? `latest (${data.latest})` : 'latest',
    },
  ];

  if (data.next) {
    entries.push({ version: NEXT_VERSION, label: 'next (unreleased)' });
  }

  const releases = newestPerMajor(data.versions ?? []);

  if (
    semver.valid(currentVersion) &&
    !releases.includes(currentVersion) &&
    (data.versions ?? []).includes(currentVersion)
  ) {
    releases.push(currentVersion);
  }

  for (const version of sortVersionsDescending(releases)) {
    entries.push({ version, label: version });
  }

  return entries;
}

/**
 * Turns the published `/docs/versions.json` into the entries shown by the
 * docs version dropdown. Shared with the tests; no browser or Node APIs.
 */
import semver from 'semver';

import {
  DEV_VERSION,
  LATEST_VERSION,
  NEXT_ALIAS,
  isPrereleaseVersion,
} from './docs-version.ts';

/**
 * Contract of https://www.electronjs.org/docs/versions.json (see
 * `scripts/versioned-docs/build-versions-json.ts`). Everything but
 * `latest` / `versions` is treated as optional so the dropdown keeps
 * working against an older or partial file.
 */
export interface DocsVersionsJson {
  /** The newest published stable release, e.g. `v44.3.0` */
  latest: string | null;
  /** The newest published prerelease newer than `latest`, e.g. `v45.0.0-alpha.6` */
  next?: string | null;
  /** Every published stable release snapshot, newest first */
  versions: string[];
  /** Every published prerelease snapshot, newest first */
  prereleases?: string[];
  /** Present when `/docs/dev` has been published */
  dev?: { sha: string; updated: string } | null;
}

export interface DocsVersionEntry {
  /** The URL segment to link to: `latest`, `next`, `dev` or a release tag */
  version: string;
  /** What to show in the dropdown */
  label: string;
  /**
   * For aliases (`next`), the docs version the CDN actually serves, so the
   * entry is highlighted when that version is being viewed.
   */
  resolvesTo?: string;
}

/** `true` when the entry is the one the given docs version is served from */
export function isEntryForVersion(
  entry: DocsVersionEntry,
  version: string,
): boolean {
  return entry.version === version || entry.resolvesTo === version;
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
 * Builds the dropdown entries: `latest`, `next` (when a prerelease newer
 * than latest is published), `dev` (when published), then the newest
 * stable release of every major. The version currently being viewed is
 * always included so it can be highlighted, even if it is an older patch
 * or a prerelease other than `next`.
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

  if (typeof data.next === 'string' && data.next) {
    entries.push({
      version: NEXT_ALIAS,
      label: `next (${data.next})`,
      resolvesTo: data.next,
    });
  }

  if (data.dev) {
    entries.push({ version: DEV_VERSION, label: 'dev (unreleased)' });
  }

  if (
    isPrereleaseVersion(currentVersion) &&
    currentVersion !== data.next &&
    (data.prereleases ?? []).includes(currentVersion)
  ) {
    entries.push({ version: currentVersion, label: currentVersion });
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

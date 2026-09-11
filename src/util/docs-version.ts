/**
 * Helpers shared by the build scripts, the remark transformers and the
 * client-side components to reason about "which Electron docs version is
 * this?".
 *
 * The website hosts one docs folder per version under `docs/`:
 *
 * - `docs/latest`  → `/docs/latest/...`  (the mutable, canonical docs)
 * - `docs/next`    → `/docs/next/...`    (built from `electron/electron@main`)
 * - `docs/vX.Y.Z`  → `/docs/vX.Y.Z/...`  (an immutable snapshot of a release)
 *
 * The folder name is therefore the version identifier, and it shows up both
 * in file paths (`<siteDir>/docs/v44.3.0/api/app.md`) and in URL paths
 * (`/docs/v44.3.0/api/app`). This module has no Node.js imports so it can be
 * bundled into the client.
 */

export const LATEST_VERSION = 'latest';
export const NEXT_VERSION = 'next';

/** Where the canonical (latest) docs live. Used for cross-build links. */
export const WEBSITE_ORIGIN = 'https://www.electronjs.org';

const RELEASE_VERSION_REGEX = /^v\d+\.\d+\.\d+$/;

/** `true` for `vX.Y.Z` style versions (immutable release snapshots). */
export function isReleaseVersion(version: string): boolean {
  return RELEASE_VERSION_REGEX.test(version);
}

/** `true` for anything the pre-build / versioned build accepts. */
export function isValidDocsVersion(version: string): boolean {
  return (
    version === LATEST_VERSION ||
    version === NEXT_VERSION ||
    isReleaseVersion(version)
  );
}

export interface DocsVersionPath {
  /** The version folder name, e.g. `latest`, `next` or `v44.3.0` */
  version: string;
  /** Whatever follows the version segment, without a leading slash */
  rest: string;
}

/**
 * Extracts the docs version out of a file path or URL path.
 *
 * Understands:
 * - `<anything>/docs/<version>/<rest>` (docs sources and `/docs/...` URLs)
 * - `<anything>/docusaurus-plugin-content-docs/current/<version>/<rest>`
 *   (translated docs, which mirror the `docs/` layout under `i18n/`)
 *
 * @returns `undefined` when the path is not a docs path.
 */
export function parseDocsVersionPath(
  filePath: string,
): DocsVersionPath | undefined {
  const normalized = filePath.replace(/\\/g, '/');

  const match =
    normalized.match(/(?:^|\/)docs\/([^/]+)(?:\/(.*))?$/) ??
    normalized.match(
      /\/docusaurus-plugin-content-docs\/current\/([^/]+)(?:\/(.*))?$/,
    );

  if (!match) {
    return undefined;
  }

  return { version: match[1], rest: match[2] ?? '' };
}

/**
 * The `electron/electron` git ref that the docs of a given version were
 * built from. Used for "view source on GitHub" style links.
 *
 * @param version The docs version (`latest`, `next` or `vX.Y.Z`)
 * @param latestStable The latest stable Electron version (e.g. `44.3.0`),
 * only needed to resolve `latest`.
 */
export function sourceRefForVersion(
  version: string,
  latestStable: string,
): string {
  if (version === NEXT_VERSION) {
    return 'main';
  }

  if (isReleaseVersion(version)) {
    return version;
  }

  return `v${latestStable}`;
}

/**
 * The Electron version (without the `v` prefix) whose fiddles should be
 * used for the "Open in Fiddle" buttons of a docs version. Fiddles only
 * exist for released versions, so `next` falls back to the latest stable.
 */
export function fiddleVersionForDocsVersion(
  version: string,
  latestStable: string,
): string {
  return isReleaseVersion(version) ? version.slice(1) : latestStable;
}

/**
 * Maps a URL path from one docs version to another, e.g.
 * `/docs/v44.3.0/api/app` → `/docs/latest/api/app`.
 *
 * Paths that are not docs paths are returned unchanged.
 */
export function replaceDocsVersionInPath(
  pathname: string,
  targetVersion: string,
): string {
  const parsed = parseDocsVersionPath(pathname);

  if (!parsed) {
    return pathname;
  }

  return `/docs/${targetVersion}${parsed.rest ? `/${parsed.rest}` : '/'}`;
}

/**
 * The absolute URL of the same page in another docs version, on the
 * canonical website origin (always a full page load, because other
 * versions are separate Docusaurus builds).
 */
export function docsVersionUrl(pathname: string, targetVersion: string) {
  return `${WEBSITE_ORIGIN}${replaceDocsVersionInPath(pathname, targetVersion)}`;
}

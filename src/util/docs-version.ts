/**
 * Helpers shared by the build scripts, the remark transformers and the
 * client-side components to reason about "which Electron docs version is
 * this?".
 *
 * The website hosts one docs folder per version under `docs/`:
 *
 * - `docs/latest`  → `/docs/latest/...`  (the mutable, canonical docs)
 * - `docs/dev`     → `/docs/dev/...`     (built from `electron/electron@main`)
 * - `docs/vX.Y.Z`  → `/docs/vX.Y.Z/...`  (an immutable snapshot of a release,
 *   stable `vX.Y.Z` or prerelease `vX.Y.Z-alpha.N` / `vX.Y.Z-beta.N`)
 *
 * `/docs/next/` is not a build: the CDN redirects it to the newest published
 * prerelease (like the `next` npm dist-tag), see `/docs/versions.json`.
 *
 * The folder name is therefore the version identifier, and it shows up both
 * in file paths (`<siteDir>/docs/v44.3.0/api/app.md`) and in URL paths
 * (`/docs/v44.3.0/api/app`). This module has no Node.js imports so it can be
 * bundled into the client.
 */

export const LATEST_VERSION = 'latest';
/** The mutable docs built from `electron/electron@main` */
export const DEV_VERSION = 'dev';
/** Alias for the newest prerelease, served by the CDN; never built */
export const NEXT_ALIAS = 'next';

/** Where the canonical (latest) docs live. Used for cross-build links. */
export const WEBSITE_ORIGIN = 'https://www.electronjs.org';

const STABLE_VERSION_REGEX = /^v\d+\.\d+\.\d+$/;
const PRERELEASE_VERSION_REGEX = /^v\d+\.\d+\.\d+-(?:alpha|beta)\.\d+$/;
const NIGHTLY_VERSION_REGEX = /^v\d+\.\d+\.\d+-nightly\./;

/** `true` for `vX.Y.Z` stable release versions. */
export function isStableVersion(version: string): boolean {
  return STABLE_VERSION_REGEX.test(version);
}

/** `true` for `vX.Y.Z-alpha.N` / `vX.Y.Z-beta.N` prerelease versions. */
export function isPrereleaseVersion(version: string): boolean {
  return PRERELEASE_VERSION_REGEX.test(version);
}

/**
 * `true` for any release tag the website publishes an immutable snapshot
 * of: stable releases and alpha/beta prereleases (never nightlies).
 */
export function isReleaseVersion(version: string): boolean {
  return isStableVersion(version) || isPrereleaseVersion(version);
}

/** `true` for anything the pre-build / versioned build accepts. */
export function isValidDocsVersion(version: string): boolean {
  return (
    version === LATEST_VERSION ||
    version === DEV_VERSION ||
    isReleaseVersion(version)
  );
}

/**
 * A human-readable explanation for common invalid docs versions, to append
 * to error messages. `undefined` when there is nothing specific to say.
 */
export function invalidDocsVersionHint(version: string): string | undefined {
  if (version === NEXT_ALIAS) {
    return (
      `"${NEXT_ALIAS}" is an alias for the newest prerelease and is not built by the website; ` +
      `publish the prerelease tag itself (e.g. v45.0.0-alpha.6), or "${DEV_VERSION}" for the docs on main.`
    );
  }

  if (NIGHTLY_VERSION_REGEX.test(version)) {
    return 'Nightly releases are not published as versioned docs.';
  }

  return undefined;
}

export interface DocsVersionPath {
  /** The version folder name, e.g. `latest`, `dev` or `v44.3.0` */
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
 * @param version The docs version (`latest`, `dev` or a release tag)
 * @param latestStable The latest stable Electron version (e.g. `44.3.0`),
 * only needed to resolve `latest`.
 */
export function sourceRefForVersion(
  version: string,
  latestStable: string,
): string {
  if (version === DEV_VERSION) {
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
 * exist for tagged releases, so `dev` falls back to the latest stable.
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

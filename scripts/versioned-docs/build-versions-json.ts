/**
 * Builds `/docs/versions.json` from what is actually in the docs storage
 * container, so concurrent publish runs cannot race each other:
 *
 *   {
 *     "latest": "v44.3.0",
 *     "versions": ["v44.3.0", "v44.2.1", ...],   // newest first
 *     "next": { "sha": "<40-hex>", "updated": "<ISO 8601>" }  // if published
 *   }
 *
 * Usage (from the workflow):
 *
 *   az storage blob list ... --prefix docs/ --output json \
 *     | NEXT_SHA=... NEXT_UPDATED=... node scripts/versioned-docs/build-versions-json.ts \
 *     > versions.json
 *
 * stdin is the JSON output of `az storage blob list` (any array of objects
 * with a `name`); the `docs/vX.Y.Z/` prefixes found in it are the published
 * versions.
 */
import semver from 'semver';

import { isReleaseVersion } from '../../src/util/docs-version.ts';

export interface VersionsJson {
  latest: string | null;
  versions: string[];
  next?: { sha: string; updated: string };
}

/**
 * Extracts the published `vX.Y.Z` versions from blob or prefix names such as
 * `docs/v44.3.0/`, `docs/v44.3.0/api/app/index.html`.
 */
export function versionsFromBlobNames(names: string[]): string[] {
  const versions = new Set<string>();

  for (const name of names) {
    const match = name.match(/^docs\/([^/]+)\//);
    if (match && isReleaseVersion(match[1])) {
      versions.add(match[1]);
    }
  }

  return semver.rsort([...versions]);
}

export function buildVersionsJson(
  names: string[],
  next?: { sha?: string; updated?: string },
): VersionsJson {
  const versions = versionsFromBlobNames(names);
  const result: VersionsJson = {
    latest: versions[0] ?? null,
    versions,
  };

  if (next?.sha) {
    result.next = {
      sha: next.sha.trim(),
      updated: next.updated?.trim() || new Date().toISOString(),
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
    sha: process.env.NEXT_SHA,
    updated: process.env.NEXT_UPDATED,
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

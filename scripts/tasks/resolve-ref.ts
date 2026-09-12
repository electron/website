import { logger } from '@docusaurus/logger';

const GITHUB_API = 'https://api.github.com/repos/electron/electron';

interface GitRefResponse {
  object: { sha: string; type: 'commit' | 'tag'; url: string };
}

interface GitTagResponse {
  object: { sha: string; type: string };
}

const headers = (): Record<string, string> => {
  const result: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    result.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return result;
};

const getJson = async <T>(url: string): Promise<T | undefined> => {
  const response = await fetch(url, { headers: headers() });

  if (!response.ok) {
    logger.warn(`GitHub API ${logger.green(url)} → ${response.status}`);
    return undefined;
  }

  return (await response.json()) as T;
};

/**
 * Resolves a git ref of `electron/electron` (a tag like `v44.3.0`, a branch
 * like `main`, or a SHA) to a commit SHA using the GitHub API. Annotated
 * tags are dereferenced to the commit they point at.
 *
 * @returns the 40-character commit SHA, or `undefined` if it could not be
 * resolved (network error, unknown ref, rate limit...). Never throws.
 */
export const resolveElectronRef = async (
  ref: string,
): Promise<string | undefined> => {
  if (/^[0-9a-f]{40}$/.test(ref)) {
    return ref;
  }

  try {
    const refPath = ref.startsWith('v') ? `tags/${ref}` : `heads/${ref}`;
    const gitRef = await getJson<GitRefResponse>(
      `${GITHUB_API}/git/ref/${refPath}`,
    );

    if (!gitRef) {
      return undefined;
    }

    if (gitRef.object.type === 'tag') {
      // Annotated tag: dereference to the tagged commit
      const tag = await getJson<GitTagResponse>(gitRef.object.url);
      return tag?.object.sha;
    }

    return gitRef.object.sha;
  } catch (error) {
    logger.warn(`Failed to resolve ${logger.green(ref)}: ${error}`);
    return undefined;
  }
};

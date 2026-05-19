import { execute } from './execute.ts';

/**
 * Returns the current modified files in the repo.
 */
export const getChanges = async () => {
  const { stdout } = await execute('git status --porcelain');

  return stdout.trim();
};

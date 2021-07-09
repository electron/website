//@ts-check
const fs = require('fs').promises;
const { join } = require('path');
const del = require('del');

const splitPattern = `#####`;

/**
 * Gets the patterns to use from `contents`:
 * * Contents after the `splitPattern`
 * * No comment lines
 * * No empty lines
 *
 * @param {string} contents
 */
const getPatterns = (contents) => {
  const [, toDelete] = contents.split(splitPattern);

  return toDelete
    .trim()
    .split('\n')
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trim());
};

/**
 * Deletes all the patterns specified in the provided .gitignore
 * after the pattern `#####`
 * @param {string} gitignorePath
 */
const cleanProject = async (gitignorePath) => {
  const gitignore = await fs.readFile(gitignorePath, 'utf-8');
  const toDelete = getPatterns(gitignore);

  const files = await del(toDelete, { dryRun: true });
};

if (require.main === module) {
  cleanProject(join(process.cwd(), '.gitignore'));
}

module.exports = {
  cleanProject,
};

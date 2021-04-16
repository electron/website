//@ts-check

/**
 *
 */

const fs = require('fs').promises;
const globby = require('globby');

const ignoredEntries = new Set(['fiddles', 'images']);
const defaultCategory = 'docs';
const topCategories = new Set(['api', defaultCategory]);

const sidebar = {
  docs: [],
  api: [],
};

/**
 * @typedef Entry
 * @property {string} type
 * @property {string} label
 * @property {string[]} items
 */

/**
 * Capitalizes the first letter of each word in title.
 * @param {string} title
 */
const capitalize = (title) => {
  const words = title.split(' ');
  const capitalizedWords = words.map((word) => {
    return word[0].toUpperCase() + word.substring(1);
  });

  return capitalizedWords.join(' ');
};

/**
 * Creates/updates `sidebars.js` based on:
 * - Folder structure
 * - Frontmatter (TODO)
 * @param {string} root Where the docs are
 * @param {string} destination The path where `sidebars.js` needs to be created
 */
const createSidebar = async (root, destination) => {
  const documents = await globby(`**/*.md`, {
    onlyFiles: true,
    cwd: root,
  });

  /** @type {Map<string, Entry>} */
  const categories = new Map();
  for (const document of documents) {
    const segments = document.split('/');

    // This matches files like `readme.md` and `styleguide.md` that we do not want
    if (segments.length === 1) {
      continue;
    }

    const categoryId = segments[0];

    let category;

    if (!categories.has(categoryId)) {
      category = {
        type: 'category',
        label:
          categoryId === 'api'
            ? 'modules'
            : capitalize(categoryId.replace(/-/g, ' ')), // Do better...
        items: [],
      };
      categories.set(categoryId, category);
    }

    category = categories.get(categoryId);

    category.items.push(document.replace('.md', ''));
    category.items = category.items.sort();
  }

  for (const [category, content] of categories) {
    if (category === 'api') {
      sidebar.api.push(content);
    } else {
      sidebar.docs.push(content);
    }
  }

  await fs.writeFile(
    destination,
    `module.exports = ${JSON.stringify(sidebar, null, 2)};`,
    'utf-8'
  );
};

module.exports = {
  createSidebar,
};

//@ts-check

const fs = require('fs').promises;
const { existsSync } = require('fs');
const { stringify } = require('json5');
const globby = require('globby');

const IGNORE_LIST = ['api/locales', 'api/remote', 'api/synopsis'];

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
 * Returns a category inside `sidebars` whose property
 * `label` matches `category`.
 * @param {string} categoryName The category to find
 * @param {Object.<string, Entry[]>} sidebars The sidebars object
 * @param {string} defaultTopLevel The default top level to add
 * the category if it does not exist
 */
const findCategoryForDocument = (categoryName, sidebars, defaultTopLevel) => {
  const topLevelIds = Object.keys(sidebars);

  for (const topLevelId of topLevelIds) {
    const entries = sidebars[topLevelId];

    for (const category of entries) {
      if (category.type === 'category' && category.label === categoryName) {
        return category;
      }
    }
  }

  /*
     If we reach this point, the category does not exists so we
     create a new one and add it directly to sidebars.
     Not a fan of modifying parameters though 😞
  */

  const category = {
    type: 'category',
    label: categoryName,
    items: [],
  };

  sidebars[defaultTopLevel].push(category);

  return category;
};

/**
 * Using the given `destination` as the source,
 * adds any new document found at the end of each
 * category while preserving the order.
 * If the file does not exists, it gets created
 * using the folder structure as the guide.
 * @param {string} root Where the docs are
 * @param {string} destination The path where `sidebars.js` lives
 */
const createSidebar = async (root, destination) => {
  const documents = await globby(`**/*.md`, {
    onlyFiles: true,
    cwd: root,
  });

  const sidebars = existsSync(destination)
    ? require(destination)
    : { docs: [], api: [] };

  /** @type {Map<string, Entry>} */
  const reverseLookup = new Map();

  // For files we explicitly don't want in the sidebar,
  // add null entries to the reverseLookup Map
  for (const entry of IGNORE_LIST) {
    reverseLookup.set(entry, null);
  }

  const topLevels = Object.keys(sidebars);

  for (const id of topLevels) {
    for (const category of sidebars[id]) {
      for (const item of category.items) {
        reverseLookup.set(item, category);
      }
    }
  }

  let hasNewDocuments = false;
  for (const document of documents) {
    const documentId = document.replace('.md', '');
    if (reverseLookup.has(documentId)) {
      continue;
    }

    const segments = document.split('/');

    // This matches files like `readme.md` and `styleguide.md` that we do not want
    if (segments.length === 1) {
      continue;
    }

    console.log(`New document found: ${document}`);
    hasNewDocuments = true;

    const categoryId = capitalize(segments[0].replace(/-/g, ' '));
    const defaultTopLevel = segments[0] === 'api' ? 'api' : 'docs';
    const category = findCategoryForDocument(
      categoryId,
      sidebars,
      defaultTopLevel
    );

    category.items.push(document.replace('.md', ''));
  }

  if (hasNewDocuments) {
    console.log(`Updating ${destination}`);
    await fs.writeFile(
      destination,
      `module.exports = ${stringify(sidebars, null, 2)};\n`,
      'utf-8'
    );
  } else {
    console.log(`No new documents found`);
  }
};

module.exports = {
  createSidebar,
};

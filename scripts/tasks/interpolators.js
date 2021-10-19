//@ts-check

/**
 * This script creates a table with links to different guides. To achieve so,
 *
 * 1. it reads the contents of `sidebars.js` and picks the categories under
 *    the variable `categories` below
 * 2. the first item in `items` is where the table will be. It uses the regular
 *    expression in `tableRegex` to do the replacement
 * 3. the contents of that table are the rest of `items` for that category. It
 *    reads their `frontmatter` to populate their title and description
 */
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const categories = ['OS Integration', 'Examples'];

const tableRegex = /<!-- guide-table-start -->(?:.|\n)*<!-- guide-table-end -->/gm;
const header = `
| Guide | Description |
| :---- | ----------- |
`;

/**
 * Replaces the contents that match `tableRegex` with a new markdown table
 * using `filesInfo` as the source of guides and order to use.
 * @param {any[]} filesInfo
 * @param {string} content
 * @returns
 */
const updateContent = (filesInfo, content) => {
  let table = `<!-- guide-table-start -->
${header}`;

  for (const file of filesInfo) {
    table += `| [${file.title}](${file.link}) | ${file.description} |\n`;
  }

  table += `<!-- guide-table-end -->\n`;

  const transformedContent = content.replace(tableRegex, table);

  return transformedContent;
};

/**
 * Receives a `sidebars.js` entry, picks the "overview" item and
 * generates a new table for that file using the rest of the items
 * as the source.
 */
const processCategory = async (category) => {
  const { items } = category;

  // The first item is the "overview" page that contains the table
  const index = items.shift();

  const categoryItems = [];
  for (const filePath of items) {
    const content = await fs.readFile(
      path.join('docs', `${filePath}.md`),
      'utf-8'
    );
    const info = matter(content);

    const fileInfo = {
      filePath,
      link: `./${path.basename(filePath)}.md`,
      content: content,
      category: info.data.category || '',
      description: info.data.description,
      title: info.data.title,
    };

    categoryItems.push(fileInfo);
  }

  const indexContent = await fs.readFile(
    path.join('docs', `${index}.md`),
    'utf-8'
  );

  const newContent = updateContent(categoryItems, indexContent);

  await fs.writeFile(path.join('docs', `${index}.md`), newContent, 'utf-8');
};

/**
 * Finds all the interpolator hints and replaces the content
 * in between with the right information.
 * @param {string} root
 */
const interpolate = async (root) => {
  const sidebars = require('../../sidebars');

  const filteredCategories = sidebars.docs.filter((entry) => {
    return entry.label && categories.includes(entry.label);
  });

  for (const category of filteredCategories) {
    await processCategory(category);
  }
};

module.exports = {
  interpolate,
};

// When a file is run directly from Node.js, `require.main` is set to its module.
// That means that it is possible to determine whether a file has been run directly
// by testing `require.main === module`.
// https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
  process.addListener('unhandledRejection', (e) => {
    console.error(e);
    process.exit(1);
  });

  interpolate('docs');
}

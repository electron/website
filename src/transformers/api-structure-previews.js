const visitParents = require('unist-util-visit-parents');
const fs = require('fs');
const path = require('path');

/**
 *
 *
 */

module.exports = function attacher() {
  return transformer;
};
/**
 *
 * @param {import("unist").Parent} tree
 */
async function transformer(tree) {
  visitParents(tree, isStructure, visitor);
  tree.children.unshift({
    type: 'import',
    value:
      "import APIStructurePreview from '@site/src/components/APIStructurePreview';",
  });
}

/**
 *
 * @param {import("unist").Node} node
 * @returns
 */
function isStructure(node, _index, _parent) {
  return (
    node.type === 'link' && node.url.startsWith('/docs/latest/api/structures/')
  );
}

/**
 *
 * @param {import("unist").Node} node
 */
function visitor(node, _ancestors) {
  const file = fs.readFileSync(
    path.join(__dirname, '..', '..', `${node.url}.md`)
  );
  // hack to remove frontmatter from docs.
  const str = file
    .toString()
    .replace(/---\n(?:(?:.|\n)*)\n---/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // replace the raw link file with our JSX component.
  // See src/components/APIStructurePreview.jsx for implementation.
  if (Array.isArray(node.children) && node.children.length > 0) {
    node.type = 'jsx';
    node.value = `<APIStructurePreview url="${node.url}" title="${node.children[0].value}" content="${str}"/>`;
  }
}

//@ts-check

/**
 * This transformer adds the class="electron-api-options-list"
 * to any <li> element that starts with <code>options</code>.
 * This is for future use in the Algolia crawler to refine the
 * number of list items we want to store in our search index.
 */

const visitParents = require('unist-util-visit-parents');

module.exports = function attacher() {
  return transformer;
};

const CLASS = 'electron-api-options-list';

/**
 *
 * @param {import("unist").Parent} tree
 */
async function transformer(tree) {
  visitParents(tree, 'listItem', visitor);
}

/**
 *
 * @param {import("unist").Node} node
 */
function visitor(node) {
  if (
    Array.isArray(node?.children[0]?.children) &&
    node.children[0].children[0].value === 'options'
  ) {
    node.data = { hProperties: { className: [CLASS] } };
  }
}

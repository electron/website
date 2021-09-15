//@ts-check

/**
 * This transformer adds badge styling to our raw API documentation.
 * 
 * Styles are added via the Badge component from Infima:
 * https://infima.dev/docs/components/badge
 * 
 * The raw Markdown nodes to be transformed are:
 * _macOS_
 * _Linux_
 * _Windows_
 * _Readonly_
 * _Deprecated_
 * _Experimental_
 * 
 * This is done by modifying the node.data.hProperties of each
 * matching AST node. the hProperties object is not directly documented
 * on the MDX side, but is used in its transformation pipeline in the
 * `mdast-util-to-hast` step.
 * 
 * See: https://github.com/syntax-tree/mdast-util-to-hast
 */

const visitParents = require("unist-util-visit-parents");

module.exports = function attacher() {
  return transformer;
};

const PLATFORMS = ['macOS', 'Windows', 'Linux'];
const DEPRECATED = 'Deprecated';
const EXPERIMENTAL = 'Experimental';
const READONLY = 'Readonly';

/**
 *
 * @param {import("unist").Parent} tree
 */
async function transformer(tree) {
  visitParents(tree, 'emphasis', visitor);
}

  /**
   *
   * @param {import("unist").Node} node
   */
  function visitor(node) {
    if (Array.isArray(node.children) && node.children.length === 1) {
      const tag = node.children[0].value;
      if (PLATFORMS.includes(tag)) {
        node.data = {hProperties: {className: ["badge badge--primary"]}}
      } else if (tag === DEPRECATED) {
        node.data = {hProperties: {className: ["badge badge--danger"]}}
      } else if (tag === EXPERIMENTAL) {
        node.data = {hProperties: {className: ["badge badge--warning"]}}
      } else if (tag === READONLY) {
        node.data = {hProperties: {className: ["badge badge--info"]}}
      }
    }
  }

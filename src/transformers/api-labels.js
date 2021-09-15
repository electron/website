//@ts-check

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

import { Parent } from 'unist';
import visitParents from 'unist-util-visit-parents';
import { Data as HastData } from 'mdast-util-to-hast/lib/index';
import { Emphasis, PhrasingContent, Text } from 'mdast';

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
export default function attacher() {
  return transformer;
};

const PLATFORMS = ['macOS', 'Windows', 'Linux'];
const DEPRECATED = 'Deprecated';
const EXPERIMENTAL = 'Experimental';
const READONLY = 'Readonly';

async function transformer(tree: Parent) {
  visitParents(tree, 'emphasis', visitor);
}

function visitor(node: Emphasis) {
  if (node.children.length === 1 && isText(node.children[0])) {
    const tag = node.children[0].value;
    if (PLATFORMS.includes(tag)) {
      node.data = {
        hProperties: { className: ['badge badge--primary'] },
      } satisfies HastData;
    } else if (tag === DEPRECATED) {
      node.data = {
        hProperties: { className: ['badge badge--danger'] },
      } satisfies HastData;
    } else if (tag === EXPERIMENTAL) {
      node.data = {
        hProperties: { className: ['badge badge--warning'] },
      } satisfies HastData;
    } else if (tag === READONLY) {
      node.data = {
        hProperties: { className: ['badge badge--info'] },
      } satisfies HastData;
    }
  }
}

function isText(node: PhrasingContent): node is Text {
  return node.type === 'text';
}

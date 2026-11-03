import type { Parent } from 'unist';
import { visitParents } from 'unist-util-visit-parents';
import type { Data as HastData } from 'hast';
import type { Emphasis, Paragraph } from 'mdast';
import { isText } from '../util/mdx-utils.ts';

/**
 * This transformer adds badge styling to our raw API documentation.
 *
 * Styles are added via the Badge component from Infima:
 * https://infima.dev/docs/components/badge
 *
 * The raw Markdown nodes to be transformed are:
 * _macOS_
 * _mas_
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
}

const PLATFORMS = ['macOS', 'mas', 'Windows', 'Linux'];
const DEPRECATED = 'Deprecated';
const EXPERIMENTAL = 'Experimental';
const READONLY = 'Readonly';

function transformer(tree: Parent) {
  visitParents(tree, 'paragraph', processVisitor);
  visitParents(tree, 'emphasis', visitor);
}

const PROCESS_PREFIX = 'Process: ';

/**
 * Marks the "Process: [Main](...), [Renderer](...)" line at the top of API
 * pages so it can be styled as a label and a row of process chips. The
 * "Process" text becomes its own span and the ", " separators between the
 * links are dropped (the chips are spaced by CSS).
 */
function processVisitor(node: Paragraph) {
  const [first] = node.children;
  if (!first || !isText(first) || !first.value.startsWith(PROCESS_PREFIX)) {
    return;
  }
  node.data = {
    ...node.data,
    hProperties: { className: ['api-process'] },
  } satisfies HastData;
  const label: Emphasis = {
    type: 'emphasis',
    data: { hName: 'span', hProperties: { className: ['api-process__label'] } },
    children: [{ type: 'text', value: 'Process' }],
  };
  const rest = first.value.slice(PROCESS_PREFIX.length);
  node.children.splice(
    0,
    1,
    label,
    ...(rest ? [{ ...first, value: rest }] : []),
  );
  // Drop the ", " text between two links.
  node.children = node.children.filter(
    (child, i, all) =>
      !(
        isText(child) &&
        child.value.trim() === ',' &&
        all[i - 1]?.type === 'link' &&
        all[i + 1]?.type === 'link'
      ),
  );
}

function visitor(node: Emphasis) {
  if (node.children.length === 1 && isText(node.children[0])) {
    const tag = node.children[0].value;
    if (PLATFORMS.includes(tag)) {
      if (tag === 'mas') {
        node.children[0].value = tag.toUpperCase();
      }
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

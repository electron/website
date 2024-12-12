import { Node, Parent } from 'unist';
import { Code } from 'mdast';

import { visitParents, ActionTuple, SKIP } from 'unist-util-visit-parents';
import { getJSXImport, isCode, isImport } from '../util/mdx-utils';

const CJS_PREAMBLE = '// CommonJS\n';
const MJS_PREAMBLE = '// ESM\n';
const OPT_OUT_META = 'no-combine';

export default function attacher() {
  return transformer;
}

function matchCjsCodeBlock(node: Node): node is Code {
  return isCode(node) && node.lang === 'cjs';
}

function matchMjsCodeBlock(node: Node): node is Code {
  return isCode(node) && node.lang === 'mjs';
}

async function transformer(tree: Parent) {
  let needImport = false;
  visitParents(tree, matchCjsCodeBlock, maybeGenerateJsCodeBlock);
  visitParents(tree, 'mdxjsEsm', checkForJsCodeBlockImport);

  if (needImport) {
    tree.children.unshift(getJSXImport('JsCodeBlock'));
  }

  function checkForJsCodeBlockImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/JsCodeBlock')
    ) {
      needImport = false;
    }
  }

  function maybeGenerateJsCodeBlock(
    node: Code,
    ancestors: Parent[],
  ): ActionTuple | void {
    const parent = ancestors[0];
    const idx = parent.children.indexOf(node);

    const cjsCodeBlock = node;
    const mjsCodeBlock = parent.children[idx + 1];

    // Check if the immediate sibling is the mjs code block
    if (!matchMjsCodeBlock(mjsCodeBlock)) {
      return;
    }

    // Let blocks explicitly opt-out of being combined
    if (
      cjsCodeBlock.meta?.split(' ').includes(OPT_OUT_META) ||
      mjsCodeBlock.meta?.split(' ').includes(OPT_OUT_META)
    ) {
      return;
    }

    let cjs = cjsCodeBlock.value;
    if (cjs.startsWith(CJS_PREAMBLE)) {
      cjs = cjs.slice(CJS_PREAMBLE.length);
    }

    let mjs = mjsCodeBlock.value;
    if (mjs.startsWith(MJS_PREAMBLE)) {
      mjs = mjs.slice(MJS_PREAMBLE.length);
    }

    const tabbedCodeBlock = {
      type: 'mdxJsxFlowElement',
      name: 'JsCodeBlock',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'cjs',
          value: `${cjs}`,
        },
        {
          type: 'mdxJsxAttribute',
          name: 'mjs',
          value: `${mjs}`,
        },
      ],
      children: [],
      data: {
        _mdxExplicitJsx: true,
      },
    };

    parent.children.splice(idx, 2, tabbedCodeBlock);
    needImport = true;

    // Return an ActionTuple [Action, Index], where
    // Action SKIP means we want to skip visiting these new children
    // Index is the index of the AST we want to continue parsing at.
    return [SKIP, idx + 1];
  }
}

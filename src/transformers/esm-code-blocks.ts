import { Node, Parent } from 'unist';
import { Code } from 'mdast';

import visitParents, { ActionTuple } from 'unist-util-visit-parents';

import { Import } from '../util/interfaces';

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

const importNode: Import = {
  type: 'import',
  value: "import ESMCodeBlock from '@site/src/components/ESMCodeBlock';",
};

async function transformer(tree: Parent) {
  let documentHasExistingImport = false;
  visitParents(tree, 'import', checkForESMCodeBlockImport);
  visitParents(tree, matchCjsCodeBlock, maybeGenerateESMCodeBlock);

  if (!documentHasExistingImport) {
    tree.children.unshift(importNode);
  }

  function checkForESMCodeBlockImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/ESMCodeBlock')
    ) {
      documentHasExistingImport = true;
    }
  }

  function maybeGenerateESMCodeBlock(
    node: Code,
    ancestors: Parent[]
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

    // Replace the two code blocks with the ESMCodeBlock
    parent.children.splice(idx, 2, {
      type: 'jsx',
      value: `<ESMCodeBlock
        cjs={${JSON.stringify(cjs)}}
        mjs={${JSON.stringify(mjs)}}
      />`,
    } as Node);

    // Return an ActionTuple [Action, Index], where
    // Action SKIP means we want to skip visiting these new children
    // Index is the index of the AST we want to continue parsing at.
    return [visitParents.SKIP, idx + 1];
  }
}

function isImport(node: Node): node is Import {
  return node.type === 'import';
}

function isCode(node: Node): node is Code {
  return node.type === 'code';
}

import { Code, Node } from 'mdast';
import { getJSXImport, isCode, isImport } from '../util/mdx-utils';
import { ActionTuple, SKIP, visitParents } from 'unist-util-visit-parents';
import { Parent } from 'unist';
import { parse as parseYaml } from 'yaml';

export type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string; 'breaking-changes-header': string }[];
  changes?: { 'pr-url': string; description: string }[];
};

export default function attacher() {
  return transformer;
}

function matchApiHistoryCodeBlock(node: Node): node is Code {
  return isCode(node) && node.lang === 'YAML' && node.meta === 'history';
}

// Most of this is copy-pasted from: <https://github.com/electron/website/blob/ac3bab3131fc0f5de563574189ad5eab956a60b9/src/transformers/js-code-blocks.ts>
async function transformer(tree: Parent) {
  let needImport = false;
  visitParents(tree, matchApiHistoryCodeBlock, maybeGenerateApiHistoryTable);
  visitParents(tree, 'mdxjsEsm', checkForApiHistoryTableImport);

  if (needImport) {
    tree.children.unshift(getJSXImport('ApiHistoryTable'));
  }

  function checkForApiHistoryTableImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/ApiHistoryTable')
    ) {
      needImport = false;
    }
  }

  function maybeGenerateApiHistoryTable(
    node: Code,
    ancestors: Parent[]
  ): ActionTuple | void {
    const parent = ancestors[0];
    const idx = parent.children.indexOf(node);

    const apiHistory = parseYaml(node.value) as ApiHistory;
    const apiHistoryJson = JSON.stringify(apiHistory);

    const apiHistoryTable = {
      type: 'mdxJsxFlowElement',
      name: 'ApiHistoryTable',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'apiHistoryJson',
          value: apiHistoryJson,
        },
      ],
      children: [],
      data: {
        _mdxExplicitJsx: true,
      },
    };

    parent.children[idx] = apiHistoryTable;
    needImport = true;

    // Return an ActionTuple [Action, Index], where
    // Action SKIP means we want to skip visiting these new children
    // Index is the index of the AST we want to continue parsing at.
    // TODO: Check if this line needs to be changed for this use case
    return [SKIP, idx + 1];
  }
}

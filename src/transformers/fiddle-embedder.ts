import fs from 'node:fs';
import path from 'node:path';

import { Node, Parent } from 'unist';
import { Code } from 'mdast';
import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { visitParents, ActionTuple, SKIP } from 'unist-util-visit-parents';
import latestVersion from 'latest-version';
import { getJSXImport, isCode, isImport } from '../util/mdx-utils';

let _version = '';
async function getVersion() {
  if (_version === '') {
    _version = await latestVersion('electron');
  }

  return _version;
}

export default function attacher() {
  return transformer;
}

interface FiddleEmbedOptions {
  focus: string;
}

/**
 * Tests for AST nodes that match for
 * ````
 * ```fiddle path/to/fiddle
 *
 *
 * ```
 * ````
 */
function matchFiddleBlock(node: Node): node is Code {
  return (
    isCode(node) && node.lang === 'fiddle' && typeof node.meta === 'string'
  );
}

const importNode = getJSXImport('FiddleEmbed');

async function transformer(tree: Parent) {
  let needImport = false;
  const version = await getVersion();
  visitParents(tree, matchFiddleBlock, generateFiddleEmbed);
  visitParents(tree, 'mdxjsEsm', checkForFiddleEmbedImport);

  if (needImport) {
    tree.children.unshift(importNode);
  }

  function checkForFiddleEmbedImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/FiddleEmbed')
    ) {
      needImport = false;
    }
  }

  function generateFiddleEmbed(
    node: Code,
    ancestors: Parent[]
  ): ActionTuple | void {
    const parent = ancestors[0];
    // Supported formats are fiddle='<folder>|<option>|option'
    // Options must be of the format key=value with no additional quotes.
    const [folder, ...others] = node.meta.split('|');
    const options = parseFiddleEmbedOptions(others);

    // Find where the Fiddle code block is relative to the parent,
    // and splice the children array to insert the embedded Fiddle
    const index = parent.children.indexOf(node);
    const newChildren = createFiddleAST(folder, version, options);
    parent.children.splice(index, 1, ...newChildren);
    // Return an ActionTuple [Action, Index], where
    // Action SKIP means we want to skip visiting these new children
    // Index is the index of the AST we want to continue parsing at.
    return [SKIP, index + newChildren.length];
  }

  function parseFiddleEmbedOptions(
    optStrings: string[]
  ): Partial<FiddleEmbedOptions> {
    // If there are optional parameters, parse them out to pass to the getFiddleAST method.
    return optStrings.reduce((opts, option) => {
      // Use indexOf to support bizarre combinations like `|key=Myvalue=2` (which will properly
      // parse to {'key': 'Myvalue=2'})
      const firstEqual = option.indexOf('=');
      const key = option.slice(0, firstEqual);
      const value = option.slice(firstEqual + 1);
      return { ...opts, [key]: value };
    }, {});
  }

  /**
   * From a directory in `/docs/fiddles/`, generate the AST needed
   * for the tabbed code MDX structure.
   */
  function createFiddleAST(
    dir: string,
    version: string,
    { focus = 'main.js' }: Partial<FiddleEmbedOptions>
  ) {
    const files = {};
    const children = [];

    const fileNames = fs.readdirSync(dir);
    if (fileNames.length === 0) {
      return children;
    }

    if (!fileNames.includes(focus)) {
      throw new Error(
        `Provided focus (${focus}) is not an available file in this fiddle (${dir}). Available files are [${fileNames.join(
          ', '
        )}]`
      );
    }

    for (const file of fileNames) {
      files[file] = fs.readFileSync(path.join(dir, file)).toString();
    }

    const fiddleBlock: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'FiddleEmbed',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'files',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: JSON.stringify(files),
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'ObjectExpression',
                      properties: fileNames.map((file) => ({
                        type: 'Property',
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                          type: 'Identifier',
                          name: JSON.stringify(file), // extra JSON.stringify to escape key names
                        },
                        value: {
                          type: 'Literal',
                          value: files[file],
                          raw: JSON.stringify(files[file]), // extra JSON.stringify to escape file contents
                        },
                        kind: 'init',
                      })),
                    },
                  },
                ],
                sourceType: 'module',
                comments: [],
              },
            },
          },
        },
        {
          type: 'mdxJsxAttribute',
          name: 'dir',
          value: `${dir}`,
        },
        {
          type: 'mdxJsxAttribute',
          name: 'version',
          value: `${version}`,
        },
        {
          type: 'mdxJsxAttribute',
          name: 'focus',
          value: `${focus}`,
        },
      ],
      children: [],
      data: {
        _mdxExplicitJsx: true,
      },
    };

    children.push(fiddleBlock);
    needImport = true;

    return children;
  }
}

import { Node, Parent } from 'unist';
import { Code } from 'mdast';

import visitParents, { ActionTuple } from 'unist-util-visit-parents';
import path from 'path';
import fs from 'fs-extra';
import latestVersion from 'latest-version';

let _version = '';
async function getVersion() {
  if (_version === '') {
    _version = await latestVersion('electron');
  }

  return _version;
}

export default function attacher() {
  return transformer;
};

interface FiddleEmbedOptions {
  focus: string;
}

/**
 * This is the output from remark-mdx
 * but that library isn't typed so we make do.
 */
interface Import extends Node {
  value: string;
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

const importNode = {
  type: 'import',
  value: "import FiddleEmbed from '@site/src/components/FiddleEmbed';",
};

async function transformer(tree: Parent) {
  let documentHasExistingImport = false;
  const version = await getVersion();
  visitParents(tree, 'import', checkForFiddleEmbedImport);
  visitParents(tree, matchFiddleBlock, generateFiddleEmbed);

  if (!documentHasExistingImport) {
    tree.children.unshift(importNode);
  }

  function checkForFiddleEmbedImport(node: Node) {
    if (
      isImport(node) &&
      node.value.includes('@site/src/components/FiddleEmbed')
    ) {
      documentHasExistingImport = true;
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
    return [visitParents.SKIP, index + newChildren.length];
  }
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

  children.push({
    type: 'jsx',
    value: `<FiddleEmbed files={${JSON.stringify(
      files
    )}} dir="${dir}" version="${version}" focus="${focus}" />`,
  });

  return children;
}

function isImport(node: Node): node is Import {
  return node.type === 'import';
}

function isCode(node: Node): node is Code {
  return node.type === 'code';
}

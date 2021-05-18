//@ts-check
const visitParents = require('unist-util-visit-parents');
const path = require('path');
const fs = require('fs-extra');
const latestVersion = require('latest-version');

let _version = '';
async function getVersion() {
  if (_version === '') {
    _version = await latestVersion('electron');
  }

  return _version;
}

module.exports = function attacher() {
  return transformer;
};

/**
 * Tests for AST nodes that match the following:
 *
 * \```fiddle path/to/fiddle
 *
 * \```
 * @param {import("unist").Node} node
 * @returns boolean
 */
function matchNode(node) {
  return node.type === 'code' && node.lang === 'fiddle' && !!node.meta;
}

const importNode = {
  type: 'import',
  value:
    "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n import LaunchButton from '@site/src/components/LaunchButton';",
};

/**
 *
 * @param {import("unist").Parent} tree
 */
async function transformer(tree) {
  const version = await getVersion();
  visitParents(tree, matchNode, visitor);
  tree.children.unshift(importNode);

  /**
   *
   * @param {*} node
   * @param {*} ancestors
   * @returns { import("unist-util-visit-parents").ActionTuple }
   */
  function visitor(node, ancestors) {
    const parent = ancestors[0];
    const folder = node.meta;

    // Find where the Fiddle code block is relative to the parent,
    // and splice the children array to insert the embedded Fiddle
    const index = parent.children.indexOf(node);
    const newChildren = getFiddleAST(folder, version);
    parent.children.splice(index, 1, ...newChildren);

    // Return an ActionTuple [Action, Index], where
    // Action SKIP means we want to skip visiting these new children
    // Index is the index of the AST we want to continue parsing at.
    return [visitParents.SKIP, index + newChildren.length];
  }
}
/**
 * From a directory in `/docs/fiddles/`, generate the AST needed
 * for the tabbed code MDX structure.
 * @param {string} dir
 * @param {string} version
 */
function getFiddleAST(dir, version) {
  const files = {};
  const children = [];

  // TODO: non-alphabetic sort
  const fileNames = fs.readdirSync(dir);

  if (fileNames.length === 0) {
    return children;
  }

  for (const file of fileNames) {
    files[file] = fs.readFileSync(path.join(dir, file)).toString();
  }

  const tabValues = fileNames.reduce((acc, val) => {
    return (acc += `{ label: '${val}', value: '${val}', },`);
  }, '');

  let index = 0;

  // Generate MDXAST structure by iterating through all files in
  // the folder and creating <TabItem> components and code blocks
  // for each, and bookending those with the <Tabs> component.

  // The finished product should look something like:
  // <Tabs defaultValue="id1"
  //   values={[
  //     {label: 'id1', value: 'id1'},
  //     {label: 'id2', value: 'id2'}
  //   ]}>
  //   <TabItem value="id1">
  //     ```js
  //     const cow = 'say';
  //     ```
  //   <TabItem>
  //   <TabItem value="id2">
  //     ```js
  //     const hello = 'world';
  //     ```
  //   <TabItem>
  // <Tabs>
  children.push({
    type: 'jsx',
    value:
      `<Tabs defaultValue="main.js" ` +
      `values={[${tabValues}]}>
        <TabItem value="${fileNames[index]}">`,
  });

  while (index < fileNames.length) {
    children.push({
      type: 'code',
      lang: path.extname(fileNames[index]).slice(1),
      value: files[fileNames[index]],
    });

    index++;

    if (index < fileNames.length) {
      children.push({
        type: 'jsx',
        value: `</TabItem>\n<TabItem value="${fileNames[index]}">`,
      });
    } else {
      children.push(
        {
          type: 'jsx',
          value: `</TabItem>\n</Tabs>`,
        },
        {
          type: 'jsx',
          value: `<LaunchButton url="https://fiddle.electronjs.org/launch?target=electron/v${version}/${dir}"/>`,
        }
      );
    }
  }

  return children;
}

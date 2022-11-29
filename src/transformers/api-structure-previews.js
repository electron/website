const visitParents = require('unist-util-visit-parents');
const fs = require('fs');
const path = require('path');

module.exports = function attacher() {
  return transformer;
};

let structureDefinitions;
let hasStructures;

/**
 *
 * @param {import("unist").Parent} tree
 */
async function transformer(tree) {
  structureDefinitions = new Map();
  hasStructures = false;
  visitParents(tree, checkLinksandDefinitions, replaceLinkWithPreview);
  visitParents(tree, isStructureLinkReference, replaceLinkWithPreview);
  if (hasStructures) {
    tree.children.unshift({
      type: 'import',
      value:
        "import APIStructurePreview from '@site/src/components/APIStructurePreview';",
    });
  }
}

/**
 * This function is the test function for the first pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 *
 * As a side effect, this function also puts all reference-style links (definitions)
 * for API structures into a Map, which will be used on the second pass.
 * @param {import("unist").Node} node
 * @returns
 */
function checkLinksandDefinitions(node, _index, _parent) {
  if (
    node?.type === 'definition' &&
    typeof node.url === 'string' &&
    node.url.includes('/api/structures/')
  ) {
    structureDefinitions.set(node.identifier, node.url);
  }
  return node.type === 'link' && node?.url.includes('/api/structures/');
}

/**
 * This function is the test function from the second pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 *
 * @param {import("unist").Node} node
 * @returns
 */
function isStructureLinkReference(node, _index, _parent) {
  return (
    node.type === 'linkReference' && structureDefinitions.has(node?.identifier)
  );
}

/**
 *
 * @param {import("unist").Node} node
 */
function replaceLinkWithPreview(node, _ancestors) {
  // depending on if the node is a direct link or a reference-style link,
  // we get its URL differently.
  const previewPath =
    node.type === 'link' ? node.url : structureDefinitions.get(node.identifier);
  let previewFile;

  // links in translated locale [xy] have their paths prefixed with /xy/
  const isTranslatedDoc = !previewPath.startsWith('/docs/');
  // these need to be handled differently because their filesystem path is more complex
  // /de/docs/latest/api/structures/object.md is actually served from
  // /i18n/de/docusaurus-plugin-content-docs/current/latest/api/structures/object.md
  if (isTranslatedDoc) {
    const [_fullPath, locale, docPath] = previewPath.match(
      /\/([a-z][a-z])\/docs(.*)/
    );
    const localePath = path.join(
      __dirname,
      '..',
      '..',
      'i18n',
      locale,
      'docusaurus-plugin-content-docs',
      'current',
      `${docPath}.md`
    );
    previewFile = fs.readFileSync(localePath);
  } else {
    // for the default locale, we can use the markdown path directly
    previewFile = fs.readFileSync(
      path.join(__dirname, '..', '..', `${previewPath}.md`)
    );
  }
  // hack to remove frontmatter from docs.
  const str = previewFile
    .toString()
    .replace(/---\n(?:(?:.|\n)*)\n---/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // replace the raw link file with our JSX component.
  // See src/components/APIStructurePreview.jsx for implementation.
  if (Array.isArray(node.children) && node.children.length > 0) {
    hasStructures = true;
    node.type = 'jsx';
    node.value = `<APIStructurePreview url="${previewPath}" title="${node.children[0].value}" content="${str}"/>`;
  }
}

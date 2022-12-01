import visitParents from 'unist-util-visit-parents';
import fs from 'fs';
import path from 'path';
import { Data, Node, Parent } from 'unist';
import { Definition, Link, LinkReference } from 'mdast';

let structureDefinitions: Map<string, string>;
let hasStructures: boolean;

export default function attacher() {
  return transformer;
};

async function transformer(tree: Parent) {
  structureDefinitions = new Map();
  hasStructures = false;
  visitParents(tree, checkLinksandDefinitions, replaceLinkWithPreview);
  visitParents(tree, isStructureLinkReference, replaceLinkWithPreview);
  if (hasStructures) {
    tree.children.unshift({
      type: 'import',
      value:
        "import APIStructurePreview from '@site/src/components/APIStructurePreview';",
    } as any);
  }
}

/**
 * This function is the test function for the first pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 *
 * As a side effect, this function also puts all reference-style links (definitions)
 * for API structures into a Map, which will be used on the second pass.
 */
const checkLinksandDefinitions = (
  node: Node<Data>,
  _index: number,
  _parent: Parent
): node is Link => {
  if (isDefinition(node) && node.url.includes('/api/structures/')) {
    structureDefinitions.set(node.identifier, node.url);
  }
  return isLink(node) && node.url.includes('/api/structures/');
};

/**
 * This function is the test function from the second pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 */
function isStructureLinkReference(
  node: Node,
  _index: number,
  _parent: Parent
): node is LinkReference {
  return isLinkReference(node) && structureDefinitions.has(node.identifier);
}

function replaceLinkWithPreview(node: Link | LinkReference) {
  // depending on if the node is a direct link or a reference-style link,
  // we get its URL differently.
  let relativeStructurePath: string;
  if (isLink(node)) {
    relativeStructurePath = node.url;
  } else if (isLinkReference(node)) {
    relativeStructurePath = structureDefinitions.get(node.identifier);
  }

  let absoluteStructurePath: string;

  // links in translated locale [xy] have their paths prefixed with /xy/
  const isTranslatedDoc = !relativeStructurePath.startsWith('/docs/');
  // these need to be handled differently because their filesystem path is more complex
  // /de/docs/latest/api/structures/object.md is actually served from
  // /i18n/de/docusaurus-plugin-content-docs/current/latest/api/structures/object.md
  if (isTranslatedDoc) {
    const [_fullPath, locale, docPath] = relativeStructurePath.match(
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
    absoluteStructurePath = localePath;
  } else {
    // for the default locale, we can use the markdown path directly
    absoluteStructurePath = path.join(
      __dirname,
      '..',
      '..',
      `${relativeStructurePath}.md`
    );
  }

  // hack to remove frontmatter from docs.
  const str = fs
    .readFileSync(absoluteStructurePath, { encoding: 'utf-8' })
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
    // @ts-ignore: We're mutating the object so we ignore types here
    node.type = 'jsx';
    // @ts-ignore: We're mutating the object so we ignore types here
    node.value = `<APIStructurePreview url="${relativeStructurePath}" title="${node.children[0].value}" content="${str}"/>`;
  }
}

function isDefinition(node: Node): node is Definition {
  return node.type === 'definition';
}

function isLink(node: Node): node is Link {
  return node.type === 'link';
}

function isLinkReference(node: Node): node is LinkReference {
  return node.type === 'linkReference';
}

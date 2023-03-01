import visitParents from 'unist-util-visit-parents';
import fs from 'fs';
import path from 'path';
import { Data, Node, Parent } from 'unist';
import { Definition, InlineCode, Link, LinkReference, Text } from 'mdast';

import remark from 'remark';

export default function attacher() {
  return transformer;
}

async function transformer(tree: Parent, file) {
  visitParents(tree, checkLinksandDefinitionsInline, replaceLinkWithInline);
}

const checkLinksandDefinitionsInline = (node: Node<Data>): node is Link => {
  return (
    isLink(node) &&
    node.url.includes('/api/structures/') &&
    new URL(node.url, 'http://localhost:8080').hash === '#inline'
  );
};

function replaceLinkWithInline(node: Link) {
  const relativeStructurePath = node.url;

  // 1. grab the contents from the node link, put into string variable
  const noHash = relativeStructurePath.split('#')[0];
  const str = getStructureFileContent(noHash);
  console.log(str);
  const rootNode = remark().parse(str) as Parent;
  // /* eslint-disable @typescript-eslint/no-explicit-any */
  (node as any).type = 'paragraph';
  (node as any).children = rootNode.children.slice(1);
  // // 2. parse string as markdown content???
  // // 3. add as child to existing node
}

function isLink(node: Node): node is Link {
  return node.type === 'link';
}

function getStructureFileContent(relativeStructurePath: string) {
  const absoluteStructurePath = path.join(
    __dirname,
    '..',
    '..',
    `${relativeStructurePath}.md`
  );

  // hack to remove frontmatter from docs.
  return fs
    .readFileSync(absoluteStructurePath, { encoding: 'utf-8' })
    .replace(/---\n(?:(?:.|\n)*)\n---/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\(latest\//g, '(/docs/latest/')
    .replace(/\.md\)/g, ')');
}

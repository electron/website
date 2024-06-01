import { Parent } from 'unist';
import { visitParents } from 'unist-util-visit-parents';
import { Emphasis } from 'mdast';

export default function attacher() {
  return transformer;
}

function transformer(tree: Parent) {
  const yamlHistoryCodeBlock = tree.children.find(
    ({ type, lang, meta }) =>
      type === 'code' && lang === 'YAML' && meta === 'history'
  );

  if (!yamlHistoryCodeBlock) return;

  console.log(yamlHistoryCodeBlock);
}

function visitor(node: Emphasis) {
  console.log(node);
}

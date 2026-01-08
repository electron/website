import path from 'node:path';

import { visitParents } from 'unist-util-visit-parents';
import { Node, Parent } from 'unist';
import type { Definition, Link } from 'mdast';
import type { VFile } from 'vfile';
import { latestElectronVersion } from '../util/latest-electron-version';
import { isDefinition, isLink } from '../util/mdx-utils';

const DOCS_FOLDER = path.join(__dirname, '..', '..', 'docs', 'latest');
const RELATIVE_LINK_REGEX = /^(?:\.\.?\/)+(\S+)$/;

let _version = '';
async function getVersion() {
  if (_version === '') {
    _version = await latestElectronVersion();
  }

  return _version;
}

/**
 * `attacher` runs once for the entire plugin's lifetime.
 */
export default function attacher() {
  return transformer;
}

/**
 * The `transformer` function scope is instantiated once per file
 * processed by this MDX plugin.
 */
async function transformer(tree: Parent, vfile: VFile) {
  const version = await getVersion();

  const findRelativeLinksOutsideDocs = (node: Node) => {
    if (
      (isLink(node) || isDefinition(node)) &&
      (node.url.startsWith('./') || node.url.startsWith('../'))
    ) {
      // Check if the path resolves outside to be outside of the doc folder
      const relativePath = path.relative(DOCS_FOLDER, vfile.dirname);
      const resolvedPath = path.join(relativePath, node.url);

      return resolvedPath.startsWith('../');
    }

    return false;
  };

  const nodes: Set<Definition | Link> = new Set();

  visitParents(
    tree,
    findRelativeLinksOutsideDocs,
    (node: Definition | Link) => {
      nodes.add(node);
    },
  );

  for (const node of nodes) {
    // Strip off the leading relative path segments
    node.url = `https://github.com/electron/electron/blob/v${version}/${node.url.match(RELATIVE_LINK_REGEX)[1]}`;
  }
}

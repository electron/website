import path from 'node:path';

import { visitParents } from 'unist-util-visit-parents';
import type { Node, Parent } from 'unist';
import type { Definition, Link } from 'mdast';
import type { VFile } from 'vfile';
import {
  isReleaseVersion,
  parseDocsVersionPath,
  sourceRefForVersion,
} from '../util/docs-version.ts';
import { latestElectronVersion } from '../util/latest-electron-version.ts';
import { isDefinition, isLink } from '../util/mdx-utils.ts';

const SITE_DIR = path.join(__dirname, '..', '..');
const RELATIVE_LINK_REGEX = /^(?:\.\.?\/)+(\S+)$/;

/**
 * The git ref of `electron/electron` that links escaping the docs folder
 * should point at: the release tag for `vX.Y.Z` docs, `main` for `next`
 * and the latest stable tag for `latest`.
 */
async function sourceRef(version: string): Promise<string> {
  const latest = isReleaseVersion(version) ? '' : await latestElectronVersion();
  return sourceRefForVersion(version, latest);
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
  // `docs/<version>/...` (or its i18n mirror) tells us which docs version
  // this file belongs to, and thus which folder counts as "the docs".
  const version = parseDocsVersionPath(vfile.path)?.version ?? 'latest';
  const docsFolder = path.join(SITE_DIR, 'docs', version);
  const ref = await sourceRef(version);

  const findRelativeLinksOutsideDocs = (node: Node) => {
    if (
      (isLink(node) || isDefinition(node)) &&
      (node.url.startsWith('./') || node.url.startsWith('../'))
    ) {
      // Check if the path resolves outside to be outside of the doc folder
      const relativePath = path.relative(docsFolder, vfile.dirname);
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
    node.url = `https://github.com/electron/electron/blob/${ref}/${node.url.match(RELATIVE_LINK_REGEX)[1]}`;
  }
}

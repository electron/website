/**
 * Injects a `<CopyPageButton rawMarkdown="..." />` MDX node at the top of every
 * doc page so visitors can copy the raw markdown source to their clipboard
 * (mirroring the "Copy Page" pattern from shadcn/ui's docs).
 *
 * The raw markdown is read straight from `vfile.value`, which holds the
 * unmodified source string for the file currently being compiled. The button
 * then renders inside the article body via the same MDX-injection pattern used
 * by `api-history.ts` for `<ApiHistoryTable />`.
 */

import type { Parent } from 'unist';
import type { VFile } from 'vfile';

import { getJSXImport, isImport } from '../util/mdx-utils';

const COMPONENT_NAME = 'CopyPageButton';

export default function attacher() {
  return transformer;
}

function transformer(tree: Parent, vfile: VFile) {
  const rawMarkdown =
    typeof vfile.value === 'string'
      ? vfile.value
      : Buffer.isBuffer(vfile.value)
        ? vfile.value.toString('utf-8')
        : '';

  if (!rawMarkdown) {
    return;
  }

  const buttonNode = {
    type: 'mdxJsxFlowElement',
    name: COMPONENT_NAME,
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'rawMarkdown',
        value: rawMarkdown,
      },
    ],
    children: [],
    data: {
      _mdxExplicitJsx: true,
    },
  };

  // Insert the button as the first body node so it renders just below the
  // page title (Docusaurus renders the frontmatter title above the MDX body).
  tree.children.unshift(buttonNode as unknown as Parent['children'][number]);

  // Only add the import if no existing one references the component (e.g.
  // a doc author manually imported it).
  const alreadyImported = tree.children.some(
    (child) =>
      isImport(child) &&
      child.value.includes(`@site/src/components/${COMPONENT_NAME}`),
  );

  if (!alreadyImported) {
    tree.children.unshift(getJSXImport(COMPONENT_NAME));
  }
}

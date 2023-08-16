import logger from '@docusaurus/logger';
import visitParents from 'unist-util-visit-parents';
import fs from 'fs';
import path from 'path';
import { Data, Literal, Node, Parent } from 'unist';
import { Definition, InlineCode, Link, LinkReference, Text } from 'mdast';
import table from 'mdast-util-gfm-table';
import toMarkdown from 'mdast-util-to-markdown';
import type { VFile } from 'vfile';

import { Import } from '../util/interfaces';

const fileContent = new Map<
  string,
  { promise: Promise<string>; resolve?: (value: string) => void }
>();
const structureDefinitions = new Map<string, string>();
const modifiers = new Set<Promise<void>>();

const EXCLUDE_LIST = ['browser-window-options', 'web-preferences'];

export default function attacher() {
  return transformer;
}

async function transformer(tree: Parent, file: VFile) {
  // While transforming API structures, put the unmodified content
  // (we don't want previews on previews or deadlocks) into a map
  // so that when other docs are processed they can grab the content
  // which Docusaurus has already processed (important for links).
  // Since we don't want to depend on the order in which docs are
  // transformed, if other docs are waiting on the content of an
  // API structure there will be a promise resolver in the map and
  // the other docs will be awaiting the associated promise.
  if (file.path.includes('/api/structures/')) {
    let exportsNode: Node | undefined;
    let relativePath = `/${path.relative(file.cwd, file.path)}`;

    const isTranslatedDoc = relativePath.startsWith('/i18n/');
    // these need to be handled differently because their filesystem path is more complex
    // /de/docs/latest/api/structures/object.md is actually served from
    // /i18n/de/docusaurus-plugin-content-docs/current/latest/api/structures/object.md
    if (isTranslatedDoc) {
      const [_fullPath, locale, docPath] = relativePath.match(
        /\/i18n\/([a-z][a-z])\/docusaurus-plugin-content-docs\/current\/(.*)/
      );
      relativePath = `/${locale}/docs/${docPath}`;
    }

    // Temporarily remove this node, toMarkdown chokes on it
    if (tree.children[0].type === 'export') {
      exportsNode = tree.children.shift();
    }

    // It's not ideal to go from the parsed Markdown back to text
    // just to be parsed again to be rendered, but it is what it is
    const content = toMarkdown(tree, { extensions: [table.toMarkdown()] });

    // Put the node back, because we need it
    if (exportsNode) {
      tree.children.unshift(exportsNode);
    }

    if (fileContent.has(relativePath)) {
      const { resolve } = fileContent.get(relativePath);
      if (resolve) resolve(content);
    } else {
      fileContent.set(relativePath, { promise: Promise.resolve(content) });
    }
  }
  structureDefinitions.clear();
  modifiers.clear();
  visitParents(tree, checkLinksandDefinitions, replaceLinkWithPreview);
  visitParents(tree, isStructureLinkReference, replaceLinkWithPreview);
  if (modifiers.size) {
    tree.children.unshift({
      type: 'import',
      value:
        "import APIStructurePreview from '@site/src/components/APIStructurePreview';",
    } as Import);
    await Promise.all(Array.from(modifiers));
  }
}

/**
 * This function is the test function for the first pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 *
 * As a side effect, this function also puts all reference-style links (definitions)
 * for API structures into a Map, which will be used on the second pass.
 */
const checkLinksandDefinitions = (node: Node<Data>): node is Link => {
  if (isDefinition(node) && node.url.includes('/api/structures/')) {
    structureDefinitions.set(node.identifier, node.url);
  }
  if (isLink(node) && node.url.includes('/api/structures/')) {
    return EXCLUDE_LIST.every(
      (excludedFile) => !node.url.endsWith(`/api/structures/${excludedFile}`)
    );
  }

  return false;
};

/**
 * This function is the test function from the second pass of the tree visitor.
 * Any values returning 'true' will run replaceLinkWithPreview().
 */
function isStructureLinkReference(node: Node): node is LinkReference {
  return isLinkReference(node) && structureDefinitions.has(node.identifier);
}

function replaceLinkWithPreview(node: Link | LinkReference) {
  // depending on if the node is a direct link or a reference-style link,
  // we get its URL differently.
  let relativeStructureUrl: string;
  if (isLink(node)) {
    relativeStructureUrl = node.url;
  } else if (isLinkReference(node)) {
    relativeStructureUrl = structureDefinitions.get(node.identifier);
  } else {
    return;
  }

  const relativeStructurePath = `${relativeStructureUrl}.md`;

  // No file content promise available, so add one and then wait
  // on it being resolved when the structure doc is processed
  if (!fileContent.has(relativeStructurePath)) {
    let resolve: (value: string) => void;
    let reject: (err: Error) => void;

    // Set a timeout as a backstop so we don't deadlock forever if something
    // causes content to never be resolved - in theory an upstream change in
    // Docusaurus could cause that if they limited how many files are being
    // processed in parallel such that too many docs are awaiting others
    const timeoutId = setTimeout(() => {
      // links in translated locale [xy] have their paths prefixed with /xy/
      const isTranslatedDoc = !relativeStructurePath.startsWith('/docs/');

      if (isTranslatedDoc) {
        // If we're running locally we might not have translations downloaded
        // so if we don't find it locally just supply the default locale
        const [_fullPath, locale, docPath] = relativeStructurePath.match(
          /\/([a-z][a-z])\/docs\/(.*)/
        );
        const defaultLocalePath = `/docs/${docPath}`;
        const localeDir = path.join(__dirname, '..', '..', 'i18n', locale);

        if (!fs.existsSync(localeDir)) {
          if (fileContent.has(defaultLocalePath)) {
            const { promise } = fileContent.get(defaultLocalePath);
            promise.then((content) => resolve(content));
            return;
          }
        }
      }

      reject(
        new Error(
          `Timed out waiting for API structure content from ${relativeStructurePath}`
        )
      );
    }, 60000);

    const promise = new Promise<string>((resolve_, reject_) => {
      resolve = (value: string) => {
        clearTimeout(timeoutId);
        resolve_(value);
      };
      reject = reject_;
    });

    fileContent.set(relativeStructurePath, { promise, resolve });
  }

  const { promise } = fileContent.get(relativeStructurePath);

  // replace the raw link file with our JSX component.
  // See src/components/APIStructurePreview.jsx for implementation.
  if (
    Array.isArray(node.children) &&
    node.children.length > 0 &&
    isTextOrInlineCode(node.children[0])
  ) {
    modifiers.add(
      promise
        .then((content) => {
          const previewNode = node as unknown as Literal<string>;
          previewNode.type = 'jsx';
          previewNode.value = `<APIStructurePreview url="${relativeStructureUrl}" title="${
            (node.children[0] as Text | InlineCode).value
          }" content="${encodeURIComponent(content)}"/>`;
        })
        .catch((err) => {
          logger.error(err);
          // NOTE - if build starts failing, comment the throw out
          throw err;
        })
    );
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

function isTextOrInlineCode(node: Node): node is Text | InlineCode {
  return node.type === 'text' || node.type === 'inlineCode';
}

import fs from 'node:fs';
import path from 'node:path';

import logger from '@docusaurus/logger';
import { h } from 'hastscript';
import { visitParents } from 'unist-util-visit-parents';
import { filter } from 'unist-util-filter';
import { Node, Parent } from 'unist';
import type { Heading, Link, LinkReference, Root } from 'mdast';
import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { VFile } from 'vfile';
import {
  getJSXImport,
  isDefinition,
  isLink,
  isLinkReference,
} from '../util/mdx-utils';
import { toHast } from 'mdast-util-to-hast';
import { defaultSchema, sanitize } from 'hast-util-sanitize';
import { toString } from 'mdast-util-to-string';

const fileContent = new Map<
  string,
  { promise: Promise<Parent>; resolve?: (value: Parent) => void }
>();

const EXCLUDE_LIST = ['browser-window-options', 'web-preferences'];

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
async function transformer(tree: Parent, file: VFile) {
  const structureDefinitions = new Map<string, string>();
  const mutationPromises = new Set<Promise<void>>();
  /**
   * This function is the test function for the first pass of the tree visitor.
   * Any values returning 'true' will run {@link replaceLinkWithPreview}.
   *
   * As a side effect, this function also puts all reference-style links (definitions)
   * for API structures into a Map, which will be used on the second pass.
   */
  const checkLinksandDefinitions = (node: Node): node is Link => {
    if (isDefinition(node) && node.url.includes('/api/structures/')) {
      structureDefinitions.set(node.identifier, node.url);
    }
    if (isLink(node) && node.url.includes('/api/structures/')) {
      return EXCLUDE_LIST.every(
        (excludedFile) => !node.url.endsWith(`/api/structures/${excludedFile}`),
      );
    }
    return false;
  };

  /**
   * This function is the test function from the second pass of the tree visitor.
   * Any values returning 'true' will run {@link replaceLinkWithPreview}.
   */
  function isStructureLinkReference(node: Node): node is LinkReference {
    return isLinkReference(node) && structureDefinitions.has(node.identifier);
  }

  function replaceLinkWithPreview(
    node: Link | LinkReference,
    parents: Parent[],
  ) {
    // depending on if the node is a direct link or a reference-style link,
    // we get its URL differently.
    let relativeStructureUrl: string;
    let isInline = false;
    if (isLink(node)) {
      relativeStructureUrl = node.url;
    } else if (isLinkReference(node)) {
      relativeStructureUrl = structureDefinitions.get(node.identifier);
    } else {
      return;
    }

    // ?inline links will be inlined instead of rendered as a hover preview
    if (relativeStructureUrl.endsWith('?inline')) {
      relativeStructureUrl = relativeStructureUrl.split('?inline')[0];
      if (isLink(node)) {
        node.url = relativeStructureUrl;
      }
      isInline = true;
    }

    const relativeStructurePath = `${relativeStructureUrl}.md`;

    // No file content promise available, so add one and then wait
    // on it being resolved when the structure doc is processed
    if (!fileContent.has(relativeStructurePath)) {
      let resolve: (value: Parent) => void;
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
            /\/([a-z][a-z])\/docs\/(.*)/,
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
            `Timed out waiting for API structure content from ${relativeStructurePath}`,
          ),
        );
      }, 60_000);

      const promise = new Promise<Parent>((resolve_, reject_) => {
        resolve = (value: Parent) => {
          clearTimeout(timeoutId);
          resolve_(value);
        };
        reject = reject_;
      });

      fileContent.set(relativeStructurePath, { promise, resolve });
    }

    const { promise: targetStructure } = fileContent.get(relativeStructurePath);

    if (toString(node).length > 0) {
      mutationPromises.add(
        targetStructure
          .then((structureContent) => {
            if (isInline) {
              // we inline the structure content as the last sibling of the current node
              const siblings = parents[parents.length - 1].children;
              const filtered = filter(
                structureContent,
                (node) => node.type !== 'heading',
              );
              siblings.push(filtered);
            } else {
              // Manually transform the MDAST into a HAST (HTML AST) to be stored and rendered in the
              // <APIStructurePreview/> component. The `handlers` option provides custom handling for
              // nodes that aren't part of the default Markdown spec.

              // In our handler, we reconstruct:
              // * Nested instances of `<APIStructurePreview/>`, which get output as <a> links.
              //   `_originalLink` data is spliced into the MDAST when `structureContent` is generated.
              // * <header> tags generated by Docusaurus, which get output as <h1> headings.
              const HAST = toHast(structureContent as Root, {
                handlers: {
                  mdxJsxFlowElement: (_, node) => {
                    if (
                      node.name === 'APIStructurePreview' &&
                      node?.data?._originalLink
                    ) {
                      const { href, text } = node.data._originalLink;
                      return h('a', { href }, [text]);
                    } else if (node.name === 'header') {
                      const text = toString(node);
                      return h('h1', [text]);
                    }
                  },
                },
              });

              // We sanitize the HAST according to best practices. The default schema for
              // sanitization follows GitHub's standards. If this ends up causing issues
              // in our rendering pipeline, there's leeway for loosening the schema because
              // we don't have user-generated content in the website (all markdown is pulled
              // from `electron/electron`.)
              const sanitized = sanitize(HAST, {
                ...defaultSchema,
                attributes: {
                  ...defaultSchema.attributes,
                  '*': [
                    ...(defaultSchema.attributes['*'] || []),
                    'className', // Allow className on all elements
                  ],
                },
              });

              // replace the Link node with an MDX element in-place
              const title = toString(node);
              const previewNode = node as unknown as MdxJsxFlowElement;
              previewNode.type = 'mdxJsxFlowElement';
              previewNode.name = 'APIStructurePreview';
              previewNode.children = [];
              previewNode.data = {
                _mdxExplicitJsx: true,
                _originalLink: {
                  href: relativeStructureUrl,
                  text: title,
                },
              };
              previewNode.attributes = [
                {
                  type: 'mdxJsxAttribute',
                  name: 'url',
                  value: `${relativeStructureUrl}`,
                },
                {
                  type: 'mdxJsxAttribute',
                  name: 'title',
                  value: title,
                },
                {
                  type: 'mdxJsxAttribute',
                  name: 'content',
                  value: JSON.stringify(sanitized),
                },
              ];
            }
          })
          .catch((err) => {
            logger.error(err);
            // NOTE - if build starts failing, comment the throw out
            throw err;
          }),
      );
    }
  }
  // The order of operations here is important. For each document,
  // we visit the entire AST first and find API structure link nodes
  // that we need to mutate. Then, we wait for all dependent structure
  // link contents to be resolved and processed before resolving the
  // current file.

  // In practice, this matters when we have a chain of inlined structures.
  // For example:
  // - BrowserWindowConstructorOptions inlines WebPreferences
  // - BrowserWindow inlines BrowserWindowConstructorOptions
  // This means that BrowserWindowConstructorOptions needs to wait for
  // WebPreferences to be processed before its own contents can be added
  // to `fileContents`. Otherwise, the BrowserWindow API docs will
  // not have WebPreferences inlined.
  visitParents(tree, checkLinksandDefinitions, replaceLinkWithPreview);
  visitParents(tree, isStructureLinkReference, replaceLinkWithPreview);
  await Promise.all(Array.from(mutationPromises));

  // After the entire tree for the current document is correctly
  // mutated, save the mutated tree into `fileContent`.
  if (file.path.includes('/api/structures/')) {
    let relativePath = `/${path.relative(file.cwd, file.path)}`;

    const isTranslatedDoc = relativePath.startsWith('/i18n/');
    // these need to be handled differently because their filesystem path is more complex
    // /de/docs/latest/api/structures/object.md is actually served from
    // /i18n/de/docusaurus-plugin-content-docs/current/latest/api/structures/object.md
    if (isTranslatedDoc) {
      const [_fullPath, locale, docPath] = relativePath.match(
        /\/i18n\/([a-z][a-z])\/docusaurus-plugin-content-docs\/current\/(.*)/,
      );
      relativePath = `/${locale}/docs/${docPath}`;
    }

    // For each structure, we want the <h1> heading (title of the structure)
    // and all content up until the next heading, which would be the base
    // info for the structure (props + comments) by our conventions.
    const filteredTree = filter(tree, (node) => node.type !== 'mdxjsEsm');
    const headingIndex = filteredTree.children.findIndex(
      (node) => node.type === 'heading' && (node as Heading).depth > 1,
    );
    if (headingIndex > 0) {
      filteredTree.children = filteredTree.children.slice(0, headingIndex);
    }

    // If `fileContent` already contains this document, it means that
    // a document has requested the contents of this file already and has
    // passed a Promise.resolve callback. This will resolve the pending
    // Promise.
    if (fileContent.has(relativePath)) {
      const { resolve } = fileContent.get(relativePath);
      if (resolve) resolve(filteredTree);
    } else {
      fileContent.set(relativePath, { promise: Promise.resolve(filteredTree) });
    }
  }

  const importNode = getJSXImport('APIStructurePreview');
  if (mutationPromises.size > 0) {
    tree.children.unshift(importNode);
  }
}

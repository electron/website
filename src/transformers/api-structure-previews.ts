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

// Queue for processing structure files
const processingQueue: string[] = [];
const processedFiles = new Set<string>();
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
 * Process a structure file and its dependencies
 */
async function processStructureFile(
  filePath: string,
  file: VFile,
): Promise<Parent | null> {
  if (processedFiles.has(filePath)) {
    return fileContent.get(filePath)?.promise || null;
  }

  // Add to processing queue
  if (!processingQueue.includes(filePath)) {
    processingQueue.push(filePath);
  }

  // Process files in queue sequentially
  while (processingQueue.length > 0) {
    const currentFile = processingQueue[0];
    if (!processedFiles.has(currentFile)) {
      try {
        const content = await processFile(currentFile, file);
        processedFiles.add(currentFile);
        if (fileContent.has(currentFile)) {
          const { resolve } = fileContent.get(currentFile)!;
          if (resolve) resolve(content);
        } else {
          fileContent.set(currentFile, { promise: Promise.resolve(content) });
        }
      } catch (error) {
        logger.error(error);
        processingQueue.shift();
        continue;
      }
    }
    processingQueue.shift();
  }

  return fileContent.get(filePath)?.promise || null;
}

/**
 * Process a single file and return its content
 */
async function processFile(filePath: string, file: VFile): Promise<Parent> {
  // Implementation of file processing logic
  // This would contain the existing logic for processing a single file
  const tree = file.data.astro as Parent;
  const filteredTree = filter(tree, (node) => node.type !== 'mdxjsEsm');
  const headingIndex = filteredTree.children.findIndex(
    (node) => node.type === 'heading' && (node as Heading).depth > 1,
  );
  if (headingIndex > 0) {
    filteredTree.children = filteredTree.children.slice(0, headingIndex);
  }
  return filteredTree;
}

/**
 * The `transformer` function scope is instantiated once per file
 * processed by this MDX plugin.
 */
  const seen = new Set<any>();
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
    let relativeStructureUrl: string;
    let isInline = false;
    if (isLink(node)) {
      relativeStructureUrl = node.url;
    } else if (isLinkReference(node)) {
      relativeStructureUrl = structureDefinitions.get(node.identifier);
    } else {
    if (!relativeStructureUrl) {
      logger.warn(`No structure URL found for node: ${toString(node)}`);
      return;
    }

      return;
    }

    if (relativeStructureUrl.endsWith('?inline')) {
      relativeStructureUrl = relativeStructureUrl.split('?inline')[0];
      if (isLink(node)) {
        node.url = relativeStructureUrl;
      }
      isInline = true;
    }

    const relativeStructurePath = `${relativeStructureUrl}.md`;

    // Process the structure file and its dependencies
    const contentPromise = processStructureFile(relativeStructurePath, file);

    if (toString(node).length > 0) {
      mutationPromises.add(
        contentPromise
          .then((structureContent) => {
            if (!structureContent) return;

            if (isInline) {
              // we inline the structure content as the last sibling of the current node
              const parent = parents[parents.length - 1];
              if (!parent || !parent.children) {
                logger.warn('Parent or parent.children is undefined');
                return;
              }
              const filtered = filter(
                structureContent,
                (node) => node.type !== 'heading',
              );
              parent.children.push(filtered);
            } else {
              try {
                // Manually transform the MDAST into a HAST (HTML AST)
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

                // Sanitize the HAST
                const sanitized = sanitize(HAST, {
                  ...defaultSchema,
                  attributes: {
                    ...defaultSchema.attributes,
                    '*': [
                      ...(defaultSchema.attributes['*'] || []),
                      'className',
                    ],
                  },
                });

                // Create a safe version of the sanitized HAST without circular references
                const safeSanitized = JSON.parse(JSON.stringify(sanitized, (key, value) => {
                  if (typeof value === 'object' && value !== null) {
                    if (seen.has(value)) {
                      return '[Circular]';
                    }
                    seen.add(value);
                  }
                  return value;
                }));

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
                    value: JSON.stringify(safeSanitized),
                  },
                ];
              } catch (error) {
                logger.error(`Error processing structure preview: ${error}`);
              }
            }
          })
          .catch((err) => {
            logger.error(`Error in replaceLinkWithPreview: ${err}`);
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

    await processStructureFile(relativePath, file);
  }

  const importNode = getJSXImport('APIStructurePreview');
  if (mutationPromises.size > 0) {
    tree.children.unshift(importNode);
  }
}

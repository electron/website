import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@docusaurus/logger';
import type {
  Definition,
  Heading,
  ImageReference,
  Link,
  LinkReference,
  Paragraph,
  Root,
  RootContent,
} from 'mdast';
import { toString } from 'mdast-util-to-string';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import type { Node } from 'unist';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';

/**
 * This transformer renders the API members that a class inherits from its
 * parent class, based on the `## Class: Child extends `Parent`` heading that
 * the Electron API docs use.
 *
 * For every such class doc, the parent doc is resolved as a sibling file
 * (`BaseWindow` -> `base-window.md`), parsed, and every member the child does
 * not already declare in the same section (Static Methods, Static Properties,
 * Instance Events, Instance Properties, Instance Methods) is copied into the
 * child's matching section with an "Inherited from" note. The whole `extends`
 * chain is walked, and the nearest ancestor wins on duplicates.
 *
 * Because members that the child already documents are never injected, the
 * transform is a no-op for docs that duplicate their parent's sections (as
 * `browser-window.md` does today), which keeps all existing anchors intact.
 *
 * This plugin must run in `beforeDefaultRemarkPlugins`, ahead of the built-in
 * Docusaurus heading/TOC plugins and of the other `api-*` transformers, so
 * that injected headings receive ids and TOC entries and injected bodies go
 * through the same admonition, label, history and link transforms.
 *
 * Search indexing note: Algolia DocSearch caps records per page. For
 * `BrowserWindow` the record count is unchanged today (it renders the same
 * members as before). Pages that gain members (`WebContentsView`, `ImageView`)
 * are small. A follow-up could exclude injected members from the crawler with
 * the `api-inherited-member` class, like `api-options-class.ts` does for
 * option lists.
 */
export default function attacher() {
  return transformer;
}

/**
 * Member sections of a class doc, in the order in which a missing section is
 * inserted into a child doc.
 */
const SECTIONS = [
  'Static Methods',
  'Static Properties',
  'Instance Events',
  'Instance Properties',
  'Instance Methods',
] as const;

type SectionName = (typeof SECTIONS)[number];

/** Class name added to the `hProperties` of every injected member heading. */
export const INHERITED_MEMBER_CLASS = 'api-inherited-member';

const CLASS_HEADING = /^Class:\s+([\w$]+)(?:\s+extends\s+([\w$]+))?\s*$/;
const EVENT_HEADING = /^Event:\s*'([^']+)'/;
const RECEIVER_MEMBER = /^([\w$]+)\.([\w$]+)/;
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

interface Member {
  key: string;
  heading: Heading;
  body: RootContent[];
}

interface ClassInfo {
  headingIndex: number;
  className: string;
  parentName?: string;
}

interface ClassDoc extends ClassInfo {
  /** e.g. `win` in `win.setBounds()`, used to rewrite instance member headings */
  receiver: string;
  sections: Map<SectionName, Member[]>;
  /** Reference-style link definitions, by identifier */
  definitions: Map<string, Definition>;
}

interface AncestorDoc extends ClassDoc {
  filePath: string;
}

/**
 * Parsed ancestor docs by absolute path (`null` when the file does not exist).
 * Lives for the whole process: with `yarn start`, edits to a parent doc show
 * up in its children only after a restart.
 */
const ancestorCache = new Map<string, AncestorDoc | null>();

function isHeading(node: Node): node is Heading {
  return node.type === 'heading';
}

function isSectionName(value: string): value is SectionName {
  return (SECTIONS as readonly string[]).includes(value);
}

function isApiDoc(filePath: string | undefined): boolean {
  return (
    typeof filePath === 'string' &&
    filePath.endsWith('.md') &&
    path.basename(path.dirname(filePath)) === 'api'
  );
}

/** `BaseWindow` -> `base-window` */
function kebabCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function findClassInfo(
  tree: Root,
  expectedClassName?: string,
): ClassInfo | undefined {
  for (const [index, node] of tree.children.entries()) {
    if (!isHeading(node) || node.depth !== 2) continue;
    const match = CLASS_HEADING.exec(toString(node).trim());
    if (!match) continue;
    const [, className, parentName] = match;
    if (expectedClassName && className !== expectedClassName) continue;
    return { headingIndex: index, className, parentName };
  }
  return undefined;
}

/** Index of the first heading of `depth` or shallower after `start`. */
function findNextHeading(tree: Root, start: number, depth: number): number {
  for (let i = start; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (isHeading(node) && node.depth <= depth) return i;
  }
  return tree.children.length;
}

/**
 * Normalizes a member heading into a key that is stable across receivers and
 * class names, so that `win.setBounds(bounds)` and `window.setBounds(bounds)`
 * or `BaseWindow.fromId(id)` and `BrowserWindow.fromId(id)` compare equal.
 */
function memberKey(section: SectionName, heading: Heading): string {
  const text = toString(heading).trim();
  if (section === 'Instance Events') {
    const match = EVENT_HEADING.exec(text);
    if (match) return `event:${match[1]}`;
  }
  const [first] = heading.children;
  if (first?.type === 'inlineCode') {
    const match = RECEIVER_MEMBER.exec(first.value);
    if (match) return match[2];
  }
  // Fallback: heading text without labels such as _Readonly_ or _macOS_
  return toString(
    heading.children.filter((child) => child.type !== 'emphasis'),
  ).trim();
}

function readClassDoc(tree: Root, info: ClassInfo): ClassDoc {
  const sections = new Map<SectionName, Member[]>();
  const definitions = new Map<string, Definition>();
  let receiver: string | undefined;

  for (const node of tree.children) {
    if (node.type === 'definition') definitions.set(node.identifier, node);
  }

  const classEnd = findNextHeading(tree, info.headingIndex + 1, 2);
  let section: SectionName | undefined;
  let member: Member | undefined;

  for (let i = info.headingIndex + 1; i < classEnd; i++) {
    const node = tree.children[i];
    if (isHeading(node) && node.depth === 3) {
      const text = toString(node).trim();
      section = isSectionName(text) ? text : undefined;
      member = undefined;
    } else if (isHeading(node) && node.depth === 4) {
      member = undefined;
      if (!section) continue;
      member = { key: memberKey(section, node), heading: node, body: [] };
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push(member);
      if (
        !receiver &&
        (section === 'Instance Methods' || section === 'Instance Properties')
      ) {
        const [first] = node.children;
        if (first?.type === 'inlineCode') {
          receiver = RECEIVER_MEMBER.exec(first.value)?.[1];
        }
      }
    } else if (member && node.type !== 'definition') {
      // Link definitions usually trail the last member; they are carried over
      // separately, only when an injected body references them.
      member.body.push(node);
    }
  }

  return {
    ...info,
    // A class without instance members of its own has no receiver; inherited
    // headings then keep the ancestor's receiver rather than inventing one.
    receiver: receiver ?? '',
    sections,
    definitions,
  };
}

function loadAncestorDoc(
  filePath: string,
  className: string,
): AncestorDoc | null {
  if (ancestorCache.has(filePath)) {
    return ancestorCache.get(filePath);
  }

  let doc: AncestorDoc | null = null;
  if (fs.existsSync(filePath)) {
    // The parent doc is parsed with plain GFM rather than MDX. Member bodies
    // in the Electron API docs are plain Markdown, and any stray `html` node
    // is dropped by the MDX compiler anyway.
    const markdown = fs
      .readFileSync(filePath, 'utf-8')
      .replace(FRONTMATTER, '');
    const tree = remark().use(remarkGfm).parse(markdown);
    const info = findClassInfo(tree, className);
    if (info) {
      doc = { ...readClassDoc(tree, info), filePath };
    }
  }

  ancestorCache.set(filePath, doc);
  return doc;
}

/**
 * Walks the `extends` chain starting at `parentName`, nearest ancestor first.
 * Stops at the first ancestor without a sibling doc (e.g. `EventTarget`).
 */
function collectAncestors(
  dir: string,
  childName: string,
  parentName: string,
): AncestorDoc[] {
  const ancestors: AncestorDoc[] = [];
  const visited = new Set([childName]);
  let current: string | undefined = parentName;

  while (current) {
    if (visited.has(current)) {
      logger.warn(
        `Circular class inheritance detected at ${current} while resolving ${childName}. Stopping.`,
      );
      break;
    }
    visited.add(current);
    const doc = loadAncestorDoc(
      path.join(dir, `${kebabCase(current)}.md`),
      current,
    );
    if (!doc) break;
    ancestors.push(doc);
    current = doc.parentName;
  }

  return ancestors;
}

/** Visits `nodes` and all of their descendants. */
function visitAll(nodes: Node[], visitor: (node: Node) => void) {
  visitParents({ type: 'root', children: nodes } as Root, visitor);
}

/**
 * Deep-clones a node so that cached ancestor trees are never mutated, and
 * drops `position` data that would otherwise point into the wrong file.
 */
function cloneNode<T extends Node>(node: T): T {
  const clone = structuredClone(node);
  visitAll([clone], (current) => delete current.position);
  return clone;
}

function replacePrefix(value: string, from: string, to: string): string {
  return value.startsWith(from) ? `${to}${value.slice(from.length)}` : value;
}

/** Collects the identifiers of every reference-style link in `nodes`. */
function collectReferences(nodes: Node[], identifiers: Set<string>) {
  visitAll(nodes, (node) => {
    if (node.type === 'linkReference' || node.type === 'imageReference') {
      identifiers.add((node as LinkReference | ImageReference).identifier);
    }
  });
}

/**
 * Rewrites same-page anchors in `nodes` from the ancestor's receiver to the
 * child's (e.g. `#viewgetbounds` -> `#imagegetbounds`), since the headings
 * those anchors point to are rewritten the same way when injected.
 */
function rewriteAnchors(nodes: Node[], from: string, to: string) {
  // Member slugs drop the `.`, so the receiver is directly followed by the
  // member name (`#viewgetbounds`); `#view-customization` is not a member.
  const memberAnchor = new RegExp(
    `^#${from.toLowerCase().replace(/\\$/g, '\\$&')}(?=[a-z0-9])`,
  );
  visitAll(nodes, (node) => {
    if (node.type === 'link') {
      const link = node as Link;
      link.url = link.url.replace(memberAnchor, `#${to.toLowerCase()}`);
    }
  });
}

function inheritedFromNote(ancestor: AncestorDoc): Paragraph {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'emphasis',
        children: [
          { type: 'text', value: 'Inherited from ' },
          {
            type: 'link',
            url: `./${path.basename(ancestor.filePath)}`,
            children: [{ type: 'inlineCode', value: ancestor.className }],
          },
        ],
      },
    ],
  };
}

function isApiHistoryBlock(node: RootContent | undefined): boolean {
  return (
    node?.type === 'code' &&
    node.lang?.toLowerCase() === 'yaml' &&
    node.meta?.toLowerCase() === 'history'
  );
}

/**
 * Builds the nodes to inject for one inherited member: its heading (with the
 * receiver or class name rewritten for the child), an optional API history
 * block, the "Inherited from" note, and the rest of the member body.
 */
function buildInjectedMember(
  member: Member,
  section: SectionName,
  ancestor: AncestorDoc,
  child: ClassDoc,
): RootContent[] {
  const heading = cloneNode(member.heading);
  const body = member.body.map((node) => cloneNode(node));

  // Statics are prefixed with the class name, instance members with the receiver
  const isStatic = section.startsWith('Static');
  const from = isStatic ? ancestor.className : ancestor.receiver;
  const to = isStatic ? child.className : child.receiver;
  const [first] = heading.children;
  if (from && to && from !== to) {
    if (first?.type === 'inlineCode') {
      first.value = replacePrefix(first.value, `${from}.`, `${to}.`);
    }
    if (!isStatic) rewriteAnchors(body, from, to);
  }

  heading.data = {
    ...heading.data,
    hProperties: {
      ...(heading.data?.hProperties as Record<string, unknown> | undefined),
      className: [INHERITED_MEMBER_CLASS],
    },
  } as Heading['data'];

  // Keep the API history block directly after the heading, then the note
  const noteIndex = isApiHistoryBlock(body[0]) ? 1 : 0;
  body.splice(noteIndex, 0, inheritedFromNote(ancestor));

  return [heading, ...body];
}

/**
 * Appends `nodes` to the end of the `section` of the class starting at
 * `classInfo.headingIndex`, creating the section heading if needed.
 */
function insertIntoSection(
  tree: Root,
  classInfo: ClassInfo,
  section: SectionName,
  nodes: RootContent[],
) {
  const classEnd = findNextHeading(tree, classInfo.headingIndex + 1, 2);
  const existing = new Map<SectionName, number>();
  for (let i = classInfo.headingIndex + 1; i < classEnd; i++) {
    const node = tree.children[i];
    if (isHeading(node) && node.depth === 3) {
      const text = toString(node).trim();
      if (isSectionName(text) && !existing.has(text)) existing.set(text, i);
    }
  }

  // Trailing reference-style link definitions belong after the injected nodes
  const beforeDefinitions = (index: number) => {
    while (
      index > classInfo.headingIndex + 1 &&
      tree.children[index - 1].type === 'definition'
    ) {
      index--;
    }
    return index;
  };

  if (existing.has(section)) {
    const end = findNextHeading(tree, existing.get(section) + 1, 3);
    tree.children.splice(beforeDefinitions(end), 0, ...nodes);
    return;
  }

  // Create the section, placed before the first existing section that
  // follows it in canonical order, or else at the end of the class.
  const rank = SECTIONS.indexOf(section);
  let insertAt = classEnd;
  for (const [name, index] of existing) {
    if (SECTIONS.indexOf(name) > rank && index < insertAt) insertAt = index;
  }
  if (insertAt === classEnd) insertAt = beforeDefinitions(insertAt);

  const heading: Heading = {
    type: 'heading',
    depth: 3,
    children: [{ type: 'text', value: section }],
  };
  tree.children.splice(insertAt, 0, heading, ...nodes);
}

function transformer(tree: Root, file: VFile) {
  if (!isApiDoc(file.path)) return;

  const info = findClassInfo(tree);
  if (!info?.parentName) return;

  const ancestors = collectAncestors(
    path.dirname(file.path),
    info.className,
    info.parentName,
  );
  if (ancestors.length === 0) return;

  const child = readClassDoc(tree, info);
  const declared = new Map<SectionName, Set<string>>(
    SECTIONS.map((section) => [
      section,
      new Set(child.sections.get(section)?.map(({ key }) => key)),
    ]),
  );
  const references = new Set<string>();

  for (const ancestor of ancestors) {
    for (const section of SECTIONS) {
      const declaredKeys = declared.get(section);
      const members = (ancestor.sections.get(section) ?? []).filter(
        ({ key }) => !declaredKeys.has(key),
      );
      if (members.length === 0) continue;

      for (const { key } of members) declaredKeys.add(key);
      const nodes = members.flatMap((member) =>
        buildInjectedMember(member, section, ancestor, child),
      );
      collectReferences(nodes, references);
      insertIntoSection(tree, info, section, nodes);
    }

    // Carry over the reference-style link definitions the injected bodies use
    for (const identifier of references) {
      const definition = ancestor.definitions.get(identifier);
      if (definition && !child.definitions.has(identifier)) {
        const clone = cloneNode(definition);
        child.definitions.set(identifier, clone);
        tree.children.push(clone);
      }
    }
  }
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import type { Heading, Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import apiInheritedMembers, {
  INHERITED_MEMBER_CLASS,
} from './api-inherited-members.ts';

const API_DIR = path.resolve(process.cwd(), 'docs/latest/api');
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const CLASS_HEADING = /^Class:\s+([\w$]+)(?:\s+extends\s+([\w$]+))?\s*$/;
const SECTIONS = [
  'Static Methods',
  'Static Properties',
  'Instance Events',
  'Instance Properties',
  'Instance Methods',
];

type Sections = Map<string, string[]>;

function parse(markdown: string): Root {
  return remark().use(remarkGfm).parse(markdown.replace(FRONTMATTER, ''));
}

function parseFile(filePath: string): Root {
  return parse(fs.readFileSync(filePath, 'utf-8'));
}

/** Parses `filePath` and runs the transformer over it, `times` times. */
async function transform(filePath: string, times = 1): Promise<Root> {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const processor = remark().use(remarkGfm).use(apiInheritedMembers);
  const tree = processor.parse(markdown.replace(FRONTMATTER, ''));
  for (let i = 0; i < times; i++) {
    await processor.run(tree, { path: filePath, value: markdown });
  }
  return tree;
}

/**
 * Writes `files` into a new `api/` directory (or `subdir`) under a fresh
 * temporary directory and returns that directory.
 */
function writeFixtures(files: Record<string, string>, subdir = 'api'): string {
  const dir = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'inherited-')),
    subdir,
  );
  fs.mkdirSync(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

function isHeading(node: RootContent): node is Heading {
  return node.type === 'heading';
}

/**
 * Depth-4 member heading texts of the first class in `tree`, by depth-3
 * section. Sections without members (e.g. the constructor) are included with
 * an empty list when `includeEmpty` is set.
 */
function membersBySection(tree: Root, includeEmpty = false): Sections {
  const sections: Sections = new Map();
  let inClass = false;
  let section: string | undefined;
  for (const node of tree.children) {
    if (!isHeading(node)) continue;
    const text = toString(node).trim();
    if (node.depth === 2) {
      if (inClass) break;
      inClass = text.startsWith('Class: ');
    } else if (node.depth === 3 && inClass) {
      section = text;
      if (includeEmpty && !sections.has(section)) sections.set(section, []);
    } else if (node.depth === 4 && inClass && section) {
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push(text);
    }
  }
  return sections;
}

/** Normalizes a member heading text the way the plugin compares members. */
function keyOf(section: string, headingText: string): string {
  if (section === 'Instance Events') {
    const event = /^Event:\s*'([^']+)'/.exec(headingText);
    if (event) return `event:${event[1]}`;
  }
  return /^[\w$]+\.([\w$]+)/.exec(headingText)?.[1] ?? headingText;
}

function injectedHeadings(tree: Root): Heading[] {
  return tree.children.filter(
    (node): node is Heading =>
      isHeading(node) &&
      (
        (node.data?.hProperties as { className?: string[] })?.className ?? []
      ).includes(INHERITED_MEMBER_CLASS),
  );
}

function injectedTexts(tree: Root): string[] {
  return injectedHeadings(tree).map((heading) => toString(heading).trim());
}

/** The "Inherited from" note that follows an injected heading. */
function noteNodeAfter(tree: Root, heading: Heading): RootContent {
  let index = tree.children.indexOf(heading) + 1;
  const next = tree.children[index];
  if (next.type === 'code' && next.meta?.toLowerCase() === 'history') {
    index++;
  }
  return tree.children[index];
}

function noteAfter(tree: Root, heading: Heading): string {
  return toString(noteNodeAfter(tree, heading));
}

function classSections(tree: Root): string[] {
  return [...membersBySection(tree, true).keys()];
}

function linkUrls(tree: Root): string[] {
  const urls: string[] = [];
  const stack: RootContent[] = [...tree.children];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.type === 'link') urls.push(node.url);
    if ('children' in node) stack.push(...(node.children as RootContent[]));
  }
  return urls;
}

/** Approximates the heading ids Docusaurus generates (github-slugger). */
function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-');
}

async function assertUntouched(filePath: string) {
  const after = await transform(filePath);
  assert.deepEqual(after, parseFile(filePath));
}

interface ClassDoc {
  className: string;
  parentName?: string;
  tree: Root;
}

function readClass(tree: Root, expectedName?: string): ClassDoc | undefined {
  for (const node of tree.children) {
    if (!isHeading(node) || node.depth !== 2) continue;
    const match = CLASS_HEADING.exec(toString(node).trim());
    if (!match || (expectedName && match[1] !== expectedName)) continue;
    return { className: match[1], parentName: match[2], tree };
  }
  return undefined;
}

/** Documented ancestors of the class in `filePath`, nearest first. */
function ancestorsOf(filePath: string): ClassDoc[] {
  const child = readClass(parseFile(filePath));
  const ancestors: ClassDoc[] = [];
  const visited = new Set([child?.className]);
  let current = child?.parentName;
  while (current && !visited.has(current)) {
    visited.add(current);
    const parentPath = path.join(
      path.dirname(filePath),
      `${current.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.md`,
    );
    if (!fs.existsSync(parentPath)) break;
    const doc = readClass(parseFile(parentPath), current);
    if (!doc) break;
    ancestors.push(doc);
    current = doc.parentName;
  }
  return ancestors;
}

/**
 * Whether every h3 under the class heading is a member section or the
 * constructor, and every member h4 in those sections is in the
 * `Event: 'name'` or `` `receiver.member` `` form.
 */
function hasOnlyKnownHeadings({ className, tree }: ClassDoc): boolean {
  let inClass = false;
  let section: string | undefined;
  for (const node of tree.children) {
    if (!isHeading(node)) continue;
    const text = toString(node).trim();
    if (node.depth === 2) {
      if (inClass) break;
      inClass = CLASS_HEADING.exec(text)?.[1] === className;
    } else if (!inClass) {
      continue;
    } else if (node.depth === 3) {
      section = SECTIONS.includes(text) ? text : undefined;
      if (!section && !text.startsWith(`new ${className}(`)) return false;
    } else if (node.depth === 4 && section) {
      const [first] = node.children;
      const known =
        section === 'Instance Events'
          ? /^Event:\s*'[^']+'/.test(text)
          : first?.type === 'inlineCode' && /^[\w$]+\.[\w$]+/.test(first.value);
      if (!known) return false;
    }
  }
  return true;
}

/** Receiver of the instance members of a class, e.g. `win` */
function receiverOf(sections: Sections): string | undefined {
  for (const section of ['Instance Methods', 'Instance Properties']) {
    for (const text of sections.get(section) ?? []) {
      const receiver = /^([\w$]+)\./.exec(text)?.[1];
      if (receiver) return receiver;
    }
  }
  return undefined;
}

describe('api-inherited-members', () => {
  describe('real docs (docs/latest/api), whatever they contain', async () => {
    const files = fs
      .readdirSync(API_DIR)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((name) => path.join(API_DIR, name));
    const inheriting = files.filter((file) => ancestorsOf(file).length > 0);

    it('leaves every doc without a documented parent class untouched', async () => {
      for (const file of files) {
        if (!inheriting.includes(file)) await assertUntouched(file);
      }
    });

    for (const childPath of inheriting) {
      const original = parseFile(childPath);
      const child = readClass(original);
      const ancestors = ancestorsOf(childPath);
      const name = `${path.basename(childPath)}: ${[child, ...ancestors]
        .map(({ className }) => className)
        .join(' extends ')}`;

      describe(name, async () => {
        const tree = await transform(childPath);
        const before = membersBySection(original);
        const after = membersBySection(tree);

        if (![child, ...ancestors].every(hasOnlyKnownHeadings)) {
          it('is left untouched (unrecognised section or member headings)', () => {
            assert.deepEqual(tree, original);
          });
          return;
        }

        // Members the plugin should inject per section: those of each ancestor,
        // nearest first, that neither the child nor a nearer ancestor declares.
        const expected = new Map<string, { key: string; from: string }[]>();
        for (const section of SECTIONS) {
          const declared = new Set(
            (before.get(section) ?? []).map((text) => keyOf(section, text)),
          );
          const members: { key: string; from: string }[] = [];
          for (const ancestor of ancestors) {
            const keys = (
              membersBySection(ancestor.tree).get(section) ?? []
            ).map((text) => keyOf(section, text));
            const missing = keys.filter((key) => !declared.has(key));
            for (const key of missing) declared.add(key);
            members.push(
              ...missing.map((key) => ({ key, from: ancestor.className })),
            );
          }
          expected.set(section, members);
        }
        const expectedCount = [...expected.values()].flat().length;

        it('injects exactly the ancestor members the child does not declare', () => {
          for (const section of SECTIONS) {
            const own = before.get(section) ?? [];
            const result = after.get(section) ?? [];
            assert.deepEqual(
              result.slice(0, own.length),
              own,
              `${section}: own members kept first, in order`,
            );
            assert.deepEqual(
              result.slice(own.length).map((text) => keyOf(section, text)),
              expected.get(section).map(({ key }) => key),
              `${section}: injected members`,
            );
          }
          assert.equal(injectedHeadings(tree).length, expectedCount);
        });

        it('keeps every other heading and creates no duplicate ids', () => {
          const headings = tree.children.filter(isHeading);
          const injected = new Set(injectedHeadings(tree));
          assert.deepEqual(
            headings
              .filter((heading) => !injected.has(heading))
              .map((heading) => toString(heading).trim())
              .filter((text) => !SECTIONS.includes(text)),
            original.children
              .filter(isHeading)
              .map((heading) => toString(heading).trim())
              .filter((text) => !SECTIONS.includes(text)),
          );
          const slugs = headings.map((heading) => slug(toString(heading)));
          for (const heading of injected) {
            const id = slug(toString(heading));
            assert.equal(
              slugs.filter((other) => other === id).length,
              1,
              `${toString(heading)} has a unique id`,
            );
          }
        });

        it('notes the providing ancestor after every injected member', () => {
          const providers = SECTIONS.flatMap((section) =>
            expected.get(section).map(({ from }) => `Inherited from ${from}`),
          );
          // The page keeps the child's own section order, so compare as
          // multisets.
          assert.deepEqual(
            injectedHeadings(tree)
              .map((heading) => noteAfter(tree, heading))
              .sort(),
            providers.sort(),
          );
        });

        it('rewrites inherited headings to the child class and receiver', () => {
          const receiver = receiverOf(before);
          for (const heading of injectedHeadings(tree)) {
            const [first] = heading.children;
            if (first?.type !== 'inlineCode') continue;
            const prefix = /^([\w$]+)\./.exec(first.value)?.[1];
            if (!prefix) continue;
            if (ancestors.some(({ className }) => className === prefix)) {
              assert.fail(`${first.value} keeps an ancestor class name`);
            }
            if (receiver && prefix !== child.className) {
              assert.equal(prefix, receiver, first.value);
            }
          }
        });

        it('is idempotent', async () => {
          assert.deepEqual(await transform(childPath, 2), tree);
        });
      });
    }
  });

  describe('BrowserWindow-like duplication (synthetic docs)', async () => {
    const dir = writeFixtures({
      'base-window.md': `# BaseWindow

## Class: BaseWindow

### \`new BaseWindow([options])\`

### Instance Events

#### Event: 'close'

Emitted when the window is going to be closed.

#### Event: 'persisted-state-restored'

> [!NOTE]
> Only when restoring state.

### Static Methods

#### \`BaseWindow.fromId(id)\`

* \`id\` Integer

#### \`BaseWindow.clearPersistedState(name)\`

Clears the persisted state.

### Instance Properties

#### \`win.id\` _Readonly_

#### \`win.contentView\`

### Instance Methods

#### \`win.setContentView(view)\`

#### \`win.getContentView()\`

#### \`win.close()\`

Closes the window.
`,
      'browser-window.md': `# BrowserWindow

## Class: BrowserWindow extends \`BaseWindow\`

### \`new BrowserWindow([options])\`

### Instance Events

#### Event: 'close'

Emitted when the window is going to be closed.

#### Event: 'page-title-updated'

### Static Methods

#### \`BrowserWindow.fromId(id)\`

### Instance Properties

#### \`win.id\` _Readonly_

#### \`win.webContents\` _Readonly_

### Instance Methods

#### \`win.close()\`

#### \`win.loadURL(url)\`
`,
    });
    const childPath = path.join(dir, 'browser-window.md');
    const tree = await transform(childPath);

    it('injects only the members the child does not duplicate', () => {
      assert.deepEqual(
        membersBySection(tree, true),
        new Map([
          ['new BrowserWindow([options])', []],
          [
            'Instance Events',
            [
              "Event: 'close'",
              "Event: 'page-title-updated'",
              "Event: 'persisted-state-restored'",
            ],
          ],
          [
            'Static Methods',
            [
              'BrowserWindow.fromId(id)',
              'BrowserWindow.clearPersistedState(name)',
            ],
          ],
          [
            'Instance Properties',
            ['win.id Readonly', 'win.webContents Readonly', 'win.contentView'],
          ],
          [
            'Instance Methods',
            [
              'win.close()',
              'win.loadURL(url)',
              'win.setContentView(view)',
              'win.getContentView()',
            ],
          ],
        ]),
      );
      assert.deepEqual(injectedTexts(tree), [
        "Event: 'persisted-state-restored'",
        'BrowserWindow.clearPersistedState(name)',
        'win.contentView',
        'win.setContentView(view)',
        'win.getContentView()',
      ]);
    });

    it('links an "Inherited from" note to the parent page', () => {
      for (const heading of injectedHeadings(tree)) {
        const note = noteNodeAfter(tree, heading);
        assert.equal(toString(note), 'Inherited from BaseWindow');
        const [link] = linkUrls({ type: 'root', children: [note] });
        assert.equal(link, './base-window.md');
      }
    });

    it('carries the member body after the note', () => {
      const [event] = injectedHeadings(tree);
      const index = tree.children.indexOf(event);
      assert.equal(tree.children[index + 2].type, 'blockquote');
    });

    it('is idempotent', async () => {
      assert.deepEqual(await transform(childPath, 2), tree);
    });
  });

  describe('View-like parent without duplication (synthetic docs)', async () => {
    const view = `# View

## Class: View

### \`new View()\`

Creates a new \`View\`.

### Instance Events

Objects created with \`new View\` emit the following events:

#### Event: 'bounds-changed'

The new bounds can be retrieved with [\`view.getBounds()\`](#viewgetbounds).

### Instance Methods

Objects created with \`new View\` have the following instance methods:

#### \`view.addChildView(view[, index])\`

See [customization](#view-customization).

#### \`view.getBounds()\`

Returns the bounds.

### Instance Properties

#### \`view.children\` _Readonly_
`;
    const files = {
      'view.md': view,
      'web-contents-view.md': `# WebContentsView

## Class: WebContentsView extends \`View\`

### \`new WebContentsView([options])\`

### Instance Properties

#### \`webContentsView.webContents\` _Readonly_
`,
      'image-view.md': `# ImageView

## Class: ImageView extends \`View\`

### \`new ImageView()\` _Experimental_

### Instance Methods

#### \`image.setImage(image)\` _Experimental_

Sets the image.
`,
    };
    const dir = writeFixtures(files);
    const webContentsView = await transform(
      path.join(dir, 'web-contents-view.md'),
    );
    const imageView = await transform(path.join(dir, 'image-view.md'));

    it('gains every parent member, appended after its own members', () => {
      assert.deepEqual(
        membersBySection(webContentsView),
        new Map([
          ['Instance Events', ["Event: 'bounds-changed'"]],
          [
            'Instance Properties',
            [
              'webContentsView.webContents Readonly',
              'webContentsView.children Readonly',
            ],
          ],
          [
            'Instance Methods',
            [
              'webContentsView.addChildView(view[, index])',
              'webContentsView.getBounds()',
            ],
          ],
        ]),
      );
    });

    it('creates missing sections in canonical order', () => {
      assert.deepEqual(classSections(webContentsView), [
        'new WebContentsView([options])',
        'Instance Events',
        'Instance Properties',
        'Instance Methods',
      ]);
    });

    it('does not copy the parent section intro paragraphs', () => {
      assert.ok(!toString(webContentsView).includes('Objects created with'));
    });

    it('rewrites the receiver of inherited instance members', () => {
      assert.deepEqual(membersBySection(imageView).get('Instance Methods'), [
        'image.setImage(image) Experimental',
        'image.addChildView(view[, index])',
        'image.getBounds()',
      ]);
      assert.ok(!injectedTexts(imageView).some((t) => t.startsWith('view.')));
    });

    it('rewrites same-page member anchors, linking others to the parent', () => {
      const urls = linkUrls(imageView);
      assert.ok(urls.includes('#imagegetbounds'));
      assert.ok(!urls.includes('#viewgetbounds'));
      assert.ok(urls.includes('./view.md#view-customization'));
      assert.ok(!urls.includes('#view-customization'));
    });

    it('leaves the parent itself untouched (no extends)', async () => {
      await assertUntouched(path.join(dir, 'view.md'));
    });

    it('leaves a doc outside an api/ directory untouched', async () => {
      const tutorial = writeFixtures(files, 'tutorial');
      await assertUntouched(path.join(tutorial, 'image-view.md'));
    });

    it('is idempotent', async () => {
      assert.deepEqual(
        await transform(path.join(dir, 'web-contents-view.md'), 2),
        webContentsView,
      );
    });
  });

  describe('translated section headings (synthetic docs)', () => {
    const englishParent = `# View

## Class: View

### \`new View()\`

### Instance Events

#### Event: 'bounds-changed'

### Instance Methods

#### \`view.getBounds()\`
`;
    // Partially translated: one section is still in English
    const translatedParent = `# View

## Class: View

### \`new View()\`

### Instance Events

#### Event: 'bounds-changed'

### Instanzmethoden

#### \`view.getBounds()\`
`;
    const englishChild = `# ImageView

## Class: ImageView extends \`View\`

### \`new ImageView()\`

### Instance Methods

#### \`image.getBounds()\`

#### \`image.setImage(image)\`
`;
    const translatedChild = englishChild.replace(
      '### Instance Methods',
      '### Instanzmethoden',
    );

    it('injects nothing into a translated child of an English parent', async () => {
      const dir = writeFixtures({
        'view.md': englishParent,
        'image-view.md': translatedChild,
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('injects nothing into an English child of a translated parent', async () => {
      const dir = writeFixtures({
        'view.md': translatedParent,
        'image-view.md': englishChild,
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('injects nothing into a partially translated child', async () => {
      const dir = writeFixtures({
        'view.md': englishParent,
        'image-view.md': translatedChild.replace(
          '### `new ImageView()`',
          "### `new ImageView()`\n\n### Instance Events\n\n#### Event: 'loaded'",
        ),
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('injects nothing when a child event heading is translated', async () => {
      const dir = writeFixtures({
        'view.md': englishParent,
        'image-view.md': englishChild.replace(
          '### `new ImageView()`',
          "### `new ImageView()`\n\n### Instance Events\n\n#### Ereignis: 'bounds-changed'",
        ),
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('injects nothing when a parent event heading is translated', async () => {
      const dir = writeFixtures({
        'view.md': englishParent
          .replace(
            "#### Event: 'bounds-changed'",
            "#### Ereignis: 'bounds-changed'",
          )
          .replace(
            '#### `view.getBounds()`',
            '#### `view.getBounds()`\n\n#### `view.setBounds(bounds)`',
          ),
        'image-view.md': englishChild,
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('injects nothing when a member heading lacks the receiver form', async () => {
      const dir = writeFixtures({
        'view.md': englishParent.replace(
          '#### `view.getBounds()`',
          '#### `view.getBounds()`\n\n#### Grenzen abrufen',
        ),
        'image-view.md': englishChild,
      });
      await assertUntouched(path.join(dir, 'image-view.md'));
    });

    it('still injects when both docs are in English', async () => {
      const dir = writeFixtures({
        'view.md': englishParent,
        'image-view.md': englishChild,
      });
      const tree = await transform(path.join(dir, 'image-view.md'));
      assert.deepEqual(injectedTexts(tree), ["Event: 'bounds-changed'"]);
      assert.deepEqual(membersBySection(tree).get('Instance Methods'), [
        'image.getBounds()',
        'image.setImage(image)',
      ]);
    });
  });

  describe('same-page anchors in injected bodies (synthetic docs)', async () => {
    const dir = writeFixtures({
      'base-window.md': `# BaseWindow

## Parent and child windows

Prose that only the parent page has.

## Class: BaseWindow

### \`new BaseWindow([options])\`

### Instance Events

#### Event: 'close'

### Static Methods

#### \`BaseWindow.getAllWindows()\`

See [\`BaseWindow.fromId(id)\`](#basewindowfromidid),
[\`BaseWindow.fromView(view)\`](#basewindowfromviewview),
[\`BaseWindow.getFocusedWindow()\`](#basewindowgetfocusedwindow),
[\`win.getBounds()\`](#wingetbounds),
[the constructor](#new-basewindowoptions),
[parent and child windows](#parent-and-child-windows),
[\`contents.loadURL(url)\`](web-contents.md#contentsloadurlurl) and
[the spec](https://example.com/#basewindowfromidid).

#### \`BaseWindow.fromId(id)\`

#### \`BaseWindow.fromView(view)\`

#### \`BaseWindow.getFocusedWindow()\`

### Instance Methods

#### \`win.getBounds()\`

See [\`win.setBounds(bounds)\`](#winsetboundsbounds),
[\`BaseWindow.fromId(id)\`](#basewindowfromidid),
[\`BaseWindow.getFocusedWindow()\`](#basewindowgetfocusedwindow) and
[\`'close'\`](#event-close).

#### \`win.setBounds(bounds)\`
`,
      'browser-window.md': `# BrowserWindow

## Class: BrowserWindow extends \`BaseWindow\`

### \`new BrowserWindow([options])\`

### Instance Events

#### Event: 'close'

### Static Methods

#### \`BrowserWindow.fromId(id)\`

#### \`BrowserWindow.getFocusedWindow(options)\`

### Instance Methods

#### \`browser.loadURL(url)\`
`,
    });
    const childPath = path.join(dir, 'browser-window.md');
    const tree = await transform(childPath);

    /** Link URLs in the body of the member under `headingText`, sorted */
    function bodyLinks(headingText: string): string[] {
      const start = tree.children.findIndex(
        (node) => isHeading(node) && toString(node) === headingText,
      );
      const end = tree.children.findIndex(
        (node, index) => index > start && isHeading(node),
      );
      const body = tree.children.slice(start + 1, end === -1 ? undefined : end);
      return linkUrls({ type: 'root', children: body }).sort();
    }

    const staticLinks = bodyLinks('BrowserWindow.getAllWindows()');
    const instanceLinks = bodyLinks('browser.getBounds()');

    it('rewrites static anchors to class-name statics on the child page', () => {
      // `fromId` is declared by the child, `fromView` is injected
      assert.ok(staticLinks.includes('#browserwindowfromidid'));
      assert.ok(staticLinks.includes('#browserwindowfromviewview'));
      assert.ok(instanceLinks.includes('#browserwindowfromidid'));
    });

    it('links class-name statics not on the child page to the parent', () => {
      // The child declares `getFocusedWindow(options)`, so that id differs
      for (const urls of [staticLinks, instanceLinks]) {
        assert.ok(urls.includes('./base-window.md#basewindowgetfocusedwindow'));
      }
    });

    it('links the parent constructor and prose headings to the parent', () => {
      assert.ok(staticLinks.includes('./base-window.md#new-basewindowoptions'));
      assert.ok(
        staticLinks.includes('./base-window.md#parent-and-child-windows'),
      );
    });

    it('still rewrites instance member anchors, in any section', () => {
      assert.ok(instanceLinks.includes('#browsersetboundsbounds'));
      assert.ok(staticLinks.includes('#browsergetbounds'));
      assert.ok(instanceLinks.includes('#event-close'));
    });

    it('leaves links to other pages alone', () => {
      assert.ok(staticLinks.includes('web-contents.md#contentsloadurlurl'));
      assert.ok(
        staticLinks.includes('https://example.com/#basewindowfromidid'),
      );
    });

    it('leaves no same-page link without a heading on the child page', () => {
      const ids = new Set(
        tree.children
          .filter(isHeading)
          .map((heading) => slug(toString(heading))),
      );
      for (const url of linkUrls(tree)) {
        if (url.startsWith('#')) assert.ok(ids.has(url.slice(1)), url);
      }
    });

    it('is idempotent', async () => {
      assert.deepEqual(await transform(childPath, 2), tree);
    });
  });

  describe('receivers with regex metacharacters (synthetic docs)', () => {
    it('rewrites anchors for a receiver containing $', async () => {
      const dir = writeFixtures({
        'dollar-parent.md': `# DollarParent

## Class: DollarParent

### Instance Methods

#### \`$parent.foo()\`

See [\`$parent.bar()\`](#$parentbar) and [intro](#$parent-intro).

#### \`$parent.bar()\`
`,
        'dollar-child.md': `# DollarChild

## Class: DollarChild extends \`DollarParent\`

### Instance Methods

#### \`kid.own()\`
`,
      });
      const tree = await transform(path.join(dir, 'dollar-child.md'));
      assert.deepEqual(injectedTexts(tree), ['kid.foo()', 'kid.bar()']);
      const urls = linkUrls(tree);
      assert.ok(urls.includes('#kidbar'), urls.join(', '));
      assert.ok(urls.includes('./dollar-parent.md#$parent-intro'));
    });
  });

  describe('docs without a documented parent (synthetic docs)', () => {
    it('extends a class without a sibling doc (e.g. EventTarget)', async () => {
      const dir = writeFixtures({
        'web-socket.md': `# WebSocket

## Class: WebSocket extends \`EventTarget\`

### Instance Methods

#### \`webSocket.send(data)\`
`,
      });
      await assertUntouched(path.join(dir, 'web-socket.md'));
    });
  });

  describe('inheritance chain (synthetic docs)', async () => {
    const dir = writeFixtures({
      'grand-parent.md': `# GrandParent

## Class: GrandParent

### Instance Events

Objects created with \`new GrandParent\` emit the following events:

#### Event: 'shared'

From the grandparent.

#### Event: 'ancient'

Only the grandparent has this. See [the spec][spec].

### Instance Methods

#### \`gp.shared()\`

From the grandparent.

#### \`gp.ancient(arg)\`

\`\`\`YAML history
added:
  - pr-url: https://github.com/electron/electron/pull/1
\`\`\`

* \`arg\` string

Calls [\`gp.shared()\`](#gpshared).

[spec]: https://example.com/spec
`,
      'the-parent.md': `# TheParent

## Class: TheParent extends \`GrandParent\`

### Static Methods

#### \`TheParent.create()\`

Creates one.

### Instance Methods

#### \`parent.shared()\`

From the parent.
`,
      'the-child.md': `# TheChild

## Class: TheChild extends \`TheParent\`

### \`new TheChild()\`

### Instance Methods

#### \`child.own()\`

Its own method.

#### \`child.shared()\`

Its own override.

## Unrelated section

Not part of the class.
`,
      'loop-a.md': `# LoopA

## Class: LoopA extends \`LoopB\`

### Instance Methods

#### \`a.only()\`
`,
      'loop-b.md': `# LoopB

## Class: LoopB extends \`LoopA\`

### Instance Methods

#### \`b.other()\`
`,
    });

    const tree = await transform(path.join(dir, 'the-child.md'));
    const sections = membersBySection(tree);

    it('walks the whole chain, nearest ancestor first', () => {
      assert.deepEqual(sections.get('Instance Methods'), [
        'child.own()',
        'child.shared()',
        'child.ancient(arg)',
      ]);
      assert.deepEqual(sections.get('Static Methods'), ['TheChild.create()']);
      assert.deepEqual(sections.get('Instance Events'), [
        "Event: 'shared'",
        "Event: 'ancient'",
      ]);
    });

    it('creates sections in canonical order before other content', () => {
      assert.deepEqual(classSections(tree), [
        'new TheChild()',
        'Static Methods',
        'Instance Events',
        'Instance Methods',
      ]);
      const unrelated = tree.children.findIndex(
        (node) => isHeading(node) && toString(node) === 'Unrelated section',
      );
      const last = tree.children.lastIndexOf(injectedHeadings(tree).at(-1));
      assert.ok(last < unrelated);
      assert.ok(!toString(tree).includes('Objects created with'));
    });

    it('links each note to the ancestor that provided the member', () => {
      const notes = injectedHeadings(tree).map((heading) => [
        toString(heading),
        noteAfter(tree, heading),
      ]);
      assert.deepEqual(notes, [
        ['TheChild.create()', 'Inherited from TheParent'],
        ["Event: 'shared'", 'Inherited from GrandParent'],
        ["Event: 'ancient'", 'Inherited from GrandParent'],
        ['child.ancient(arg)', 'Inherited from GrandParent'],
      ]);
    });

    it('keeps the history block directly after the heading', () => {
      const heading = injectedHeadings(tree).at(-1);
      const next = tree.children[tree.children.indexOf(heading) + 1];
      assert.equal(next.type, 'code');
      assert.equal(next.meta, 'history');
    });

    it('rewrites anchors and copies link definitions', () => {
      const text = JSON.stringify(tree);
      assert.ok(text.includes('"url":"#childshared"'));
      assert.ok(!text.includes('#gpshared'));
      const definitions = tree.children.filter(
        (node) => node.type === 'definition',
      );
      assert.equal(definitions.length, 1);
      assert.equal(definitions[0].url, 'https://example.com/spec');
    });

    it('stops on circular inheritance', async () => {
      const loop = await transform(path.join(dir, 'loop-a.md'));
      assert.deepEqual(membersBySection(loop).get('Instance Methods'), [
        'a.only()',
        'a.other()',
      ]);
    });
  });
});

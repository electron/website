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

type Sections = Map<string, string[]>;

function parse(markdown: string): Root {
  return remark().use(remarkGfm).parse(markdown.replace(FRONTMATTER, ''));
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
    return `event:${/^Event:\s*'([^']+)'/.exec(headingText)[1]}`;
  }
  return /^[\w$]+\.([\w$]+)/.exec(headingText)[1];
}

function keysBySection(sections: Sections): Map<string, Set<string>> {
  return new Map(
    [...sections].map(([section, members]) => [
      section,
      new Set(members.map((member) => keyOf(section, member))),
    ]),
  );
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

function allMemberHeadings(tree: Root): string[] {
  return tree.children
    .filter((node): node is Heading => isHeading(node) && node.depth === 4)
    .map((node) => toString(node).trim());
}

/** Text of the "Inherited from" note that follows an injected heading. */
function noteAfter(tree: Root, heading: Heading): string {
  let index = tree.children.indexOf(heading) + 1;
  const next = tree.children[index];
  if (next.type === 'code' && next.meta?.toLowerCase() === 'history') {
    index++;
  }
  return toString(tree.children[index]);
}

function classSections(tree: Root): string[] {
  return [...membersBySection(tree, true).keys()];
}

describe('api-inherited-members', () => {
  describe('BrowserWindow extends BaseWindow (real docs)', async () => {
    const childPath = path.join(API_DIR, 'browser-window.md');
    const original = membersBySection(
      parse(fs.readFileSync(childPath, 'utf-8')),
    );
    const parent = membersBySection(
      parse(fs.readFileSync(path.join(API_DIR, 'base-window.md'), 'utf-8')),
    );
    const tree = await transform(childPath);
    const result = membersBySection(tree);

    it('injects exactly the members BrowserWindow does not declare', () => {
      const originalKeys = keysBySection(original);
      const parentKeys = keysBySection(parent);
      const resultKeys = keysBySection(result);

      for (const [section, keys] of parentKeys) {
        const expected = new Set(
          [...keys].filter((key) => !originalKeys.get(section)?.has(key)),
        );
        const actual = new Set(
          [...(resultKeys.get(section) ?? [])].filter(
            (key) => !originalKeys.get(section)?.has(key),
          ),
        );
        assert.deepEqual(
          actual,
          expected,
          `unexpected members injected into ${section}`,
        );
        assert.equal(
          result.get(section).length,
          original.get(section).length + expected.size,
        );
      }

      const injected = injectedHeadings(tree).map((h) => toString(h).trim());
      assert.ok(injected.length > 0, 'BaseWindow-only members are injected');
      assert.ok(injected.some((text) => text.startsWith('win.contentView')));
      console.log(`BrowserWindow injected members: ${injected.join(', ')}`);
    });

    it('keeps every existing member heading and creates no duplicates', () => {
      const headings = allMemberHeadings(tree);
      for (const members of original.values()) {
        for (const member of members) {
          assert.ok(headings.includes(member), `${member} was kept`);
        }
      }
      assert.equal(new Set(headings).size, headings.length);
    });

    it('adds an "Inherited from" note after every injected heading', () => {
      for (const heading of injectedHeadings(tree)) {
        assert.equal(noteAfter(tree, heading), 'Inherited from BaseWindow');
      }
    });

    it('is idempotent', async () => {
      const twice = await transform(childPath, 2);
      assert.deepEqual(twice, tree);
    });
  });

  describe('WebContentsView extends View (real docs)', async () => {
    const childPath = path.join(API_DIR, 'web-contents-view.md');
    const original = membersBySection(
      parse(fs.readFileSync(childPath, 'utf-8')),
    );
    const parent = membersBySection(
      parse(fs.readFileSync(path.join(API_DIR, 'view.md'), 'utf-8')),
    );
    const tree = await transform(childPath);
    const result = membersBySection(tree);

    it('gains every View member, appended after its own members', () => {
      for (const [section, members] of parent) {
        assert.deepEqual(result.get(section), [
          ...(original.get(section) ?? []),
          ...members,
        ]);
      }
      console.log(
        `WebContentsView injected members: ${injectedHeadings(tree)
          .map((h) => toString(h).trim())
          .join(', ')}`,
      );
    });

    it('creates missing sections in canonical order', () => {
      assert.deepEqual(classSections(tree), [
        'new WebContentsView([options])',
        'Instance Events',
        'Instance Properties',
        'Instance Methods',
      ]);
    });

    it('does not copy the parent section intro paragraphs', () => {
      const text = toString(tree);
      assert.ok(!text.includes('Objects created with new View'));
    });

    it('is idempotent', async () => {
      const twice = await transform(childPath, 2);
      assert.deepEqual(twice, tree);
    });
  });

  describe('ImageView extends View (real docs)', async () => {
    const tree = await transform(path.join(API_DIR, 'image-view.md'));

    it('rewrites the receiver of inherited instance members', () => {
      const methods = membersBySection(tree).get('Instance Methods');
      assert.ok(methods.includes('image.setImage(image) Experimental'));
      assert.ok(methods.includes('image.getBounds()'));
      assert.ok(!methods.some((text) => text.startsWith('view.')));
    });

    it('rewrites same-page anchors in inherited bodies', () => {
      const urls: string[] = [];
      const stack: RootContent[] = [...tree.children];
      while (stack.length > 0) {
        const node = stack.pop();
        if (node.type === 'link') urls.push(node.url);
        if ('children' in node) stack.push(...(node.children as RootContent[]));
      }
      assert.ok(urls.includes('#imagegetbounds'));
      assert.ok(!urls.includes('#viewgetbounds'));
    });
  });

  describe('docs left untouched', () => {
    async function assertUntouched(filePath: string) {
      const before = parse(fs.readFileSync(filePath, 'utf-8'));
      const after = await transform(filePath);
      assert.deepEqual(after, before);
    }

    it('WebSocket extends EventTarget (no sibling doc)', async () => {
      await assertUntouched(path.join(API_DIR, 'web-socket.md'));
    });

    it('a class without extends', async () => {
      await assertUntouched(path.join(API_DIR, 'base-window.md'));
    });

    it('a doc outside an api/ directory', async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inherited-'));
      fs.mkdirSync(path.join(dir, 'tutorial'));
      for (const name of ['view.md', 'image-view.md']) {
        fs.copyFileSync(
          path.join(API_DIR, name),
          path.join(dir, 'tutorial', name),
        );
      }
      await assertUntouched(path.join(dir, 'tutorial', 'image-view.md'));
    });
  });

  describe('inheritance chain (synthetic docs)', async () => {
    const dir = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'inherited-')),
      'api',
    );
    fs.mkdirSync(dir);
    const write = (name: string, content: string) =>
      fs.writeFileSync(path.join(dir, name), content);

    write(
      'grand-parent.md',
      `# GrandParent

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
    );
    write(
      'the-parent.md',
      `# TheParent

## Class: TheParent extends \`GrandParent\`

### Static Methods

#### \`TheParent.create()\`

Creates one.

### Instance Methods

#### \`parent.shared()\`

From the parent.
`,
    );
    write(
      'the-child.md',
      `# TheChild

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
    );
    write(
      'loop-a.md',
      `# LoopA

## Class: LoopA extends \`LoopB\`

### Instance Methods

#### \`a.only()\`
`,
    );
    write(
      'loop-b.md',
      `# LoopB

## Class: LoopB extends \`LoopA\`

### Instance Methods

#### \`b.other()\`
`,
    );

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

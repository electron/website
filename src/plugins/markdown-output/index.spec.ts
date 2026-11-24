import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import type { Heading, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';

import apiInheritedMembers, {
  INHERITED_MEMBER_CLASS,
} from '../../transformers/api-inherited-members.ts';
import markdownOutputPlugin, { inheritedMembersMarkdown } from './index.ts';

type Context = Parameters<
  NonNullable<ReturnType<typeof markdownOutputPlugin>['postBuild']>
>[0];

const API_DIR = path.resolve(process.cwd(), 'docs/latest/api');
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

const VIEW = `# View

## Class: View

> A basic View.

### Instance Events

#### Event: 'bounds-changed'

Emitted when the bounds change. See [\`view.getBounds()\`](#viewgetbounds).

### Instance Methods

#### \`view.getBounds()\`

Returns [\`Rectangle\`][rectangle] - The bounds of this View.

#### \`view.setVisible(visible)\`

* \`visible\` boolean - If false, the view will be hidden.

> [!NOTE]
> Hidden views still take part in layout.

[rectangle]: structures/rectangle.md
`;

const IMAGE_VIEW = `---
title: "ImageView"
---

# ImageView

## Class: ImageView extends \`View\`

> Shows an image.

### Instance Methods

#### \`image.setImage(image)\`

* \`image\` NativeImage - The image to show.

[native-image]: native-image.md
`;

/** What `IMAGE_VIEW` is published as: the source with View's members added. */
const IMAGE_VIEW_PUBLISHED = `---
title: "ImageView"
---

# ImageView

## Class: ImageView extends \`View\`

> Shows an image.

### Instance Events

#### Event: 'bounds-changed'

_Inherited from [\`View\`](./view.md)_

Emitted when the bounds change. See [\`view.getBounds()\`](#imagegetbounds).

### Instance Methods

#### \`image.setImage(image)\`

* \`image\` NativeImage - The image to show.

#### \`image.getBounds()\`

_Inherited from [\`View\`](./view.md)_

Returns [\`Rectangle\`][rectangle] - The bounds of this View.

#### \`image.setVisible(visible)\`

_Inherited from [\`View\`](./view.md)_

* \`visible\` boolean - If false, the view will be hidden.

> [!NOTE]
> Hidden views still take part in layout.

[native-image]: native-image.md

[rectangle]: structures/rectangle.md
`;

const APP = `---
title: "app"
---

# app

> Control your application's event lifecycle.

## Events

### Event: 'ready'

Emitted once, when Electron has finished initializing.
`;

/** Writes `files` (by path relative to the new directory) into a temp dir. */
function writeFixtures(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-output-'));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

function headings(tree: Root): string[] {
  return tree.children
    .filter((node): node is Heading => node.type === 'heading')
    .map((heading) => `${heading.depth} ${toString(heading)}`);
}

function isInjected(heading: Heading): boolean {
  const { className } = (heading.data?.hProperties ?? {}) as {
    className?: string[];
  };
  return className?.includes(INHERITED_MEMBER_CLASS) ?? false;
}

/** Parses `markdown` and runs the inherited members transformer over it. */
function transform(markdown: string, filePath: string): Root {
  const body = markdown.replace(FRONTMATTER, '');
  const processor = remark().use(remarkGfm).use(apiInheritedMembers);
  const tree = processor.parse(body);
  processor.runSync(tree, { path: filePath, value: body });
  return tree;
}

describe('markdown-output', () => {
  describe('inheritedMembersMarkdown (synthetic docs)', () => {
    const dir = writeFixtures({
      'api/view.md': VIEW,
      'api/image-view.md': IMAGE_VIEW,
      'api/app.md': APP,
    });

    it('adds inherited members and notes, keeping the source text', () => {
      assert.equal(
        inheritedMembersMarkdown(path.join(dir, 'api/image-view.md')),
        IMAGE_VIEW_PUBLISHED,
      );
    });

    it('returns undefined for docs without a parent class', () => {
      assert.equal(
        inheritedMembersMarkdown(path.join(dir, 'api/view.md')),
        undefined,
      );
      assert.equal(
        inheritedMembersMarkdown(path.join(dir, 'api/app.md')),
        undefined,
      );
    });

    it('returns undefined for its own output (nothing left to inherit)', () => {
      const published = writeFixtures({
        'api/view.md': VIEW,
        'api/image-view.md': IMAGE_VIEW_PUBLISHED,
      });
      assert.equal(
        inheritedMembersMarkdown(path.join(published, 'api/image-view.md')),
        undefined,
      );
    });
  });

  describe('postBuild (synthetic site)', () => {
    const siteDir = writeFixtures({
      'docs/latest/api/view.md': VIEW,
      'docs/latest/api/image-view.md': IMAGE_VIEW,
      'docs/latest/api/app.md': APP,
      // Blog posts are not transformed, even in an api/ directory
      'blog/api/image-view.md': IMAGE_VIEW,
      'blog/api/view.md': VIEW,
    });
    const outDir = path.join(siteDir, 'build');
    const routesPaths = [
      '/docs/latest/api/view',
      '/docs/latest/api/image-view',
      '/docs/latest/api/app',
      '/blog/api/image-view',
    ];
    for (const routePath of routesPaths) {
      fs.mkdirSync(path.join(outDir, routePath), { recursive: true });
      fs.writeFileSync(path.join(outDir, routePath, 'index.html'), '');
    }
    markdownOutputPlugin().postBuild({
      siteDir,
      outDir,
      routesPaths,
    } as Context);

    const output = (routePath: string) =>
      fs.readFileSync(path.join(outDir, routePath, 'index.md'), 'utf-8');

    it('writes the inherited members into a child class index.md', () => {
      assert.equal(output('/docs/latest/api/image-view'), IMAGE_VIEW_PUBLISHED);
    });

    it('copies every other doc byte for byte', () => {
      assert.equal(output('/docs/latest/api/view'), VIEW);
      assert.equal(output('/docs/latest/api/app'), APP);
      assert.equal(output('/blog/api/image-view'), IMAGE_VIEW);
    });
  });

  describe('real docs (docs/latest/api), whatever they contain', () => {
    const files = fs
      .readdirSync(API_DIR)
      .filter((name) => name.endsWith('.md'))
      .map((name) => path.join(API_DIR, name));

    it('publishes the members the HTML page shows, with a note on each', () => {
      for (const filePath of files) {
        const source = fs.readFileSync(filePath, 'utf-8');
        const transformed = transform(source, filePath);
        const injected = transformed.children.filter(
          (node): node is Heading =>
            node.type === 'heading' && isInjected(node),
        );
        const published = inheritedMembersMarkdown(filePath);
        const name = path.basename(filePath);

        if (injected.length === 0) {
          assert.equal(published, undefined, name);
          continue;
        }
        assert.notEqual(published, undefined, name);
        assert.ok(published.startsWith(source.match(FRONTMATTER)[0]), name);
        const tree = remark()
          .use(remarkGfm)
          .parse(published.replace(FRONTMATTER, ''));
        assert.deepEqual(headings(tree), headings(transformed), name);
        assert.equal(
          published.match(/^_Inherited from \[`\w+`\]\(\.\/[\w-]+\.md\)_$/gm)
            ?.length,
          injected.length,
          name,
        );
      }
    });
  });
});

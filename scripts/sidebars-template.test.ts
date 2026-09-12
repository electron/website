import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  createSidebars,
  filterSidebarItems,
  filterSidebars,
} = require('../sidebars-template.js');

const collectDocIds = (items: unknown[]): string[] =>
  items.flatMap((item) => {
    if (typeof item === 'string') return [item];
    if (typeof item !== 'object' || item === null) return [];
    const record = item as Record<string, unknown>;
    if (record.type === 'doc') return [String(record.id)];
    if (record.type === 'category') {
      const link = record.link as { type?: string; id?: string } | undefined;
      return [
        ...(link?.type === 'doc' ? [String(link.id)] : []),
        ...collectDocIds(record.items as unknown[]),
      ];
    }
    return [];
  });

describe('createSidebars', () => {
  it('prefixes every doc id with the given prefix', () => {
    const latest = createSidebars('latest/');
    const versioned = createSidebars('v44.3.0/');

    const latestIds = collectDocIds([...latest.docs, ...latest.api]);
    const versionedIds = collectDocIds([...versioned.docs, ...versioned.api]);

    assert.ok(latestIds.length > 200);
    assert.ok(latestIds.every((id) => id.startsWith('latest/')));
    assert.deepEqual(
      versionedIds,
      latestIds.map((id) => id.replace(/^latest\//, 'v44.3.0/')),
    );
  });

  it('produces the same structure for every prefix', () => {
    const a = JSON.stringify(createSidebars('latest/')).replaceAll(
      'latest/',
      'X/',
    );
    const b = JSON.stringify(createSidebars('v1.0.0/')).replaceAll(
      'v1.0.0/',
      'X/',
    );
    assert.equal(a, b);
  });
});

describe('filterSidebarItems', () => {
  const items = [
    'v1/keep',
    'v1/drop',
    { type: 'doc', id: 'v1/keep-obj', customProps: { platforms: ['mac'] } },
    { type: 'doc', id: 'v1/drop-obj', customProps: { deprecated: true } },
    {
      type: 'category',
      label: 'Kept category',
      link: { type: 'doc', id: 'v1/drop-link' },
      items: ['v1/keep-nested', 'v1/drop-nested'],
    },
    {
      type: 'category',
      label: 'Dropped category',
      items: ['v1/drop-a', { type: 'doc', id: 'v1/drop-b' }],
    },
    { type: 'link', label: 'External', href: 'https://example.com' },
  ];
  const exists = (id: string) => id.includes('keep');

  it('drops missing docs, empty categories and links to missing docs', () => {
    assert.deepEqual(filterSidebarItems(items, exists), [
      'v1/keep',
      { type: 'doc', id: 'v1/keep-obj', customProps: { platforms: ['mac'] } },
      { type: 'category', label: 'Kept category', items: ['v1/keep-nested'] },
      { type: 'link', label: 'External', href: 'https://example.com' },
    ]);
  });

  it('keeps everything when all docs exist', () => {
    assert.deepEqual(
      filterSidebarItems(items, () => true),
      items,
    );
  });

  it('does not mutate the input', () => {
    const before = JSON.stringify(items);
    filterSidebarItems(items, exists);
    assert.equal(JSON.stringify(items), before);
  });
});

describe('filterSidebars', () => {
  it('filters every sidebar and removes sidebars that end up empty', () => {
    const sidebars = createSidebars('v1/');
    const filtered = filterSidebars(sidebars, (id: string) =>
      id.startsWith('v1/api/'),
    );

    assert.deepEqual(collectDocIds(filtered.docs), []);
    assert.ok(collectDocIds(filtered.api).length > 100);
    assert.ok(
      collectDocIds(filtered.api).every((id) => id.startsWith('v1/api/')),
    );
  });
});

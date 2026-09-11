import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildDocsVersionEntries,
  newestPerMajor,
  sortVersionsDescending,
} from './docs-versions-list.ts';

describe('sortVersionsDescending', () => {
  it('sorts by semver, not lexicographically, and drops junk', () => {
    assert.deepEqual(
      sortVersionsDescending(['v9.0.0', 'v44.3.0', 'v44.10.0', 'nope']),
      ['v44.10.0', 'v44.3.0', 'v9.0.0'],
    );
  });
});

describe('newestPerMajor', () => {
  it('keeps the newest release of each major, newest major first', () => {
    assert.deepEqual(
      newestPerMajor(['v43.0.0', 'v44.1.0', 'v43.2.1', 'v44.3.0', 'v38.0.0']),
      ['v44.3.0', 'v43.2.1', 'v38.0.0'],
    );
  });
});

describe('buildDocsVersionEntries', () => {
  const data = {
    latest: 'v44.3.0',
    versions: ['v44.3.0', 'v44.2.1', 'v43.1.0', 'v38.0.0'],
    next: { sha: 'a'.repeat(40), updated: '2026-09-11T00:00:00Z' },
  };

  it('lists latest, next and the newest release per major', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'latest').map((e) => e.version),
      ['latest', 'next', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
    assert.equal(
      buildDocsVersionEntries(data, 'latest')[0].label,
      'latest (v44.3.0)',
    );
  });

  it('omits next when it is not published', () => {
    const { next: _next, ...withoutNext } = data;
    assert.deepEqual(
      buildDocsVersionEntries(withoutNext, 'latest').map((e) => e.version),
      ['latest', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
  });

  it('always includes the version being viewed', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v44.2.1').map((e) => e.version),
      ['latest', 'next', 'v44.3.0', 'v44.2.1', 'v43.1.0', 'v38.0.0'],
    );
  });

  it('does not invent versions that were never published', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v40.0.0').map((e) => e.version),
      ['latest', 'next', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
  });
});

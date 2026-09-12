import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildDocsVersionEntries,
  isEntryForVersion,
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
    next: 'v45.0.0-alpha.6',
    versions: ['v44.3.0', 'v44.2.1', 'v43.1.0', 'v38.0.0'],
    prereleases: ['v45.0.0-alpha.6', 'v45.0.0-alpha.5'],
    dev: { sha: 'a'.repeat(40), updated: '2026-09-11T00:00:00Z' },
  };

  it('lists latest, next, dev and the newest release per major', () => {
    const entries = buildDocsVersionEntries(data, 'latest');
    assert.deepEqual(
      entries.map((e) => e.version),
      ['latest', 'next', 'dev', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
    assert.equal(entries[0].label, 'latest (v44.3.0)');
    assert.deepEqual(entries[1], {
      version: 'next',
      label: 'next (v45.0.0-alpha.6)',
      resolvesTo: 'v45.0.0-alpha.6',
    });
    assert.equal(entries[2].label, 'dev (unreleased)');
  });

  it('hides next when it is null and dev when it is not published', () => {
    assert.deepEqual(
      buildDocsVersionEntries(
        { ...data, next: null, dev: undefined },
        'latest',
      ).map((e) => e.version),
      ['latest', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
  });

  it('copes with a versions.json that predates next / prereleases / dev', () => {
    assert.deepEqual(
      buildDocsVersionEntries(
        { latest: 'v44.3.0', versions: ['v44.3.0', 'v43.1.0'] },
        'v45.0.0-alpha.6',
      ).map((e) => e.version),
      ['latest', 'v44.3.0', 'v43.1.0'],
    );
  });

  it('always includes the stable version being viewed', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v44.2.1').map((e) => e.version),
      ['latest', 'next', 'dev', 'v44.3.0', 'v44.2.1', 'v43.1.0', 'v38.0.0'],
    );
  });

  it('highlights next when viewing the prerelease it resolves to', () => {
    const entries = buildDocsVersionEntries(data, 'v45.0.0-alpha.6');
    assert.deepEqual(
      entries.map((e) => e.version),
      ['latest', 'next', 'dev', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
    assert.deepEqual(
      entries.filter((e) => isEntryForVersion(e, 'v45.0.0-alpha.6')),
      [entries[1]],
    );
  });

  it('adds an entry for an older published prerelease being viewed', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v45.0.0-alpha.5').map((e) => e.version),
      [
        'latest',
        'next',
        'dev',
        'v45.0.0-alpha.5',
        'v44.3.0',
        'v43.1.0',
        'v38.0.0',
      ],
    );
  });

  it('does not invent versions that were never published', () => {
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v40.0.0').map((e) => e.version),
      ['latest', 'next', 'dev', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
    assert.deepEqual(
      buildDocsVersionEntries(data, 'v45.0.0-beta.1').map((e) => e.version),
      ['latest', 'next', 'dev', 'v44.3.0', 'v43.1.0', 'v38.0.0'],
    );
  });
});

describe('isEntryForVersion', () => {
  it('matches the entry itself or the version an alias resolves to', () => {
    const next = {
      version: 'next',
      label: 'next (v45.0.0-alpha.6)',
      resolvesTo: 'v45.0.0-alpha.6',
    };
    assert.equal(isEntryForVersion(next, 'next'), true);
    assert.equal(isEntryForVersion(next, 'v45.0.0-alpha.6'), true);
    assert.equal(isEntryForVersion(next, 'v45.0.0-alpha.5'), false);
    assert.equal(
      isEntryForVersion({ version: 'dev', label: 'dev' }, 'dev'),
      true,
    );
  });
});

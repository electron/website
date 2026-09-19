import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildVersionsJson,
  nextVersion,
  sortReleasesDescending,
  versionsFromBlobNames,
} from './build-versions-json.ts';

describe('sortReleasesDescending', () => {
  it('orders by major.minor.patch, then alpha < beta, numeric segments numerically', () => {
    assert.deepEqual(
      sortReleasesDescending([
        'v45.0.0-alpha.6',
        'v45.0.0-beta.1',
        'v45.0.0-alpha.10',
        'v44.3.0',
        'v45.0.0-alpha.9',
        'v46.0.0-alpha.1',
        'v45.0.0-beta.1',
      ]),
      [
        'v46.0.0-alpha.1',
        'v45.0.0-beta.1',
        'v45.0.0-alpha.10',
        'v45.0.0-alpha.9',
        'v45.0.0-alpha.6',
        'v44.3.0',
      ],
    );
  });

  it('sorts a release after all of its prereleases', () => {
    assert.deepEqual(
      sortReleasesDescending(['v45.0.0-beta.3', 'v45.0.0', 'v45.0.0-alpha.1']),
      ['v45.0.0', 'v45.0.0-beta.3', 'v45.0.0-alpha.1'],
    );
  });
});

describe('versionsFromBlobNames', () => {
  it('splits unique stable and prerelease versions from prefixes and blob names, newest first', () => {
    assert.deepEqual(
      versionsFromBlobNames([
        'docs/v38.0.0/',
        'docs/v44.3.0/index.html',
        'docs/v44.3.0/api/app/index.html',
        'docs/v44.10.0/',
        'docs/v9.0.0/',
        'docs/v45.0.0-alpha.5/',
        'docs/v45.0.0-alpha.6/index.html',
        'docs/v45.0.0-alpha.6/api/app/index.html',
        'docs/v45.0.0-alpha.10/',
        'docs/v45.0.0-nightly.20260912/',
        'docs/dev/index.html',
        'docs/next/index.html',
        'docs/latest/index.html',
        'docs/versions.json',
        'assets/js/main.js',
      ]),
      {
        versions: ['v44.10.0', 'v44.3.0', 'v38.0.0', 'v9.0.0'],
        prereleases: ['v45.0.0-alpha.10', 'v45.0.0-alpha.6', 'v45.0.0-alpha.5'],
      },
    );
  });
});

describe('nextVersion', () => {
  it('is the newest prerelease when it is newer than latest', () => {
    assert.equal(
      nextVersion('v44.3.0', ['v45.0.0-alpha.5', 'v45.0.0-alpha.6']),
      'v45.0.0-alpha.6',
    );
  });

  it('is null once the stable release of that line is out', () => {
    assert.equal(
      nextVersion('v45.0.0', ['v45.0.0-alpha.6', 'v45.0.0-beta.2']),
      null,
    );
    assert.equal(nextVersion('v45.0.1', ['v45.0.0-beta.2']), null);
  });

  it('is null without prereleases, and the newest prerelease without a stable', () => {
    assert.equal(nextVersion('v44.3.0', []), null);
    assert.equal(nextVersion(null, []), null);
    assert.equal(nextVersion(null, ['v45.0.0-alpha.1']), 'v45.0.0-alpha.1');
  });
});

describe('buildVersionsJson', () => {
  it('derives latest and next and lists versions and prereleases newest first', () => {
    const json = buildVersionsJson([
      'docs/v44.2.1/',
      'docs/v44.3.0/',
      'docs/v45.0.0-alpha.5/',
      'docs/v45.0.0-alpha.6/',
    ]);
    assert.deepEqual(json, {
      latest: 'v44.3.0',
      next: 'v45.0.0-alpha.6',
      versions: ['v44.3.0', 'v44.2.1'],
      prereleases: ['v45.0.0-alpha.6', 'v45.0.0-alpha.5'],
    });
    assert.deepEqual(Object.keys(json), [
      'latest',
      'next',
      'versions',
      'prereleases',
    ]);
  });

  it('sets next to null when the prereleases are superseded by latest', () => {
    const json = buildVersionsJson(['docs/v45.0.0/', 'docs/v45.0.0-beta.1/']);
    assert.equal(json.latest, 'v45.0.0');
    assert.equal(json.next, null);
    assert.deepEqual(json.prereleases, ['v45.0.0-beta.1']);
  });

  it('is empty-safe', () => {
    assert.deepEqual(buildVersionsJson([]), {
      latest: null,
      next: null,
      versions: [],
      prereleases: [],
    });
  });

  it('includes dev when a sha is known', () => {
    const json = buildVersionsJson(['docs/v44.3.0/'], {
      sha: `${'a'.repeat(40)}\n`,
      updated: '2026-09-11T04:00:00+00:00',
    });
    assert.deepEqual(json.dev, {
      sha: 'a'.repeat(40),
      updated: '2026-09-11T04:00:00+00:00',
    });
  });

  it('omits dev without a sha', () => {
    assert.equal(
      buildVersionsJson(['docs/v44.3.0/'], { sha: '', updated: '' }).dev,
      undefined,
    );
    assert.equal(
      buildVersionsJson(['docs/v44.3.0/'], { sha: ' \n' }).dev,
      undefined,
    );
  });
});

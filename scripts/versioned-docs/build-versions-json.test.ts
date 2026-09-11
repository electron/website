import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildVersionsJson,
  versionsFromBlobNames,
} from './build-versions-json.ts';

describe('versionsFromBlobNames', () => {
  it('extracts unique release versions from prefixes and blob names, newest first', () => {
    assert.deepEqual(
      versionsFromBlobNames([
        'docs/v38.0.0/',
        'docs/v44.3.0/index.html',
        'docs/v44.3.0/api/app/index.html',
        'docs/v44.10.0/',
        'docs/v9.0.0/',
        'docs/next/index.html',
        'docs/latest/index.html',
        'docs/versions.json',
        'assets/js/main.js',
      ]),
      ['v44.10.0', 'v44.3.0', 'v38.0.0', 'v9.0.0'],
    );
  });
});

describe('buildVersionsJson', () => {
  it('derives latest from the highest published version', () => {
    const json = buildVersionsJson(['docs/v44.2.1/', 'docs/v44.3.0/']);
    assert.deepEqual(json, {
      latest: 'v44.3.0',
      versions: ['v44.3.0', 'v44.2.1'],
    });
  });

  it('is empty-safe', () => {
    assert.deepEqual(buildVersionsJson([]), { latest: null, versions: [] });
  });

  it('includes next when a sha is known', () => {
    const json = buildVersionsJson(['docs/v44.3.0/'], {
      sha: `${'a'.repeat(40)}\n`,
      updated: '2026-09-11T04:00:00+00:00',
    });
    assert.deepEqual(json.next, {
      sha: 'a'.repeat(40),
      updated: '2026-09-11T04:00:00+00:00',
    });
  });

  it('omits next without a sha', () => {
    assert.equal(
      buildVersionsJson(['docs/v44.3.0/'], { sha: '', updated: '' }).next,
      undefined,
    );
  });
});

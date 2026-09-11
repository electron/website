import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { selectMissingVersions } from './find-missing.ts';

const all = [
  '37.5.0',
  '38.0.0-beta.3',
  '38.0.0',
  '38.0.1',
  '38.1.0',
  '39.0.0-alpha.1',
  '39.0.0',
  '39.1.0',
  '40.0.0-nightly.20260101',
];

describe('selectMissingVersions', () => {
  it('returns unpublished stable releases >= the minimum, oldest first, plus next', () => {
    assert.deepEqual(selectMissingVersions(all, ['v38.0.1']), [
      'v38.0.0',
      'v38.1.0',
      'v39.0.0',
      'v39.1.0',
      'next',
    ]);
  });

  it('ignores pre-releases and releases older than the minimum', () => {
    const result = selectMissingVersions(all, []);
    assert.ok(!result.includes('v37.5.0'));
    assert.ok(!result.some((v) => v.includes('-')));
  });

  it('accepts published versions with or without the v prefix', () => {
    assert.deepEqual(
      selectMissingVersions(all, ['38.0.0', 'v38.0.1', 'v38.1.0', 'v39.0.0']),
      ['v39.1.0', 'next'],
    );
  });

  it('caps the number of releases per run but always includes next', () => {
    assert.deepEqual(selectMissingVersions(all, [], { cap: 2 }), [
      'v38.0.0',
      'v38.0.1',
      'next',
    ]);
  });

  it('only returns next when everything is published', () => {
    assert.deepEqual(
      selectMissingVersions(all, [
        'v38.0.0',
        'v38.0.1',
        'v38.1.0',
        'v39.0.0',
        'v39.1.0',
      ]),
      ['next'],
    );
  });

  it('honours a custom minimum version', () => {
    assert.deepEqual(
      selectMissingVersions(all, [], { minVersion: 'v39.0.0' }),
      ['v39.0.0', 'v39.1.0', 'next'],
    );
  });
});

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
  '40.0.0-alpha.1',
  '40.0.0-alpha.2',
  '40.0.0-beta.1',
];

const allStable = ['v38.0.0', 'v38.0.1', 'v38.1.0', 'v39.0.0', 'v39.1.0'];
const allNextLine = ['v40.0.0-beta.1', 'v40.0.0-alpha.2', 'v40.0.0-alpha.1'];

describe('selectMissingVersions', () => {
  it('returns the unreleased major prereleases newest first, then unpublished stable releases oldest first, plus dev', () => {
    assert.deepEqual(selectMissingVersions(all, ['v38.0.1']), [
      'v40.0.0-beta.1',
      'v40.0.0-alpha.2',
      'v40.0.0-alpha.1',
      'v38.0.0',
      'v38.1.0',
      'v39.0.0',
      'v39.1.0',
      'dev',
    ]);
  });

  it('never backfills prereleases of majors that shipped a stable release, nightlies, or releases older than the minimum', () => {
    const result = selectMissingVersions(all, []);
    assert.ok(!result.includes('v37.5.0'));
    assert.ok(!result.includes('v38.0.0-beta.3'));
    assert.ok(!result.includes('v39.0.0-alpha.1'));
    assert.ok(!result.some((v) => v.includes('nightly')));
  });

  it('stops gap-filling a line once its stable release exists', () => {
    assert.deepEqual(
      selectMissingVersions([...all, '40.0.0'], [...allStable, 'v40.0.0']),
      ['dev'],
    );
  });

  it('gap-fills several unreleased majors', () => {
    assert.deepEqual(
      selectMissingVersions(
        [...all, '41.0.0-alpha.1'],
        [...allStable, ...allNextLine],
      ),
      ['v41.0.0-alpha.1', 'dev'],
    );
  });

  it('accepts published versions with or without the v prefix', () => {
    assert.deepEqual(
      selectMissingVersions(all, [
        '38.0.0',
        'v38.0.1',
        'v38.1.0',
        'v39.0.0',
        ...allNextLine,
      ]),
      ['v39.1.0', 'dev'],
    );
    assert.deepEqual(
      selectMissingVersions(all, [
        ...allStable,
        '40.0.0-alpha.1',
        '40.0.0-alpha.2',
      ]),
      ['v40.0.0-beta.1', 'dev'],
    );
  });

  it('caps the total number of releases per run but always includes dev', () => {
    assert.deepEqual(selectMissingVersions(all, [], { cap: 2 }), [
      'v40.0.0-beta.1',
      'v40.0.0-alpha.2',
      'dev',
    ]);
    assert.deepEqual(selectMissingVersions(all, allNextLine, { cap: 2 }), [
      'v38.0.0',
      'v38.0.1',
      'dev',
    ]);
  });

  it('only returns dev when everything is published', () => {
    assert.deepEqual(
      selectMissingVersions(all, [...allStable, ...allNextLine]),
      ['dev'],
    );
  });

  it('honours a custom minimum version', () => {
    assert.deepEqual(
      selectMissingVersions(all, allNextLine, { minVersion: 'v39.0.0' }),
      ['v39.0.0', 'v39.1.0', 'dev'],
    );
  });
});

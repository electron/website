import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  docsVersionUrl,
  fiddleVersionForDocsVersion,
  isReleaseVersion,
  isValidDocsVersion,
  parseDocsVersionPath,
  replaceDocsVersionInPath,
  sourceRefForVersion,
} from './docs-version.ts';

describe('isReleaseVersion / isValidDocsVersion', () => {
  it('accepts vX.Y.Z, latest and next', () => {
    assert.equal(isReleaseVersion('v44.3.0'), true);
    assert.equal(isReleaseVersion('44.3.0'), false);
    assert.equal(isReleaseVersion('v44.3.0-beta.1'), false);
    assert.equal(isReleaseVersion('latest'), false);

    assert.equal(isValidDocsVersion('latest'), true);
    assert.equal(isValidDocsVersion('next'), true);
    assert.equal(isValidDocsVersion('v38.0.0'), true);
    assert.equal(isValidDocsVersion('main'), false);
    assert.equal(isValidDocsVersion('v38'), false);
  });
});

describe('parseDocsVersionPath', () => {
  it('extracts the version folder from docs source file paths', () => {
    assert.deepEqual(
      parseDocsVersionPath('/home/user/website/docs/v44.3.0/api/app.md'),
      { version: 'v44.3.0', rest: 'api/app.md' },
    );
    assert.deepEqual(
      parseDocsVersionPath('/home/user/website/docs/latest/tutorial/ipc.md'),
      { version: 'latest', rest: 'tutorial/ipc.md' },
    );
    assert.deepEqual(parseDocsVersionPath('docs/next/faq.md'), {
      version: 'next',
      rest: 'faq.md',
    });
  });

  it('handles Windows separators', () => {
    assert.deepEqual(
      parseDocsVersionPath('C:\\website\\docs\\v44.3.0\\api\\app.md'),
      { version: 'v44.3.0', rest: 'api/app.md' },
    );
  });

  it('extracts the version from URL paths', () => {
    assert.deepEqual(parseDocsVersionPath('/docs/v44.3.0/api/dialog'), {
      version: 'v44.3.0',
      rest: 'api/dialog',
    });
    assert.deepEqual(parseDocsVersionPath('/docs/latest/'), {
      version: 'latest',
      rest: '',
    });
    assert.deepEqual(parseDocsVersionPath('/docs/latest'), {
      version: 'latest',
      rest: '',
    });
  });

  it('understands the i18n mirror of the docs folder', () => {
    assert.deepEqual(
      parseDocsVersionPath(
        '/site/i18n/de/docusaurus-plugin-content-docs/current/latest/api/app.md',
      ),
      { version: 'latest', rest: 'api/app.md' },
    );
  });

  it('returns undefined for non-docs paths', () => {
    assert.equal(parseDocsVersionPath('/blog/electron-44-0'), undefined);
    assert.equal(parseDocsVersionPath('/site/src/pages/index.tsx'), undefined);
    assert.equal(parseDocsVersionPath('/'), undefined);
  });
});

describe('sourceRefForVersion / fiddleVersionForDocsVersion', () => {
  it('links latest to the latest stable tag, next to main, releases to their tag', () => {
    assert.equal(sourceRefForVersion('latest', '44.3.0'), 'v44.3.0');
    assert.equal(sourceRefForVersion('next', '44.3.0'), 'main');
    assert.equal(sourceRefForVersion('v38.0.0', '44.3.0'), 'v38.0.0');
  });

  it('uses the release for fiddles, falling back to latest stable', () => {
    assert.equal(fiddleVersionForDocsVersion('v38.0.0', '44.3.0'), '38.0.0');
    assert.equal(fiddleVersionForDocsVersion('latest', '44.3.0'), '44.3.0');
    assert.equal(fiddleVersionForDocsVersion('next', '44.3.0'), '44.3.0');
  });
});

describe('replaceDocsVersionInPath / docsVersionUrl', () => {
  it('swaps the version segment and keeps the rest of the path', () => {
    assert.equal(
      replaceDocsVersionInPath('/docs/v44.3.0/api/dialog', 'latest'),
      '/docs/latest/api/dialog',
    );
    assert.equal(
      replaceDocsVersionInPath('/docs/latest/', 'v38.0.0'),
      '/docs/v38.0.0/',
    );
    assert.equal(
      replaceDocsVersionInPath('/docs/next/api/app', 'v44.3.0'),
      '/docs/v44.3.0/api/app',
    );
    assert.equal(replaceDocsVersionInPath('/blog/', 'latest'), '/blog/');
  });

  it('builds absolute URLs on the main website', () => {
    assert.equal(
      docsVersionUrl('/docs/v44.3.0/api/dialog', 'latest'),
      'https://www.electronjs.org/docs/latest/api/dialog',
    );
  });
});

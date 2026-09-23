import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  docsVersionUrl,
  fiddleVersionForDocsVersion,
  invalidDocsVersionHint,
  isPrereleaseVersion,
  isReleaseVersion,
  isStableVersion,
  isValidDocsVersion,
  parseDocsVersionPath,
  replaceDocsVersionInPath,
  sourceRefForVersion,
} from './docs-version.ts';

describe('isStableVersion / isPrereleaseVersion / isReleaseVersion', () => {
  it('tells stable tags, alpha/beta tags and everything else apart', () => {
    assert.equal(isStableVersion('v44.3.0'), true);
    assert.equal(isStableVersion('44.3.0'), false);
    assert.equal(isStableVersion('v45.0.0-alpha.6'), false);
    assert.equal(isStableVersion('latest'), false);

    assert.equal(isPrereleaseVersion('v45.0.0-alpha.6'), true);
    assert.equal(isPrereleaseVersion('v45.0.0-beta.1'), true);
    assert.equal(isPrereleaseVersion('v45.0.0'), false);
    assert.equal(isPrereleaseVersion('v45.0.0-nightly.20260912'), false);
    assert.equal(isPrereleaseVersion('v45.0.0-alpha'), false);
    assert.equal(isPrereleaseVersion('v45.0.0-rc.1'), false);

    assert.equal(isReleaseVersion('v44.3.0'), true);
    assert.equal(isReleaseVersion('v45.0.0-beta.2'), true);
    assert.equal(isReleaseVersion('v45.0.0-nightly.20260912'), false);
    assert.equal(isReleaseVersion('dev'), false);
    assert.equal(isReleaseVersion('next'), false);
  });
});

describe('isValidDocsVersion', () => {
  it('accepts latest, dev and release tags', () => {
    assert.equal(isValidDocsVersion('latest'), true);
    assert.equal(isValidDocsVersion('dev'), true);
    assert.equal(isValidDocsVersion('v38.0.0'), true);
    assert.equal(isValidDocsVersion('v45.0.0-alpha.6'), true);
    assert.equal(isValidDocsVersion('v45.0.0-beta.10'), true);
  });

  it('rejects next (an alias), nightlies, bare branches and partial versions', () => {
    assert.equal(isValidDocsVersion('next'), false);
    assert.equal(isValidDocsVersion('v45.0.0-nightly.20260912'), false);
    assert.equal(isValidDocsVersion('main'), false);
    assert.equal(isValidDocsVersion('v38'), false);
    assert.equal(isValidDocsVersion(''), false);
  });
});

describe('invalidDocsVersionHint', () => {
  it('points next at dev / the prerelease tag and explains nightlies', () => {
    assert.match(invalidDocsVersionHint('next')!, /alias/);
    assert.match(invalidDocsVersionHint('next')!, /"dev"/);
    assert.match(
      invalidDocsVersionHint('v45.0.0-nightly.20260912')!,
      /Nightly/,
    );
    assert.equal(invalidDocsVersionHint('v38'), undefined);
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
    assert.deepEqual(parseDocsVersionPath('docs/dev/faq.md'), {
      version: 'dev',
      rest: 'faq.md',
    });
    assert.deepEqual(parseDocsVersionPath('docs/v45.0.0-alpha.6/api/app.md'), {
      version: 'v45.0.0-alpha.6',
      rest: 'api/app.md',
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
  it('links latest to the latest stable tag, dev to main, releases to their tag', () => {
    assert.equal(sourceRefForVersion('latest', '44.3.0'), 'v44.3.0');
    assert.equal(sourceRefForVersion('dev', '44.3.0'), 'main');
    assert.equal(sourceRefForVersion('v38.0.0', '44.3.0'), 'v38.0.0');
    assert.equal(
      sourceRefForVersion('v45.0.0-alpha.6', '44.3.0'),
      'v45.0.0-alpha.6',
    );
  });

  it('uses the release (stable or prerelease) for fiddles, falling back to latest stable', () => {
    assert.equal(fiddleVersionForDocsVersion('v38.0.0', '44.3.0'), '38.0.0');
    assert.equal(
      fiddleVersionForDocsVersion('v45.0.0-beta.1', '44.3.0'),
      '45.0.0-beta.1',
    );
    assert.equal(fiddleVersionForDocsVersion('latest', '44.3.0'), '44.3.0');
    assert.equal(fiddleVersionForDocsVersion('dev', '44.3.0'), '44.3.0');
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
      replaceDocsVersionInPath('/docs/dev/api/app', 'v44.3.0'),
      '/docs/v44.3.0/api/app',
    );
    assert.equal(
      replaceDocsVersionInPath('/docs/v45.0.0-alpha.6/api/app', 'next'),
      '/docs/next/api/app',
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

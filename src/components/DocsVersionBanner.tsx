/**
 * Banner shown above every doc page of the per-version builds
 * (`/docs/next`, `/docs/vX.Y.Z`) pointing back to the canonical
 * `/docs/latest` copy of the same page. Renders nothing on `latest`.
 */
import React from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {
  LATEST_VERSION,
  NEXT_VERSION,
  docsVersionUrl,
} from '../util/docs-version.ts';
import styles from './DocsVersionBanner.module.scss';

export default function DocsVersionBanner() {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  const { pathname } = useLocation();
  const version = String(customFields?.electronDocsVersion ?? LATEST_VERSION);

  if (version === LATEST_VERSION) {
    return null;
  }

  const isNext = version === NEXT_VERSION;
  const latestUrl = docsVersionUrl(pathname, LATEST_VERSION);

  return (
    <div
      className={clsx(
        'alert',
        isNext ? 'alert--warning' : 'alert--info',
        styles.banner,
      )}
      role="note"
    >
      {isNext ? (
        <>
          You&apos;re viewing unreleased documentation for Electron, built from
          the <code>main</code> branch.
        </>
      ) : (
        <>
          You&apos;re viewing documentation for Electron{' '}
          <strong>{version}</strong>.
        </>
      )}{' '}
      The latest stable docs are at <a href={latestUrl}>/docs/latest</a>.
    </div>
  );
}

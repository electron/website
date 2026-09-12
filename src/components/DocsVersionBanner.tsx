/**
 * Banner shown above every doc page of the per-version builds
 * (`/docs/dev`, `/docs/vX.Y.Z`) pointing back to the canonical
 * `/docs/latest` copy of the same page. Renders nothing on `latest`.
 */
import React from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import {
  DEV_VERSION,
  LATEST_VERSION,
  docsVersionUrl,
  isPrereleaseVersion,
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

  const isDev = version === DEV_VERSION;
  const isPrerelease = isPrereleaseVersion(version);
  const latestUrl = docsVersionUrl(pathname, LATEST_VERSION);

  let message: React.ReactNode;
  if (isDev) {
    message = (
      <>
        You&apos;re viewing unreleased documentation for Electron, built from
        the <code>main</code> branch.
      </>
    );
  } else if (isPrerelease) {
    message = (
      <>
        You&apos;re viewing documentation for a prerelease of Electron,{' '}
        <strong>{version}</strong>.
      </>
    );
  } else {
    message = (
      <>
        You&apos;re viewing documentation for Electron{' '}
        <strong>{version}</strong>.
      </>
    );
  }

  return (
    <div
      className={clsx(
        'alert',
        isDev || isPrerelease ? 'alert--warning' : 'alert--info',
        styles.banner,
      )}
      role="note"
    >
      {message} The latest stable docs are at{' '}
      <a href={latestUrl}>/docs/latest</a>.
    </div>
  );
}

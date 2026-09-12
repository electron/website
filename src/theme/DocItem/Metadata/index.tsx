/**
 * Wraps `@theme/DocItem/Metadata` so that, in the per-version builds, every
 * doc page declares its `/docs/latest/` counterpart as the canonical URL.
 *
 * Docusaurus emits a `<link rel="canonical">` for the page's own URL from
 * `@theme/SiteMetadata`; react-helmet only keeps one canonical link and the
 * innermost `<Head>` wins, so this replaces it rather than adding a second.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Metadata from '@theme-original/DocItem/Metadata';

import { LATEST_VERSION, docsVersionUrl } from '../../../util/docs-version.ts';

export default function MetadataWrapper() {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  const { metadata } = useDoc();
  const version = String(customFields?.electronDocsVersion ?? LATEST_VERSION);

  return (
    <>
      <Metadata />
      {version !== LATEST_VERSION && (
        <Head>
          <link
            rel="canonical"
            href={docsVersionUrl(metadata.permalink, LATEST_VERSION)}
          />
        </Head>
      )}
    </>
  );
}

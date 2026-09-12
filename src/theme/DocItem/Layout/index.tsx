/**
 * Wraps `@theme/DocItem/Layout` to show the docs version banner at the top
 * of every doc page. The banner only renders in the per-version builds
 * (see `src/components/DocsVersionBanner.tsx`).
 */
import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type { Props } from '@theme/DocItem/Layout';

import DocsVersionBanner from '../../../components/DocsVersionBanner.tsx';

export default function LayoutWrapper(props: Props) {
  return (
    <>
      <DocsVersionBanner />
      <Layout {...props} />
    </>
  );
}

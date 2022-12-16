/**
 * WARNING: This is considered an 'unsafe' swizzle.
 * This component will override Docusaurus' own `@theme/TOC` export.
 *
 * This is a relatively safe change because it re-uses the
 * Docusaurus' underlying TOC and TOCHeadings components,
 * but any change to the TOCItem type will affect our cleaning
 * methods.
 */

import React from 'react';
import TOC from '@theme-original/TOC';
import { cleanTOC } from '../../util/cleanHeadings';
import { TOCItem } from '@docusaurus/mdx-loader';

export default function TOCWrapper(props: { toc: TOCItem[] }) {
  const cleanedTOC = cleanTOC(props.toc);
  return (
    <>
      <TOC {...props} toc={cleanedTOC} />
    </>
  );
}


/**
 * WARNING: This is considered an 'unsafe' custom swizzle
 * during the Docusaurus 2 beta phase. This component will
 * override Docusaurus' own `@theme/TOC` export.
 * 
 * This is a relatively safe change because it re-uses the
 * Docusaurus' underlying TOC and TOCHeadings components,
 * but any change to the TOCItem type will affect our cleaning
 * methods.
 */

//@ts-check
import React from 'react';

//@ts-expect-error
import OriginalTOC from '@theme-original/TOC';
import { cleanTOC } from '../../util/cleanHeadings';

function TOC(props) {
  const cleanedTOC = cleanTOC(props.toc);
  return <OriginalTOC {...props} toc={cleanedTOC} />;
}

export default TOC;

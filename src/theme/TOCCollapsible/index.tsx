/**
 * Wraps Docusaurus' collapsible "On this page" TOC so it shows the same
 * cleaned headings as the desktop TOC (see src/theme/TOC). Phones and
 * 997-1199px windows get this one.
 */

import React from 'react';
import TOCCollapsible from '@theme-original/TOCCollapsible';
import type { Props } from '@theme/TOCCollapsible';
import { cleanTOC } from '../../util/cleanHeadings.ts';

export default function TOCCollapsibleWrapper(props: Props) {
  return <TOCCollapsible {...props} toc={cleanTOC([...props.toc])} />;
}

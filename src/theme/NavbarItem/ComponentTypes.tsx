/**
 * Registers custom navbar item types. Docusaurus requires custom types to be
 * prefixed with `custom-`; they are then usable from `themeConfig.navbar.items`.
 */
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';

import DocsVersionDropdown from '../../components/DocsVersionDropdown.tsx';

export default {
  ...ComponentTypes,
  'custom-electronDocsVersionDropdown': DocsVersionDropdown,
};

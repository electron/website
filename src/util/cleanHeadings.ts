import type { TOCItem } from '@docusaurus/mdx-loader';

export function cleanTOC(toc: TOCItem[]) {
  if (toc.length === 0) {
    return toc;
  }
  return toc.map(({ id, value, level }) => ({
    id,
    value: cleanHeading(value),
    level,
  }));
}

/**
 * Cleans a heading string according to the docs-parser format
 * into a more readable syntax for the Electron docs.
 */
function cleanHeading(str: string) {
  // For events: `Event: 'close'` becomes `close`
  const eventsMatch = str.match(/Event: &#39;([a-z]*(?:-[a-z]+)*)&#39;/);
  // For properties / methods: `win.previewFile(path[, displayName]) macOS` becomes `previewFile`
  const propsMethodsMatch = str.match(
    /^<code>[a-zA-Z]+\.((?:[a-zA-Z0-9]+[.]?)+)/
  );
  if (eventsMatch) {
    return `<code>'${eventsMatch[1]}'</code>`;
  } else if (propsMethodsMatch) {
    return `<code>${propsMethodsMatch[1]}</code>`;
  }

  return str;
}

// @ts-check

/**
 * 
 * @param {import('@docusaurus/types').TOCItem[]} toc 
 */
export function cleanTOC(toc) {
  if (toc.length === 0) {
    return toc;
  }
  return toc.map(({id, value, children, level}) => ({
    id,
    value: cleanHeading(value),
    children: cleanTOC(children),
    level
  }));
}

/**
 * Cleans a heading string according to the docs-parser format
 * into a more readable syntax for the Electron docs.
 * @param {string} str
 * @returns string
 */
function cleanHeading(str) {
  // For events: `Event: 'close'` becomes `close`
  const eventsMatch = str.match(/Event: &#39;([a-z]*(?:-[a-z]+)*)&#39;/)
  // For properties / methods: `win.previewFile(path[, displayName]) macOS` becomes `previewFile`
  const propsMethodsMatch = str.match(/^<code>[a-zA-Z]+\.((?:[a-zA-Z0-9]+[\.]?)+)/)
  if (eventsMatch) {
    return `<code>'${eventsMatch[1]}'</code>`
  } else if (propsMethodsMatch) {
    return `<code>${propsMethodsMatch[1]}</code>`
  }

  return str;
}

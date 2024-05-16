import { Parent } from 'unist';
import { ListItem } from 'mdast';
import { Data as HastData } from 'hast';
import { visitParents } from 'unist-util-visit-parents';
import { isOptions, isParagraph } from '../util/mdx-utils';

/**
 * This transformer adds the class="electron-api-options-list"
 * to any <li> element that starts with <code>options</code>.
 * This is for use in the Algolia crawler.
 *
 * More context:
 *
 * For Algolia DocSearch V3, there is a hard cap limit of 750
 * records per page, which we manage to hit for longer API docs
 * like `app` or `BrowserWindow`.
 *
 * To limit the amount of records crawled for API pages, we decided to
 * skip crawling each API's option list since those can get very long.
 *
 * Somewhere in the crawler is some cheerio code that specifies:
 *  `.not(".electron-api-options-list li, li.electron-api-options-list")`
 */
export default function attacher() {
  return transformer;
}

const CLASS = 'electron-api-options-list';

async function transformer(tree: Parent) {
  visitParents(tree, 'listItem', visitor);
}

function visitor(node: ListItem) {
  if (
    isParagraph(node.children[0]) &&
    isOptions(node.children[0].children[0])
  ) {
    const hastProperties = {
      hProperties: { className: [CLASS] },
    } satisfies HastData;
    node.data = hastProperties;
  }
}

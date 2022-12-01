import { Node, Parent } from 'unist';
import { InlineCode, ListItem, Paragraph } from 'mdast';
import { Data as HastData } from 'mdast-util-to-hast/lib/index';
import visitParents from 'unist-util-visit-parents';

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
module.exports = function attacher() {
  return transformer;
};

const CLASS = 'electron-api-options-list';

async function transformer(tree: Parent) {
  visitParents(tree, 'listItem', visitor);
}

function visitor(node: ListItem) {
  if (isParagraph(node.children[0]) && isOptions(node.children[0].children[0])) {
    const hastProperties = {
      hProperties: { className: [CLASS] },
    } satisfies HastData;
    node.data = hastProperties;
  }
}

function isParagraph(node: Node): node is Paragraph {
  return node.type === 'paragraph';
}

function isOptions(node: Node): node is InlineCode {
  return node.type === 'inlineCode' && (node as any).value === 'options';
}

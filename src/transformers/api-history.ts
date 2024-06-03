import { InlineCode, Link, Parent, Table, TableRow } from 'mdast';
import { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { parse as parseYaml } from 'yaml'

enum Change {
  ADDED = "API ADDED",
  CHANGED = "API CHANGED",
  DEPRECATED = "API DEPRECATED",
  REMOVED = "API REMOVED",
}

type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string, 'breaking-changes-header': string }[];
  removed?: { 'pr-url': string, 'breaking-changes-header': string }[];
  changes?: { 'pr-url': string, description: string }[];
}

export default function attacher() {
  return transformer;
}

// TODO: Add styling based on type
const generateTableRow = (type: Change, prUrl: string, changes?: string) => ({
    type: "tableRow",
    children: [
      {
        type: "tableCell",
        children: [
          {
            type: "link",
            title: null,
            url: prUrl,
            children: [ { type: "inlineCode", value: '#' + prUrl.split("/").at(-1) } ],
          },
        ],
      },
      {
        type: "tableCell",
        children: [
          // TODO: Handle formatting for inline code in changes. Maybe support full markdown?
          { type: "text", value: changes || type },
        ],
      },
    ],
  } as TableRow
)

function transformer(tree: Parent) {
  for (let nodeIdx = 0; nodeIdx < tree.children.length; nodeIdx++) {
    const node = tree.children[nodeIdx];

    const isYamlHistoryCodeBlock = node.type === 'code' && node.lang === 'YAML' && node.meta === 'history';
    if (!isYamlHistoryCodeBlock) continue;

    // TODO: Handle validation
    const apiHistory = parseYaml(node.value) as ApiHistory;

    // ? Maybe this is too much abstraction?
    let apiHistoryChangeRows: TableRow[] = [
      ...(apiHistory.added?.map(added => generateTableRow(Change.ADDED, added['pr-url'])) ?? []),
      ...(apiHistory.changes?.map(change => generateTableRow(Change.CHANGED, change['pr-url'], change['description'])) ?? []),
      ...(apiHistory.deprecated?.map(deprecated => generateTableRow(Change.DEPRECATED, deprecated['pr-url'])) ?? []),
      ...(apiHistory.removed?.map(removed => generateTableRow(Change.REMOVED, removed['pr-url'])) ?? []),
    ];

    // Sort by PR number, lower number on bottom of table
    apiHistoryChangeRows.sort((a, b) => {
      const aPrNumber = parseInt(((a.children[0].children[0] as Link).children[0] as InlineCode).value.slice(1));
      const bPrNumber = parseInt(((b.children[0].children[0] as Link).children[0] as InlineCode).value.slice(1));
      return bPrNumber - aPrNumber;
    })

    const apiHistoryDetails = {
      type: "mdxJsxFlowElement",
      // TODO: Maybe use a custom element? Change "Details" at least.
      name: "Details",
      attributes: [],
      children: [
        {
          type: "table",
          align: [ "center", "center" ],
          children: [
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [ { type: "text", value: "Version" } ],
                },
                {
                  type: "tableCell",
                  children: [ { type: "text", value: "Changes" } ],
                },
              ],
            },
            ...apiHistoryChangeRows,
          ],
        } satisfies Table,
      ],
      data: {
        _mdxExplicitJsx: true,
      },
    } satisfies MdxJsxFlowElement

    // TODO: Find better type than 'any'
    tree.children[nodeIdx] = apiHistoryDetails as any;
  }
}

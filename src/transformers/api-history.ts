import {
  BlockContent,
  DefinitionContent,
  InlineCode,
  Link,
  Node,
  RootContentMap,
  TableRow,
} from 'mdast';
import {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElementData,
} from 'mdast-util-mdx-jsx';
import { parse as parseYaml } from 'yaml';

enum Change {
  ADDED = 'API ADDED',
  CHANGED = 'API CHANGED',
  DEPRECATED = 'API DEPRECATED',
}

type ApiHistory = {
  added?: { 'pr-url': string }[];
  deprecated?: { 'pr-url': string; 'breaking-changes-header': string }[];
  changes?: { 'pr-url': string; description: string }[];
};

export default function attacher() {
  return transformer;
}

// TODO: Add styling based on type
const generateTableRow = (type: Change, prUrl: string, changes?: string) =>
  ({
    type: 'tableRow',
    children: [
      {
        type: 'tableCell',
        children: [
          {
            type: 'link',
            title: null,
            url: prUrl,
            children: [
              { type: 'inlineCode', value: '#' + prUrl.split('/').at(-1) },
            ],
          },
        ],
      },
      {
        type: 'tableCell',
        children: [
          // TODO: Handle formatting for inline code in changes. Maybe support full markdown?
          ...(changes
            ? [{ type: 'text', value: changes }]
            : [{ type: 'inlineCode', value: type }]),
        ],
      },
    ],
  } as TableRow);

// ! Typescript witchcraft to avoid adding `remark-mdx` as a dependency <https://mdxjs.com/packages/remark-mdx/#types>
interface MdxJsxFlowElementWithSummary extends ParentWithMdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string | null;
  attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>;
  children: Array<
    | BlockContent
    | DefinitionContent
    | MdxJsxFlowElementWithSummary
    | { type: 'text'; value: string }
  >;
  data?: MdxJsxFlowElementData | undefined;
}
interface RootContentMapWithMdxJsxFlowElement extends RootContentMap {
  mdxJsxFlowElement: MdxJsxFlowElementWithSummary;
}
type RootContentWithMdxJsxFlowElement =
  RootContentMapWithMdxJsxFlowElement[keyof RootContentMapWithMdxJsxFlowElement];
interface ParentWithMdxJsxFlowElement extends Node {
  children: Array<RootContentWithMdxJsxFlowElement>;
}

function transformer(tree: ParentWithMdxJsxFlowElement) {
  for (let nodeIdx = 0; nodeIdx < tree.children.length; nodeIdx++) {
    const node = tree.children[nodeIdx];

    const isYamlHistoryCodeBlock =
      node.type === 'code' && node.lang === 'YAML' && node.meta === 'history';
    if (!isYamlHistoryCodeBlock) continue;

    // TODO: Handle validation
    const apiHistory = parseYaml(node.value) as ApiHistory;

    // ? Maybe this is too much abstraction?
    const apiHistoryChangeRows: TableRow[] = [
      ...(apiHistory.added?.map((added) =>
        generateTableRow(Change.ADDED, added['pr-url'])
      ) ?? []),
      ...(apiHistory.changes?.map((change) =>
        generateTableRow(
          Change.CHANGED,
          change['pr-url'],
          change['description']
        )
      ) ?? []),
      ...(apiHistory.deprecated?.map((deprecated) =>
        generateTableRow(Change.DEPRECATED, deprecated['pr-url'])
      ) ?? []),
    ];

    // Sort by PR number, lower number on bottom of table
    apiHistoryChangeRows.sort((a, b) => {
      const aPrNumber = parseInt(
        (
          (a.children[0].children[0] as Link).children[0] as InlineCode
        ).value.slice(1)
      );
      const bPrNumber = parseInt(
        (
          (b.children[0].children[0] as Link).children[0] as InlineCode
        ).value.slice(1)
      );
      return bPrNumber - aPrNumber;
    });

    const apiHistoryDetails = {
      type: 'mdxJsxFlowElement',
      name: 'details',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'class',
          value: 'api-history',
        },
      ],
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'summary',
          attributes: [],
          children: [
            {
              type: 'text',
              value: 'History',
            },
          ],
          data: {
            _mdxExplicitJsx: true,
          },
        },
        {
          type: 'table',
          align: ['center', 'center'],
          children: [
            {
              type: 'tableRow',
              children: [
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'PR' }],
                },
                {
                  type: 'tableCell',
                  children: [{ type: 'text', value: 'Changes' }],
                },
              ],
            },
            ...apiHistoryChangeRows,
          ],
        },
      ],
      data: {
        _mdxExplicitJsx: true,
      },
    } satisfies MdxJsxFlowElementWithSummary;

    tree.children[nodeIdx] = apiHistoryDetails;
  }
}

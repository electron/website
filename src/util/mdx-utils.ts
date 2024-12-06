import {
  PhrasingContent,
  Text,
  Paragraph,
  InlineCode,
  LinkReference,
  Link,
  Definition,
  Code,
} from 'mdast';
import { MdxjsEsm } from 'mdast-util-mdxjs-esm';
import { Node } from 'unist';

export function isCode(node: Node): node is Code {
  return node.type === 'code';
}

export function isDefinition(node: Node): node is Definition {
  return node.type === 'definition';
}

export function isImport(node: Node): node is MdxjsEsm {
  return node.type === 'mdxjsEsm';
}

export function isLink(node: Node): node is Link {
  return node.type === 'link';
}

export function isLinkReference(node: Node): node is LinkReference {
  return node.type === 'linkReference';
}

export function isOptions(node: Node): node is InlineCode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.type === 'inlineCode' && (node as any).value === 'options';
}

export function isParagraph(node: Node): node is Paragraph {
  return node.type === 'paragraph';
}

export function isText(node: PhrasingContent): node is Text {
  return node.type === 'text';
}

/**
 * Imports a component from `@site/src/components`.
 *
 * @example
 *
 * To import the default exported `JsCodeBlock` React component from
 * `src/components/JsCodeBlock.tsx`, import the name of the component with no file extension:
 *
 * ```js
 * getJSXImport('JsCodeBlock')
 * ```
 *
 * @param componentName name of the TSX file
 * @returns MDX AST
 */
export function getJSXImport(componentName: string): MdxjsEsm {
  return {
    type: 'mdxjsEsm',
    value: `import ${componentName} from '@site/src/components/${componentName}'`,
    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: {
                  type: 'Identifier',
                  name: componentName,
                },
              },
            ],
            source: {
              type: 'Literal',
              value: `@site/src/components/${componentName}`,
              raw: `'@site/src/components/${componentName}'`,
            },
          },
        ],
        sourceType: 'module',
        comments: [],
      },
    },
  };
}

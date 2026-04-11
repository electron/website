/**
 * @module copy-page-button
 *
 * a functional interface used to derive a "Copy Page" button from a unified pipeline
 *
 * A unified/remark plugin for rendering a "Copy Page" button at the top of
 * every static `docs/**` page. Runs at build time inside the existing remark
 * pipeline configured from the top-level `docusaurus.config.ts`. Zero per-doc
 * boilerplate: every existing and future page picks it up automatically, and
 * the clipboard payload is guaranteed to match the source on disk rather than
 * any rendered or post-processed form.
 *
 * ## Terms used below
 *
 * - **unified / remark** — the markdown processing pipeline. `remark` is
 *   unified's markdown flavor; plugins are just functions that mutate the
 *   parsed tree before it's serialized or compiled.
 *
 * - **vfile** — unified's per-file container. It carries both the original
 *   source text (`vfile.value`) and metadata (path, messages, etc.). Crucially,
 *   `vfile.value` is a field *separate* from the parsed tree — normal plugins
 *   mutate the tree, not the source string, so `vfile.value` remains the
 *   verbatim file-on-disk contents throughout the whole pipeline regardless
 *   of where this plugin sits in the chain.
 *
 * - **mdast / mdxjsEsm / mdxJsxFlowElement** — node types in the MDX AST
 *   (https://github.com/syntax-tree/mdast). `mdxjsEsm` is an `import`/`export`
 *   statement; `mdxJsxFlowElement` is a block-level JSX element (the "flow"
 *   variant, as opposed to `mdxJsxTextElement` which is inline inside a
 *   paragraph). A flow element is correct here because the button occupies
 *   its own line above the doc body.
 *
 * - **estree / acorn** — JavaScript's standard AST spec and the parser MDX
 *   uses to turn JSX expression attributes (`foo={...}`) into syntax trees.
 *   Attribute values can either be a raw string (which MDX re-parses with
 *   acorn) or a pre-built estree (which MDX uses directly).
 *
 * ## How it works
 *
 * Standard unified shape: `attacher()` returns a `transformer` that the
 * pipeline invokes once per file with `(tree, vfile)`, free to mutate the
 * mdast in place.
 *
 * 1. **Read the raw source.** The full, untransformed markdown is pulled
 *    from `vfile.value`. This is the payload the clipboard will eventually
 *    receive, so what users copy always matches (or functionally depends on)
 *    the file on disk.
 *
 * 2. **JSON-encode the source.** Parsed mdx content is passed to the React
 *    component as a JSX *expression* attribute — `rawMarkdown={"..."}` — not
 *    a string attribute `rawMarkdown="..."`. Markdown bodies contain quotes,
 *    backticks, angle brackets, and curly braces; all of these would break
 *    JSX string-literal parsing. `JSON.stringify` produces a valid JS string
 *    literal that survives acorn's parse step.
 *
 * 3. **Build an `mdxJsxFlowElement` for the button.** The element carries
 *    one attribute whose value is an `mdxJsxAttributeValueExpression`. That
 *    expression ships with a pre-built `estree` (`Program` →
 *    `ExpressionStatement` → `Literal`) so MDX can skip re-parsing the JSON
 *    string with acorn. The element also sets `data._mdxExplicitJsx: true`,
 *    which tells MDX to treat `<CopyPageButton>` as a real JSX component
 *    reference rather than a markdown construct that happens to share the
 *    name.
 *
 * 4. **Prepend the button, then prepend the import.** Both `unshift` calls
 *    target `tree.children`, but order matters: the button is unshifted
 *    first, then the `mdxjsEsm` import node, so the final top-of-tree order
 *    is `import → button → (rest of body)`. The import is required because
 *    `CopyPageButton` otherwise wouldn't be a resolvable identifier at
 *    compile time; the guard below skips it when a doc author has already
 *    imported the component manually. The button lands as the first body
 *    node, directly under the page title (Docusaurus renders the
 *    frontmatter title above the MDX body).
 *
 * Same AST-injection pattern used by `api-history.ts` for `<ApiHistoryTable />`.
 */

import type { Parent } from 'unist';
import type { VFile } from 'vfile';

import { getJSXImport, isImport } from '../util/mdx-utils';

const COMPONENT_NAME = 'CopyPageButton';

export default function attacher() {
  return transformer;
}

function transformer(tree: Parent, vfile: VFile) {
  const rawMarkdown =
    typeof vfile.value === 'string'
      ? vfile.value
      : Buffer.isBuffer(vfile.value)
        ? vfile.value.toString('utf-8')
        : '';

  if (!rawMarkdown) {
    return;
  }

  // Must be a JSX expression attribute (rawMarkdown={"..."}), not a string
  // attribute — markdown source contains characters that break JSX string
  // literals (quotes, backticks, angle brackets, curly braces). See the file
  // header for the full rationale.
  const jsonEscaped = JSON.stringify(rawMarkdown);

  const buttonNode = {
    type: 'mdxJsxFlowElement',
    name: COMPONENT_NAME,
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'rawMarkdown',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: jsonEscaped,
          // Pre-built estree so MDX's acorn step can skip re-parsing.
          data: {
            estree: {
              type: 'Program',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Literal',
                    value: rawMarkdown,
                    raw: jsonEscaped,
                  },
                },
              ],
              sourceType: 'module',
              comments: [],
            },
          },
        },
      },
    ],
    children: [],
    data: {
      _mdxExplicitJsx: true,
    },
  };

  // Prepend the button so it renders as the first body node, directly under
  // the page title.
  tree.children.unshift(buttonNode as unknown as Parent['children'][number]);

  // Prepend the import so `CopyPageButton` is in scope for the JSX node above.
  // Skip if a doc author already imported the component manually.
  const alreadyImported = tree.children.some(
    (child) =>
      isImport(child) &&
      child.value.includes(`@site/src/components/${COMPONENT_NAME}`),
  );

  if (!alreadyImported) {
    tree.children.unshift(getJSXImport(COMPONENT_NAME));
  }
}

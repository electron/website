//@ts-check

import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';

import logger from '@docusaurus/logger';

/**
 * RegExp used to match the details of the arguments of a function
 * in the documention and used in `apiTransformer`. It matches:
 * >   * `userInfo` Record<String, unknown>
 * ➡ ["  * ", "`userInfo` Record<String, unknown>", "userInfo", "Record<String, unknown>", ""]
 * > * `channel` String
 * ➡ ["* ", "`channel` String", "channel", "String", ""]
 * > * `deliverImmediately` Boolean (optional) - `true` to post notifications immediately even when the subscribing app is inactive.
 * ➡ ["* ", "...", "deliverImmediately", "Boolean (optional) ", "-"] ⚠ Note the trailing space in [3]
 */
const argumentRegex = /(\s*\*\s+)`([a-zA-Z]+?)`\s([\s\S]+?)($|\s-)/;

/**
 * MDX has some problems with strings like `Promise<void>` when they
 * are out of code blocks.
 * This happens when declaring the types of the arguments. This method
 * replaces the closing `>` with the unicode character `&#62;` to
 * prevent this issue.
 * @param line
 */
const apiTransformer = (line: string) => {
  const matches = argumentRegex.exec(line);

  if (!matches) {
    return line;
  }

  const newLine = line.replace(
    matches[0],
    `${matches[1]}\`${matches[2].trim()}\` ${matches[3]
      .trim()
      .replace(/>/g, '&#62;')
      .replace(/\\?</g, '&#60;')} ${matches[4].trim()}`.trimEnd() // matches[4] could be empty and thus end up with a trailing space
  );

  return newLine;
};

/**
 * RegExp use to match the old markdown format for fiddle
 * in `fiddleTransformer`.
 */
const fiddleRegex = /^```javascript fiddle='docs\/(\S+)?'$/;
const fiddlePathFixRegex = /```fiddle docs\//;

/**
 * Updates the markdown fiddle format from:
 * ```
 * ```javascript fiddle='docs/fiddles/screen/fit-screen'
 * ```
 * To
 * ```
 * ```fiddle docs/latest/fiddles/example
 * ```
 * @param line
 */
const fiddleTransformer = (line: string) => {
  const matches = fiddleRegex.exec(line);
  const hasNewPath = fiddlePathFixRegex.test(line);

  if (matches) {
    return `\`\`\`fiddle docs/latest/${matches[1]}`;
  } else if (hasNewPath) {
    return (
      line
        .replace(fiddlePathFixRegex, '```fiddle docs/latest/')
        // we could have a double transformation if the path is already the good one
        // this happens especially with the i18n content
        .replace('latest/latest', 'latest')
    );
  } else {
    return line;
  }
};

/**
 * Crowdin translations put markdown content right
 * after HTML comments and thus breaking Docusaurus
 * parse engine. We need to add a new EOL after `-->`
 * is found.
 * @param line
 */
const newLineOnHTMLComment = (line: string) => {
  // The `startsWith('*')` part is to prevent messing the document `api/native-theme.md` 😓
  if (line.includes('-->') && !line.endsWith('-->') && !line.startsWith('*')) {
    return line.replace('-->', '-->\n');
  }
  return line;
};

/**
 * Crowdin needs extra blank lines surrounding the admonition characters so it doesn't
 * break Docusaurus with the translated content.
 * @param line
 */
const newLineOnAdmonition = (line: string) => {
  if (line.trim().startsWith(':::') || line.trim().endsWith(':::')) {
    return `\n${line.trim()}\n`;
  }

  return line;
};

/**
 * Applies any transformation that can be executed line by line on
 * the document to make sure it is ready to be consumed by
 * docusaurus and our md extensions:
 * * Fix types on regular text
 * * Update the fiddle format
 * @param doc
 */
const transform = (doc: string) => {
  const lines = doc.split('\n');
  const newDoc = [];
  const transformers = [
    apiTransformer,
    fiddleTransformer,
    newLineOnHTMLComment,
    newLineOnAdmonition,
  ];

  for (const line of lines) {
    const newLine = transformers.reduce((newLine, transformer) => {
      return transformer(newLine);
    }, line);

    newDoc.push(newLine);
  }

  return newDoc.join('\n');
};

/**
 * Does a best effort to fix internal links
 * @param content
 * @param linksMaps
 */
const fixLinks = (content: string, linksMaps: Map<string, string>) => {
  /**
   * This regex should match the following examples:
   * * [link label]: ./somewhere.md
   * * [link label]:../anywhere
   * * [link label]: nowhere
   * * [link](./somewhere.md)
   * * [link](../anywhere)
   * * [link](nowhere)
   * * [link](https://github.com/electron/electron/blob/HEAD/path-to-file/file.md)
   * * [link]: https://github.com/electron/electron/
   * * [link]:https://another.place/
   *
   * The 2nd group contains the link.
   * See https://regex101.com/r/i40SRL/1 for testing
   */
  let updatedContent = content;
  const mdLinkRegex = /(]:\s*|]\()(\S*?)?(?:\s|$|\))/gi;
  let val: RegExpExecArray;

  while ((val = mdLinkRegex.exec(content)) !== null) {
    const link = val[2];

    // Don't map links from outside the electron docs
    if (
      link.startsWith('https://') &&
      !link.includes('github.com/electron/electron/')
    ) {
      continue;
    }

    // Link could be `glossary.md#main-process` and we just need `glossary.md`
    const basename = path.basename(link);
    const parts = basename.split('#');
    const key = parts.shift();

    if (key && linksMaps.has(key)) {
      const newLink = [linksMaps.get(key), ...parts];
      const replacement = val[0].replace(val[2], newLink.join('#'));
      updatedContent = updatedContent.replace(val[0], replacement);
    }
  }

  /**
   * Docusaurus has a problem when the title of an image spawns multiple lines. E.g.:
   *
   * ```md
   * ![This is an
   * image](path/to/image)
   * ```
   *
   * Surprisingly, it has no problem with multiline regular links 🤷‍♂️
   * */
  const multilineImageTitle = /(?:!\[([^\]]+?)\])\(/gm;
  while ((val = multilineImageTitle.exec(updatedContent)) !== null) {
    const title = val[1];
    if (!title.includes('\n')) {
      continue;
    }
    const fixedTitle = title.replace(/\n/g, ' ');
    updatedContent = updatedContent.replace(val[1], fixedTitle);
  }

  return updatedContent;
};

/**
 * Removes unnecesary extra blank lines
 * @param content
 */
const fixReturnLines = (content: string) => {
  return content.replace(/\n\n(\n)+/g, '\n\n');
};

/**
 * Inline API structure content if a link URL query parameter is ?inline.
 *
 * This will place the content of the structure (minus the document header)
 * on the line following the link. If the line with the link is a list, the
 * inlined content will be indented so that it is the next level in the list.
 *
 * Fairly heavy on assumptions and heuristics about how the docs are laid out
 * so this code may be fragile to upstream changes.
 *
 * @param filePath
 * @param content
 */
const inlineApiStructures = async (filePath: string, content: string) => {
  // This is a modified version of the regex in `fixLinks`
  const inlineApiStructureRegex = /\[\S+(?:]\()((\S*?)\?inline)?(?:\s|$|\))/g;

  // This is from vscode-markdown-languageservice
  const linkDefinitionPattern =
    /^([\t ]*\[(?!\^)((?:\\\]|[^\]])+)\]:\s*)([^<]\S*|<[^>]+>)/gm;

  let updatedContent = content;

  for (const val of content.matchAll(inlineApiStructureRegex)) {
    const link = val[2];

    // Don't consider links from outside the electron docs
    if (
      link.startsWith('https://') &&
      !link.includes('github.com/electron/electron/')
    ) {
      continue;
    }

    logger.info(
      `Inlining API structure content for '${logger.green(
        link
      )}' in ${logger.green(filePath)}`
    );

    try {
      // Recursively inline to ensure all inline links have been inlined
      const apiStructureFilePath = path.join(path.dirname(filePath), link);
      let apiStructureContent = await inlineApiStructures(
        apiStructureFilePath,
        await fs.readFile(apiStructureFilePath, 'utf-8')
      );

      // Strip the header if there is one
      if (apiStructureContent.match(/^# /m)) {
        const headerIdx = apiStructureContent.match(/^# /m).index;
        const firstNewline = apiStructureContent.indexOf('\n', headerIdx);
        apiStructureContent = apiStructureContent.slice(
          apiStructureContent.indexOf('\n', firstNewline + 1) + 1
        );
      }

      const indexOfLineStart = updatedContent.lastIndexOf('\n', val.index) + 1;
      const indexOfLineEnd =
        val.index + updatedContent.slice(val.index).indexOf('\n');
      const line = updatedContent.slice(indexOfLineStart, indexOfLineEnd);

      // The line with the link is a list item
      if (line.trim().startsWith('*')) {
        const indentation = line.indexOf('*');

        if (![0, 2, 4, 6].includes(indentation)) {
          throw new Error(
            'Expected an indentation level of 0, 2, 4, or 6 for list item'
          );
        }

        // Assume list indentation is a multiple of 2, should be enforced by
        // upstream linter. Increase the indentation of the API structure
        // content by two spaces for the list of properties, which is presumed
        // to be the first block in the document after the header, which ends
        // when there's a blank line, or end of file
        let initialPropsSection = true;

        const lines = apiStructureContent.split('\n');
        apiStructureContent = lines
          .map((line) => {
            if (line.trim() === '') {
              initialPropsSection = false;
            }

            return initialPropsSection
              ? `${' '.repeat(indentation + 2)}${line}`
              : line;
          })
          .join('\n');
      }

      // Pull out any reference link definitions so they don't interfere
      // with list indentation when inlining the structure properties
      const apiStructureContentLines = apiStructureContent.split('\n');
      const referenceLinkDefinitions = apiStructureContentLines.filter((line) =>
        line.match(linkDefinitionPattern)
      );

      if (referenceLinkDefinitions.length) {
        apiStructureContent = apiStructureContentLines
          .filter((line) => !line.match(linkDefinitionPattern))
          .join('\n');
      }

      // Insert the API structure content
      const preContent = updatedContent.slice(0, indexOfLineEnd);
      const postContent = updatedContent.slice(indexOfLineEnd + 1);
      updatedContent =
        preContent + '\n' + apiStructureContent.trimEnd() + '\n' + postContent;

      // Replace the special link to strip off the ?inline query parameter
      updatedContent = updatedContent.replace(val[1], val[2]);

      // Place any reference links from API structure content at end
      if (referenceLinkDefinitions.length) {
        updatedContent =
          updatedContent + '\n' + referenceLinkDefinitions.join('\n') + '\n';
      }
    } catch (err) {
      logger.error(
        `Error inlining API structure link in file ${filePath}: ${err}`
      );
    }
  }

  return updatedContent;
};

/**
 * The current doc's format on `electron/electron` cannot be used
 * directly by docusaurus. This function trasform all the md files
 * found in the given `root` (recursively) and makes sure they are
 * ready to consumed by the website.
 * @param root
 * @param version
 */
export const fixContent = async (root: string, version = 'latest') => {
  const files = await globby(`${version}/**/*.md`, {
    cwd: root,
  });

  /**
   * Filenames in Electron docs are usually unique so best effort
   * consist on using the filename (basename) to identify the right
   * place where it should point.
   */
  const linksMaps = new Map();
  for (const filePath of files) {
    linksMaps.set(path.basename(filePath), filePath);
  }

  for (const filePath of files) {
    const fullFilePath = path.join(root, filePath);
    const content = await fs.readFile(fullFilePath, 'utf-8');

    // Inline API structures first so all other fixes affect them
    let fixedContent = await inlineApiStructures(fullFilePath, content);

    fixedContent = transform(fixedContent);

    // These analyze the document globally instead of line by line,
    // thus why they cannot be part of `transform`
    fixedContent = fixReturnLines(fixLinks(fixedContent, linksMaps));

    await fs.writeFile(path.join(root, filePath), fixedContent, 'utf-8');
  }
};

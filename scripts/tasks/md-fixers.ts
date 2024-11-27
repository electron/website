//@ts-check

import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';

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
 * MDX requires </details> tag to be on its own line for some reason.
 * @param line
 */
const newLineOnDetails = (line: string) => {
  if (line.trim().endsWith(' </details>')) {
    const restOfContent = line.trim().split(' </details>')[0];
    return `${restOfContent}\n</details>`;
  }

  return line;
};

/**
 * MDX requires <img> tags to be closed (e.g. <img/>).
 * This fixer isn't perfect and only works for <img> tags that take up a whole line.
 * @param line
 */
const noUnclosedImageTags = (line: string) => {
  if (line.match(/^(<img[^>]+)(?<!\/)>$/)) {
    return `${line.slice(0, -1)}/>`;
  } else {
    return line;
  }
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
    fiddleTransformer,
    newLineOnHTMLComment,
    newLineOnAdmonition,
    newLineOnDetails,
    noUnclosedImageTags,
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
 * Removes unnecessary extra blank lines
 * @param content
 */
const fixReturnLines = (content: string) => {
  return content.replace(/\n\n(\n)+/g, '\n\n');
};

/**
 * The current doc's format on `electron/electron` cannot be used
 * directly by docusaurus. This function transform all the md files
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

    let fixedContent = transform(content);

    // These analyze the document globally instead of line by line,
    // thus why they cannot be part of `transform`
    fixedContent = fixReturnLines(fixedContent);

    await fs.writeFile(path.join(root, filePath), fixedContent, 'utf-8');
  }
};

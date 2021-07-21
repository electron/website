//@ts-check

const fs = require('fs').promises;
const path = require('path');
const globby = require('globby');

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
 * @param {string} line
 */
const apiTransformer = (line) => {
  const matches = argumentRegex.exec(line);

  if (!matches) {
    return line;
  }

  const newLine = line.replace(
    matches[0],
    `${matches[1]}\`${matches[2].trim()}\` ${matches[3]
      .trim()
      .replace(/>/g, '&#62;')} ${matches[4].trim()}`.trimEnd() // matches[4] could be empty and thus end up with a trailing space
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
 * @param {String} line
 */
const fiddleTransformer = (line) => {
  const matches = fiddleRegex.exec(line);
  const hasNewPath = fiddlePathFixRegex.test(line);

  if (matches) {
    return `\`\`\`fiddle docs/latest/${matches[1]}`;
  } else if (hasNewPath) {
    return line.replace(fiddlePathFixRegex, '```fiddle docs/latest/');
  } else {
    return line;
  }
};

/**
 * Crowdin translations put markdown content right
 * after HTML comments and thus breaking Docusaurus
 * parse engine. We need to add a new EOL after `-->`
 * is found.
 */
const newLineOnHTMLComment = (line) => {
  if (line.includes('-->')) {
    return line.replace('-->', '-->\n');
  }
  return line;
};

/**
 * Applies any transformation that can be executed line by line on
 * the document to make sure it is ready to be consumed by
 * docusaurus and our md extensions:
 * * Fix types on regular text
 * * Update the fiddle format
 * @param {string} doc
 */
const transform = (doc) => {
  const lines = doc.split('\n');
  const newDoc = [];
  const transformers = [
    apiTransformer,
    fiddleTransformer,
    newLineOnHTMLComment,
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
 * @param {string} content
 * @param {Map<string,string>} linksMaps
 */
const fixLinks = (content, linksMaps) => {
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
  let val;

  while ((val = mdLinkRegex.exec(content)) !== null) {
    const link = val[2];
    const basename = path.basename(link);
    // Link could be `glossary.md#main-process` and we just need `glossary.md`
    const parts = basename.split('#');
    const key = parts.shift();
    if (linksMaps.has(key)) {
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
    updatedContent = updatedContent.replace(val[0], fixedTitle);
  }

  return updatedContent;
};

/**
 * The current doc's format on `electron/electron` cannot be used
 * directly by docusaurus. This function trasform all the md files
 * found in the given `root` (recursively) and makes sure they are
 * ready to consumed by the website.
 * @param {string} root
 * @param {string} [version]
 */
const fixContent = async (root, version = 'latest') => {
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
    const content = await fs.readFile(path.join(root, filePath), 'utf-8');

    let fixedContent = transform(content);

    // `fixLinks` analyzes the document globally instead of line by line, thus why
    // it cannot be part of `transform`
    fixedContent = fixLinks(fixedContent, linksMaps);

    await fs.writeFile(path.join(root, filePath), fixedContent, 'utf-8');
  }
};

module.exports = {
  fixContent,
};

//@ts-check

const fs = require('fs').promises;
const path = require('path');
const globby = require('globby');

/**
 * MDX has some problems with strings like `Promise<void>` that need
 * to be converted to `Promise<void/>`. This scripts makes sure that
 * the contents of the documents are sanitized so they are ready to
 * be used by docusaurus.
 */

const keywords = new Set([
  'any',
  'Boolean',
  'Buffer',
  'Extension',
  'ExtensionInfo',
  'Integer',
  'local',
  'NativeImage',
  // TODO: Normalize (nN)umber in the docs
  'number',
  'Number',
  'Object',
  'port',
  'Product',
  'proxyHost',
  'proxyPort',
  'proxyScheme',
  'proxyURL',
  'proxyURIList',
  'ServiceWorkerInfo',
  // TODO: Normalize (sS)tring in the docs
  'string',
  'String',
  'Uint8Array',
  'unknown',
  'urlScheme',
  'void',
  'webview',
]);

/**
 * MDX has some problems with strings like `Promise<void>` when they
 * are out of code blocks.
 * This happens when declaring the types of the arguments. This method
 * replaces the closing `>` with the unicode character `&#62;` to
 * prevent this issue.
 *
 * @param {string} doc
 */
const sanitizeAPI = (doc) => {
  /**
   * Matches the following:
   * >   * `userInfo` Record<String, unknown>
   * ➡ ["  * ", "`userInfo` Record<String, unknown>", "userInfo", "Record<String, unknown>", ""]
   * > * `channel` String
   * ➡ ["* ", "`channel` String", "channel", "String", ""]
   * > * `deliverImmediately` Boolean (optional) - `true` to post notifications immediately even when the subscribing app is inactive.
   * ➡ ["* ", "...", "deliverImmediately", "Boolean (optional) ", "-"] ⚠ Note the trailing space in [3]
   */
  const argumentRegex = /(\s*\*\s+)`([a-zA-Z]+?)`\s([\s\S]+?)($|\s-)/;
  const lines = doc.split('\n');
  const newDoc = [];

  for (const line of lines) {
    const matches = argumentRegex.exec(line);

    if (!matches) {
      newDoc.push(line);
      continue;
    }

    const newLine = line.replace(
      matches[0],
      `${matches[1]}\`${matches[2].trim()}\` ${matches[3]
        .trim()
        .replace(/>/g, '&#62;')} ${matches[4].trim()}`.trim() // matches[4] could be empty and thus end up with a trailing space
    );

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
 * Escapes the required characters to avoid issues with MDX and
 * makes a best effort to fix any internal link.
 * @param {string} root
 */
const fixContent = async (root) => {
  const files = await globby(`**/*.md`, {
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

    let fixedContent = sanitizeAPI(content);

    fixedContent = fixLinks(fixedContent, linksMaps);

    await fs.writeFile(path.join(root, filePath), fixedContent, 'utf-8');
  }
};

module.exports = {
  fixContent,
};

const visit = require('unist-util-visit');

/**
 * Default replacer.
 * @param url
 */
const defaultReplacer = async url => url;

/**
 * Replace all matches in a string asynchronously.
 * @param str
 * @param regex
 * @param asyncFn
 * @returns {Promise<*>}
 */
const replaceAsync = async function (str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
};

/**
 * Rewrite the URL in a JSX node.
 * @param value
 * @param replacer
 * @returns {Promise<*>}
 */
const rewriteJSXURL = async (value, replacer) => replaceAsync(value, /href="(.*?)"/g, async (_, url) => {
  const newUrl = await replacer(url);
  return `href="${newUrl}"`;
});

/**
 * Rewrite the URL in a Markdown node.
 * @param options
 * @returns {function(*): Promise<*>}
 */
function RemarkLinkRewrite(options = {replacer: defaultReplacer}) {
  const {replacer} = options;
  return async tree => {
    const nodes = [];

    visit(tree, node => {
      if (node.type === 'link') {
        nodes.push(node);
      }
      if (node.type === 'jsx' || node.type === 'html') {
        if (/<a.*>/.test(node.value)) {
          nodes.push(node);
        }
      }
    });

    await Promise.all(nodes.map(async node => {
      if (node.type === 'link') {
        node.url = await replacer(node.url);
      }
      if (node.type === 'jsx' || node.type === 'html') {
        node.value = await rewriteJSXURL(node.value, replacer);
      }
    }),);
    return tree;
  };
}

module.exports = RemarkLinkRewrite;

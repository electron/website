const fs = require('node:fs');
const os = require('node:os');

module.exports = {
  config: {
    extends: '@electron/lint-roller/configs/markdownlint.json',
    'link-image-style': {
      autolink: false,
      shortcut: true,
    },
    'no-angle-brackets': true,
    'no-curly-braces': true,
    'no-alt-text': false,
    'no-newline-in-links': true,
    'no-shortcut-reference-links': false,
  },
  customRules: [
    './node_modules/@electron/lint-roller/markdownlint-rules/index.mjs',
  ],
  ignores: fs.readFileSync('.markdownlintignore', 'utf-8').trim().split(os.EOL),
};

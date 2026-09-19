/**
 * Sidebars for the per-version docs builds (`docusaurus.versioned.config.ts`).
 *
 * Those builds root the docs plugin at `docs/<version>` so doc IDs carry no
 * folder prefix (`api/app` rather than `latest/api/app`). Reuses the
 * `sidebars.js` template with an empty prefix and drops every entry whose
 * markdown file is missing from that version.
 */
const fs = require('node:fs');
const path = require('node:path');

const { createSidebars, filterSidebars } = require('./sidebars-template.js');

const version = process.env.ELECTRON_DOCS_VERSION;

if (!version) {
  throw new Error(
    'ELECTRON_DOCS_VERSION must be set to build the versioned sidebars',
  );
}

const docsDir = path.join(__dirname, 'docs', version);

/**
 * @param {string} docId e.g. `api/app`
 */
const docExists = (docId) =>
  fs.existsSync(path.join(docsDir, `${docId}.md`)) ||
  fs.existsSync(path.join(docsDir, `${docId}.mdx`));

module.exports = filterSidebars(createSidebars(''), docExists);

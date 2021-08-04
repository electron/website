# About en-US

**TL;DR;** Do not manually modify the contents of `i18n/en-US`.

Docusaurus translations for anything that is not markdown are stored
in several JSON files. These files are generated for each locale from
the contents of `docusaurus.config.js`, `sidebars.js`, and installed
plugins using the `yarn write-translations --locale [locale]` script.
Some of the files that are generated are `code.json`, `navbar.json`,
`footer.json`, etc.

For the website's source language (`en-US`), these JSON files are **not**
used by Docusaurus. Rather, they serve as source files for our
[Crowdin](https://crowdin.com/project/electron) internationalization (i18n)
workflow. The [`electron/i18n`](https://github.com/electron/i18n) repository
periodically updates these source strings on Crowdin via
[GitHub Actions](https://github.com/electron/i18n/actions/workflows/schedule-update-source-content.yml).

To keep everything in sync, there is a pre-commit hook that automatically
deletes and creates again the `en-US` folder and its contents when
`docusaurus.config.js` or `sidebars.js` are modified.
The script the hook invokes is in `/scripts/update-l10n-sources.js`.

# electronjs.org

[![Push and publish main](https://github.com/electron/website/actions/workflows/push-main.yml/badge.svg)](https://github.com/electron/website/actions/workflows/push-main.yml)
[![Update i18n deploy](https://github.com/electron/website/actions/workflows/update-i18n-deploy.yml/badge.svg)](https://github.com/electron/website/actions/workflows/update-i18n-deploy.yml)
[![Crowdin](https://badges.crowdin.net/electron/localized.svg)](https://crowdin.com/project/electron)

This repository contains the code for the [Electron](https://www.electronjs.org/) website.
It is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

To get started with a local version of the website, install dependencies with `yarn`. To get the
website running in dev mode, run `yarn start`. To get a production build of the website, run
`yarn build`.

```console
yarn
yarn start
```

## How to modify the documentation

### English docs

For English documentation, the documentation is mirrored from the [electron/electron][] repo.
Changes are picked automatically by the [electron/electron-website-updater][] webhook as soon as they
are made the latest stable release branch.

For example, if the latest Electron stable release is `v22.0.3`, then any documentation changes in
the `22-x-y` branch in electron/electron will be mirrored into the `main` branch of this repository.

### Translations

This project uses [Crowdin][] to manage localizations. For more information on contributing to
translations, see the [i18n.md][] document.

## How to add a new blog post

To add a new blog post, you need to create a new Markdown file under the `/blog` folder. Supported
frontmatter options are listed in the [Docusaurus Blog docs](https://docusaurus.io/docs/blog#adding-posts).

## Local development

If you want to modify Electron's documentation locally and preview how it looks on the website, you can
tell the `pre-build` script to pull the docs from your local Electron repo.

```console
yarn pre-build ../relative/path/to/local/electron/repo
yarn start
```

# Repository content organization

This repository contains the code for two related things:

- The code to generate the contents of https://electronjs.org
- [`create-electron-documentation`][ced] package

The content of this repository is organized as follows:

```
└─ root
    |
    ├─ .github/workflows → The definitions for the GitHub actions
    |
    |- blog -> Source files for electronjs.org/blog
    |
    ├─ create-electron-documentation → Code for the npm package
    |        of the same name. Read the readme in the folder
    |        for more information.
    |
    |- docs -> Mirrored docs from electron/electron
    |
    ├─ scripts → The code for the package.json tasks and GitHub
    |        actions
    |
    ├─ src → Docusaurus code
    |
    ├─ static → Docusaurus static assets
```

[ced]: https://npmjs.com/package/create-electron-documentation
[crowdin]: https://crowdin.com/project/electron
[electron/electron]: https://github.com/electron/electron/tree/main/docs
[electron/electron-website-updater]: https://github.com/electron/electron-website-updater
[i18n.md]: ./i18n.md

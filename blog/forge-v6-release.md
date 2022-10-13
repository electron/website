---
title: Electron Forge v6.0.0
date: 2022-10-26T00:00:00.000Z
authors:
  - name: georgexu99
    url: 'https://github.com/georgexu99'
    image_url: 'https://github.com/georgexu99.png?size=96'
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: forge-v6-release-blog
---

The Electron Forge Team is excited to announce that Forge v6 is now available! This stable release contains many significant new features and improvements. Highlights of this release include the addition of our Webpack plugin as well as the introduction of the Forge Core and CLI APIs.

## What Does a Stable Release Mean?

During our time in a beta release state, our team has been busy refactoring Forge’s code, improving its architecture, creating new features as well as ironing out bugs and issues.

A stable release means that we are done making major breaking changes, and that beta changes have been tested thoroughly both internally and through the community.

## Why Switch to Forge From an Existing Pipeline?

If your app already uses an existing build tooling solution that provides packaging and publishing capabilities, the benefits associated with adopting Electron Forge can still outweigh the initial switching cost.

Electron Forge will be kept up to date with the latest Electron tooling updates. This means that alongside the implicit features and plugins that Forge provides, users won't need to wire in new tooling support themselves, or wait for that support to be eventually implemented by other packages before upgrading. This reduction in the burden of maintenance for Forge applications has already been observed when Electron released `@electron/universal` [support](https://github.com/electron/universal) as well as [ASAR Integrity checking](https://www.electronjs.org/docs/latest/tutorial/asar-integrity), which were features that Forge supported out of the box.

## Introducing the Webpack Plugin

This release adds webpack support to your build pipeline. Webpack is a module bundler: it takes your codebase’s dependencies and modules, creates a dependency graph, and bundles them (stitching them together into a single file) into a form that your index.html can read. Bundling increases performance by reducing the number of asset calls required.

Forge v6 comes with a [webpack template] that makes use of the new `@electron-forge/plugin-webpack` module, plus some preset Webpack configuration options. Configuration instructions can be found in the [docs](https://www.electronforge.io/config/plugins/webpack).

The addition of webpack support brings several webpack features to your Forge app. Notable features include but are not limited to:
- Hot module reloading
- DevServer support
- Adding content security policies
- Native module support

## The Forge API Has Moved

If you aren't already on the beta version of Forge, since the previous stable release the Forge v5 API has been refactored into its own separate node module. The new refactored Forge [Core API] exposes the v5 Forge API methods as well as a number of utility functions to Node, allowing you call them from within your own code.

This release also adds access to the Core API from your command line interface in the form of another [CLI API]. At a high level, this is a wrapper for the Forge Core API that is accessible from the terminal.

## Breaking Changes:

- Node 14 is now the minimum supported version. Please upgrade to Node 14 to continue using Electron Forge
- Remove support for electron-compile ([d59695ec](https://github.com/electron-userland/electron-forge/commit/d59695ec))

## Other Changes:

_A complete list of changes and commits can be found [here](https://github.com/electron-userland/electron-forge/blob/main/CHANGELOG.md)_.


### Core

* add support for restarting the Electron process quickly from terminal ([24aab4fd](https://github.com/electron-userland/electron-forge/commit/24aab4fd))
* add resolveForgeConfig hook ([c2f4cfa6](https://github.com/electron-userland/electron-forge/commit/c2f4cfa6))
* allow mutating packageJSON on load ([1b7e4117](https://github.com/electron-userland/electron-forge/commit/1b7e4117))
* core: allow no config to be present, default to an empty object (#543) ([c71ef163](https://github.com/electron-userland/electron-forge/commit/c71ef163))
* core: resolve forge.config.js by default if it exists (#569) ([5431dfa1](https://github.com/electron-userland/electron-forge/commit/5431dfa1))
* add support for electron-nightly ([a74169ee](https://github.com/electron-userland/electron-forge/commit/a74169ee))
* add basic Forge v5 to v6 importer ([648ef333](https://github.com/electron-userland/electron-forge/commit/648ef333))
* add basic support for non-exact Electron versions ([177012e9](https://github.com/electron-userland/electron-forge/commit/177012e9))
* use git config to determine author before username (#920) ([57e30a47](https://github.com/electron-userland/electron-forge/commit/57e30a47))
* add a force flag to init to allow it to overwrite an existing directory (#1020) ([dcdc2a1c](https://github.com/electron-userland/electron-forge/commit/dcdc2a1c))
* add params to the postPackage hook (#1896) ([e9a2ba07](https://github.com/electron-userland/electron-forge/commit/e9a2ba07))

### Packagers

* added maker-pkg ([8728baa1](https://github.com/electron-userland/electron-forge/commit/8728baa1)) for .pkg files on macOS
* maker-dmg: update electron-installer-dmg for new features ([766259fa](https://github.com/electron-userland/electron-forge/commit/766259fa))
* Make autoUpdate and autoLaunch features configurable in MakerWixConfig (#2620) ([bf7d271a](https://github.com/electron-userland/electron-forge/commit/bf7d271a))

### Publishers

* add publisher-nucleus to add nucleus upload support to v6 ([131665cb](https://github.com/electron-userland/electron-forge/commit/131665cb))
* publisher-bitbucket: initial publish publisher-bitbucket (#571) ([82e8c85e](https://github.com/electron-userland/electron-forge/commit/82e8c85e))
* publisher-github: add debug support for Octokit (#2499) ([73252c30](https://github.com/electron-userland/electron-forge/commit/73252c30))
* publisher-github: add retry support (#2550) ([a400066d](https://github.com/electron-userland/electron-forge/commit/a400066d))
* publisher-ers: support flavor config (#2766) ([6069ebe1](https://github.com/electron-userland/electron-forge/commit/6069ebe1))

### Plugins

* plugin-local-electron: add plugin-local-electron ([8af92682](https://github.com/electron-userland/electron-forge/commit/8af92682))
* plugin webpack
    * plugin-webpack: new webpack plugin ([531d3c80](https://github.com/electron-userland/electron-forge/commit/531d3c80))
        * log out the web logger URL on start ([cdd4cde1](https://github.com/electron-userland/electron-forge/commit/cdd4cde1))
        * capture logs into web ui, handle preload scripts ([e800049b](https://github.com/electron-userland/electron-forge/commit/e800049b))
        * plugin-webpack: upgrade to webpack 4 ([8807c451](https://github.com/electron-userland/electron-forge/commit/8807c451))
        * support web workers by defining entry points without HTML files ([a85ce4eb](https://github.com/electron-userland/electron-forge/commit/a85ce4eb))
        * auto-ignore everything that is not webpack output during the webpack build. Fixes #593 ([51a22f74](https://github.com/electron-userland/electron-forge/commit/51a22f74))
        * add a barebones webpack template ([3b935c8f](https://github.com/electron-userland/electron-forge/commit/3b935c8f))
        * allow port to be configurable for web-multi-logger ([330d0f59](https://github.com/electron-userland/electron-forge/commit/330d0f59))
        * support native modules in webpack template ([ed5fd371](https://github.com/electron-userland/electron-forge/commit/ed5fd371))
        * add file-loader/style-loader for handling the static CSS file ([054a458a](https://github.com/electron-userland/electron-forge/commit/054a458a))
        * add typescript-webpack template (#1344) ([7c8259dd](https://github.com/electron-userland/electron-forge/commit/7c8259dd))
        * add template for typescript (#1319) ([cece7da7](https://github.com/electron-userland/electron-forge/commit/cece7da7))
        * add an option to export webpack compilation stats (#639) ([7275f390](https://github.com/electron-userland/electron-forge/commit/7275f390))
        * upgrade to Webpack 5 (#2225) ([564a4451](https://github.com/electron-userland/electron-forge/commit/564a4451))
        * improve native asset relocation without forking Vercel loader (#2320) ([db8a3f39](https://github.com/electron-userland/electron-forge/commit/db8a3f39))
        * add devContentSecurityPolicy config option (#2332) ([7d461090](https://github.com/electron-userland/electron-forge/commit/7d461090))
        * add nodeIntegration config for renderers (#2330) ([6e0a6248](https://github.com/electron-userland/electron-forge/commit/6e0a6248))
        * plugin-webpack: allow most webpack-dev-server options to be configurable (#2444) ([699d4862](https://github.com/electron-userland/electron-forge/commit/699d4862))
        * webpack-plugin: webpack 5 configuration factory (#2776) ([f4a77741](https://github.com/electron-userland/electron-forge/commit/f4a77741))
        * Add packageSourceMaps option to WebpackPluginConfig (#2581) ([2bb5e0d8](https://github.com/electron-userland/electron-forge/commit/2bb5e0d8))
        * allow specifing a seperate webpack config for your preload (#2679) ([f5909424](https://github.com/electron-userland/electron-forge/commit/f5909424))
        * Allow each entrypoints to specify `nodeIntegration` (#2867) ([1f45e2ca](https://github.com/electron-userland/electron-forge/commit/1f45e2ca))
* plugin-compile: add the electron compile plugin into the monorepo ([5907de5d](https://github.com/electron-userland/electron-forge/commit/5907de5d))
* add Electronegativity plugin (#1900) ([a6a65cae](https://github.com/electron-userland/electron-forge/commit/a6a65cae))

### CLI

* cli: dont check system if the marker file is created ([ce5a4a2e](https://github.com/electron-userland/electron-forge/commit/ce5a4a2e))
*  add —inspect-brk-electron option (#1328) ([c5a6ea17](https://github.com/electron-userland/electron-forge/commit/c5a6ea17))

### Other

* codebase rewritten in typescript
* add [fromBuildIdentifier](https://js.electronforge.io/classes/_electron_forge_core.ForgeUtils.html#fromBuildIdentifier): Helper for creating a dynamic config value that will get its real value based on the `buildIdentifier` in your Forge config.  ([dc6c9fce](https://github.com/electron-userland/electron-forge/commit/dc6c9fce))
* measure performance of async oras when in debug mode ([3b625ded](https://github.com/electron-userland/electron-forge/commit/3b625ded))
* Node 8 support (#875) ([db89c4ef](https://github.com/electron-userland/electron-forge/commit/db89c4ef))
* Various improvements for electron/template (#950) ([641f5218](https://github.com/electron-userland/electron-forge/commit/641f5218))
* s3: add options to allow use custom instance (#1601) ([38e63d15](https://github.com/electron-userland/electron-forge/commit/38e63d15))
* allow specifying alternative tag prefix (#2605) ([88d9d722](https://github.com/electron-userland/electron-forge/commit/88d9d722))
*  add a default preload script (#2722) ([636e2c5d](https://github.com/electron-userland/electron-forge/commit/636e2c5d))

<!-- links -->

[Core API]: https://www.npmjs.com/package/@electron-forge/core
[CLI API]: https://www.npmjs.com/package/@electron-forge/cli
[webpack template]: https://www.electronforge.io/templates/webpack-template




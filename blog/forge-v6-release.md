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
  - name: erickzhao
    url: 'https://github.com/erickzhao'
    image_url: 'https://github.com/erickzhao.png?size=96'
slug: forge-v6-release-blog
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Electron Forge Team is excited to announce that Forge v6 is now available! This stable release contains many significant new features and improvements. Highlights of this release include the addition of our Webpack plugin as well as the introduction of the Forge Core and CLI APIs.

## What does a stable release mean?

During our time in a beta release state, our team has been busy refactoring Forge’s code, improving its architecture, creating new features as well as ironing out bugs and issues.

A stable release means that we are done making major breaking changes, and that beta changes have been tested thoroughly both internally and through the community.

## Why switch to Forge from an existing pipeline?

If your app already uses an existing build tooling solution that provides packaging and publishing capabilities, the benefits associated with adopting Electron Forge can still outweigh the initial switching cost.

Electron Forge will receive features from the latest Electron tooling updates as soon as they come out. This means that alongside the implicit features and plugins that Forge provides, users won't need to wire in new tooling support themselves, or wait for that support to be eventually implemented by other packages before upgrading. This reduction in the burden of maintenance for Forge applications has already been observed when Electron released `@electron/universal` [support](https://github.com/electron/universal) as well as [ASAR Integrity checking](https://www.electronjs.org/docs/latest/tutorial/asar-integrity), which were features that Forge supported out of the box.

In addition, Forge was built with the intention of supporting custom plugins, makers and publishers. Forge's extensible API design means that you can write your own additional build logic for any advanced use cases that you may require. For more details, see the [Extending Electron Forge] section of the docs.

## Introducing the webpack plugin

This release adds webpack support to your build pipeline. Webpack is a module bundler: it takes your codebase’s dependencies and modules, creates a dependency graph, and bundles them (stitching them together into a single file) into a form that your index.html can read. Bundling increases performance by reducing the number of asset calls required.

Forge v6 comes with a [webpack template] that makes use of the new `@electron-forge/plugin-webpack` module, plus some preset Webpack configuration options. Configuration instructions can be found in the [docs](https://www.electronforge.io/config/plugins/webpack).

The addition of webpack support brings several webpack features to your Forge app. Notable features include but are not limited to:
- Hot module reloading
- DevServer support
- Adding content security policies
- Native module support

## The Forge API has moved

If you aren't already on the beta version of Forge, since the previous stable release the Forge v5 API has been refactored into its own separate node module. The new refactored Forge [Core API] exposes the v5 Forge API methods as well as a number of utility functions to Node, allowing you call them from within your own code.

This release also adds access to the Core API from your command line interface in the form of another [CLI API]. At a high level, this is a wrapper for the Forge Core API that is accessible from the terminal.

## Upgrading to Forge v6

Forge will try to migrate from Electron Forge v5 automatically as much as possible, but some of it may need to be migrated manually. Importing your settings can be done with the same process as importing an existing Electron app to Forge:

<Tabs>
  <TabItem value="Yarn" label="Yarn" default>

```
   cd my-app
   yarn add --dev @electron-forge/cli
   yarn electron-forge import
```

  </TabItem>
  <TabItem value="NPM" label="NPM">

```
   cd my-app
   npm install --save-dev @electron-forge/cli
   npm exec --package=@electron-forge/cli -c "electron-forge import"
```

  </TabItem>
</Tabs>

Manual migration details can be found in the Forge [import documentation]. Further help can be offered in our [Discord](https://discord.gg/f4cH9BzaDw).

## Breaking changes since beta:

_A complete list of changes and commits can be found [here](https://github.com/electron-userland/electron-forge/blob/main/CHANGELOG.md)_.

- removed `@electron-forge/template-typescript` template ([#2948](https://github.com/electron-userland/electron-forge/commit/fc9421d513300b98c987af41ae71cb5d7e696fd1))
- removed `install` command ([#2958](https://github.com/electron-userland/electron-forge/commit/6b215b0c1d91c998bb2ab953b502e87868527ed9))
- renamed the default repository branch from `master` to `main` ([#2946](https://github.com/electron-userland/electron-forge/commit/d28974e35b5e64aa94e6cc53dce36c8e53f5b5bf))
- renamed `electronRebuildConfig` to `rebuildConfig` ([placeholdercommitmsg](https://github.com/electron-userland/electron-forge/pull/2963))
- renamed `identity-validation` to`identityValidation` ([#2959](https://github.com/electron-userland/electron-forge/commit/dba9359026b6b72479bff8133ec0c2c2e05d5595))

## A call to action:
Tell us what you need! The Electron Forge Team is always looking to build the project to better suit its users. You can help us improve Electron Forge by submitting feature requests, posting issues, or just letting us know your feedback!

<!-- links -->

[Core API]: https://www.npmjs.com/package/@electron-forge/core
[CLI API]: https://www.npmjs.com/package/@electron-forge/cli
[import documentation]: https://www.electronforge.io/import-existing-project
[webpack template]: https://www.electronforge.io/templates/webpack-template]
[Extending Electron Forge]: https://www.electronforge.io/advanced/extending-electron-forge

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
slug: forge-v6-release
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

We are excited to announce that Electron Forge v6.0.0 is now available! This release marks the first major of Forge since 2018 and moves Forge from its home in `electron-userland` into the main Electron organization on Github. Keep on reading to see what's new and how your app can adopt Electron Forge!

## What is Forge?

Electron Forge is a tool for packaging and publishing Electron applications. It unifies Electron's build tooling ecosystem into a single extensible interface so that anyone can jump right into making Electron apps.

Visit the [Why Electron Forge] section of our docs to learn more about Forge and the benefits that it offers.

## What does this release mean for Forge?

### A complete rewrite

From v1 to v5, Electron Forge was based on the now-discontinued [`electron-compile`](https://www.npmjs.com/package/electron-compile) project. Forge v6 is a complete rewrite of the project with a new modular architecture that can be extended to meet any Electron application's needs. In the past few years, Forge v6.0.0-beta has achieved feature parity with v5 and code churn has slowed down dramatically, making the tool ready for general adoption.

### Making it official

Historically, the Electron project has been unopinionated about build tooling, leaving the task to various community-maintained packages. However, with Electron maturing as a project, it has become harder for new Electron developers to understand which tools they need to build and distribute their apps to users.
To help guide Electron developers in the distribution process, **we have have decided to make Forge the official batteries-included build pipeline for Electron**. Over the past year, we have been slowly integrating Forge into the official Electron documentation, and we have most recently moved Forge over from its old home in electron-userland/electron-forge to the [electron/forge](https://github.com/electron/forge) repo.

## Installing / upgrading to Forge v6

:::info

This section assumes you have a pre-existing project. If you are looking to get started with a new Forge project, head on to the [Getting Started] section in the docs. 

:::

Forge will try to migrate from Electron Forge v5 automatically as much as possible using the same process as importing an existing Electron app to Forge. Some of it may need to be migrated manually. Importing your settings can be done using the [CLI API] node module, which at a high level is a wrapper for the Forge [Core API] that is accessible from the terminal.

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

## Why switch to Forge from an existing pipeline?

If your app already uses an existing build tooling solution that provides packaging and publishing capabilities, the benefits associated with adopting Electron Forge can still outweigh the initial switching cost.

We believe there are two main advantages to using Forge:

1. *Forge receives new features for application building as soon as they are supported in Electron*. This means that alongside the implicit features and plugins that Forge provides, users won't need to wire in new tooling support themselves, or wait for that support to be eventually implemented by other packages before upgrading. This reduction in the burden of maintenance for Forge applications has already been observed when Electron released `@electron/universal` [support](https://github.com/electron/universal) as well as [ASAR Integrity checking](https://www.electronjs.org/docs/latest/tutorial/asar-integrity), which were features that Forge supported out of the box.

1. *Forge's multi-package architecture makes it easy to understand and extend.* Forge was built with the intention of supporting custom plugins, makers and publishers. Since Forge is made up of many smaller packages with clear responsibilities, it is easier to follow code flow. In addition, Forge's extensible API design means that you can write your own additional build logic separate from the provided configuration options for advanced use cases. For more details on extensibility, see the [Extending Electron Forge] section of the docs.

## Introducing the webpack plugin

This release adds webpack support to your build pipeline. Webpack is a module bundler: it takes your codebase’s dependencies and modules, creates a dependency graph, and bundles them (stitching them together into a single file) into a form that your index.html can read. Bundling increases performance by reducing the number of asset calls required.

Forge v6 comes with a [webpack template] that makes use of the new `@electron-forge/plugin-webpack` module, plus some preset Webpack configuration options. Configuration instructions can be found in the [docs](https://www.electronforge.io/config/plugins/webpack).

The addition of webpack support brings several webpack features to your Forge app. Notable features include but are not limited to:
- Hot module reloading
- DevServer support
- Adding content security policies
- Native module support

## The Forge API has moved

If you aren't already on the beta version of Forge, the Forge v5 API has been refactored into its own separate node module in Forge v6. The new Forge [Core API] exposes the v5 Forge API methods as well as a number of utility functions to Node, allowing you call them from within your own code.

## Breaking changes:

Forge has spent a considerable time in beta development; this is a list of breaking changes made in recent betas, so that users who have been using the later beta versions in their apps can more easily transition to the stable release.

_A complete list of changes and commits can be found [here](https://github.com/electron-userland/electron-forge/blob/main/CHANGELOG.md)_.

#### Changed plugin configuration syntax ([#2963](https://github.com/electron-userland/electron-forge/pull/2963))

The `plugins` array now takes objects containing an object with properties `name` and `config`, rather than tuples containing the plugin name and config.

This aligns the syntax for this configuration with the `publishers` and `makers` arrays.

```diff
{
  plugins: [
-      [
-        '@electron-forge/plugin-webpack',
-        { /* ... */ }
-      ]
+
+      {
+        name: '@electron-forge/plugin-webpack',
+        config: { /* ... */ }
+      }
 ]
}
```

#### Prefer forge.config.js over package.json config ([#2991](https://github.com/electron-userland/electron-forge/commit/777197e5))

  - This change affects the init and import commands. It changes these commands to create a forge.config.js rather than creating config.forge in your package.json.
  - The internal signature of `Plugin.getHook(name)` has been changed to `Plugin.getHooks(name)` [#2995](https://github.com/electron/forge/pull/2995) as part of these changes.
  - This is considered a breaking change for any third-party templates because the base template no longer sets up a config.forge object, and any template-specific mutations to the Forge config should instead be performed on the forge.config.js file.
  - templates that mutated the Forge config within `package.json` will need to instantiate their own `forge.config.js` or `forge.config.ts`

#### Upgraded Maker Wix dependency to `electron-wix-msi@5.0.0` ([3008](https://github.com/electron/forge/pull/3008)))
  - This upgrade includes a rename from `appIconPath` to `icon` in the config ([#153](https://github.com/electron-userland/electron-wix-msi/pull/153)).

#### Upgraded required Node.js to 14 LTS ([#2921](https://github.com/electron/forge/pull/2921))

#### Upgraded package dependency to `electron-packager@17` ([#2978](https://github.com/electron-userland/electron-forge/pull/2978))

The upgrade to Electron Packager 17 introduces the shiny new `@electron/osx-sign` package for macOS code signing. It's a rewrite of the old `electron-osx-sign` tool with more sensible defaults.

To migrate, we recommend seeing if the default `packagerConfig.osxSign` options work for you and tweaking the default entitlements to your needs. Otherwise, see the `@electron/osx-sign` [MIGRATION.md](https://github.com/electron/osx-sign/blob/main/MIGRATION.md) doc for a 1:1 conversion from the old config options to the new ones.

#### Renamed Electron Rebuild config ([#2963](https://github.com/electron-userland/electron-forge/pull/2963))

For consistency with the `packagerConfig` option for `electron-packager`, the field to configure `@electron/rebuild` has now been shortened to `rebuildConfig`.

```diff
{
-  electronRebuildConfig: { /* ... */ }
+  rebuildConfig: { /* ... */ }
}
```

#### Renamed `identity-validation` to`identityValidation` ([#2959](https://github.com/electron-userland/electron-forge/pull/2959))

The field to configure `identity-validation` has now been shortened to `identityValidation`.
1
```diff
{
-  identity-validation: ""
+  identityValidation: ""
}
```

#### Removed `@electron-forge/template-typescript` template ([#2948](https://github.com/electron-userland/electron-forge/commit/fc9421d513300b98c987af41ae71cb5d7e696fd1))

- this has been removed in favor of the [Webpack + TypeScript Template].

#### Removed `lint` command ([#2964](https://github.com/electron/forge/pull/2964))

#### Removed `install` command ([#2958](https://github.com/electron-userland/electron-forge/commit/6b215b0c1d91c998bb2ab953b502e87868527ed9))

## A call to action:

Tell us what you need! The Electron Forge Team is always looking to build the project to better suit its users.
 
You can help us improve Electron Forge by submitting feature requests, posting [issues](https://github.com/electron/forge/issues), or just letting us know your feedback! You can also join us in the [official Electron Discord server](https://discord.com/invite/electronjs), where there is a dedicated channel for Electron Forge.

<!-- links -->

[Core API]: https://www.npmjs.com/package/@electron-forge/core
[CLI API]: https://www.npmjs.com/package/@electron-forge/cli
[Getting Started]: https://www.electronforge.io/
[import documentation]: https://www.electronforge.io/import-existing-project
[webpack template]: https://www.electronforge.io/templates/webpack-template]
[Extending Electron Forge]: https://www.electronforge.io/advanced/extending-electron-forge
[TypeScript + webpack template]: https://www.electronforge.io/templates/typescript-+-webpack-template
[Why Electron Forge]: https://www.electronforge.io/core-concepts/why-electron-forge
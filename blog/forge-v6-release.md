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

Electron Forge is a tool for packaging and publishing Electron applications. It unifies Electron's build tooling ecosystem into a single extensible interface so that anyone can jump right into making Electron apps. Forge comes with customizable flows to package
and sign your app, bundle it into distributable formats for each target platform and architecture, as well as publish it online for your users.

Visit the [Why Electron Forge] section of its documentation to learn more.

## What does this release mean for Forge?

### A complete rewrite

From v1 to v5, Electron Forge was based on the now-discontinued [`electron-compile`](https://www.npmjs.com/package/electron-compile) project. Forge v6 is a complete rewrite of the project with a new modular architecture that can be extended to meet any Electron application's needs. In the past few years, Forge v6.0.0-beta has achieved feature parity with v5 and code churn has slowed down dramatically, making the tool ready for general adoption.

### Making it official

Historically, the Electron project has been unopinionated about build tooling, leaving the task to various community-maintained packages. However, with Electron maturing as a project, it has become harder for new Electron developers to understand which tools they need to build and distribute their apps to users.
To help guide Electron developers in the distribution process, **we have have decided to make Forge the official batteries-included build pipeline for Electron**. Over the past year, we have been slowly integrating Forge into the official Electron documentation, and we have most recently moved Forge over from its old home in electron-userland/electron-forge to the [electron/forge](https://github.com/electron/forge) repo.

## Initializing a new Electron project with Forge v6

Getting started with Electron Forge can be done easily with the following commands:

<Tabs>
  <TabItem value="Yarn" label="Yarn" default>

```bash
   yarn create electron-app my-app --template=webpack
   cd my-app
   yarn start
```

  </TabItem>
  <TabItem value="NPM" label="NPM">

```bash
   npx create-electron-app@latest my-app --template=webpack
   cd my-app
   npm start
```

  </TabItem>
</Tabs>

These commands will yield a directory called `my-app` with some Electron app boilerplate inside. We have also slipped in a `--template=webpack` option into the initialization command, which adds some preset webpack configuration options to your project. If you head into the `my-app` directory and start up the app, you'll be all set to start developing. Running the `make` command after these steps will package your Electron app into platform specific distributables for you to share with the world. For more information on how to get started, visit the [Getting Started] section in the docs.

### Introducing the webpack plugin

This release adds webpack support to your build pipeline via the new `@electron-forge/plugin-webpack` module. To get you up and running as fast as possible, Forge v6 comes with a [webpack template], which we have slipped into the initialization commands above. This will add some preset webpack configuration options to your project.

This plugin integrates webpack with Electron Forge in a few ways, including:
- enhancing the local development flow with webpack-dev-server, including support for Hot Module Replacement in the renderer;
- handling build logic for webpack bundles before the Package step; and
- adding support for Native Node modules in the webpack bundling process.

## Importing an existing project into Forge v6

<Tabs>
  <TabItem value="Yarn" label="Yarn" default>

```bash
   cd my-app
   yarn add --dev @electron-forge/cli
   yarn electron-forge import
```

  </TabItem>
  <TabItem value="NPM" label="NPM">

```bash
   cd my-app
   npm install --save-dev @electron-forge/cli
   npm exec --package=@electron-forge/cli -c "electron-forge import"
```

  </TabItem>
</Tabs>

When you use the `import` command, Electron Forge will add a few core dependencies and create a new `forge.config.js` configuration. If you have any existing build tooling (e.g. Electron Packager, Electron Builder, Forge v5), it will try to migrate as many settings as possible. Some of your existing configuration may need to be migrated manually.

Manual migration details can be found in the Forge [import documentation]. If you need help, please stop by the Electron [Discord](https://discord.gg/f4cH9BzaDw) server.

## Why switch to Forge from an existing pipeline?

If you already have tooling for packaging and publishing your electron app, the benefits associated with adopting Electron Forge can still outweigh the initial switching cost.

We believe there are two main benefits to using Forge:

1. *Forge receives new features for application building as soon as they are supported in Electron*. This means that alongside the implicit features and plugins that Forge provides, users won't need to wire in new tooling support themselves, or wait for that support to be eventually implemented by other packages before upgrading. For recent examples, see [`@electron/universal`](https://github.com/electron/universal) as well as [ASAR Integrity checking](https://www.electronjs.org/docs/latest/tutorial/asar-integrity).

1. *Forge's multi-package architecture makes it easy to understand and extend.* Forge was built with the intention of supporting custom plugins, makers and publishers. Since Forge is made up of many smaller packages with clear responsibilities, it is easier to follow code flow. In addition, Forge's extensible API design means that you can write your own additional build logic separate from the provided configuration options for advanced use cases. For more details on extensibility, see the [Extending Electron Forge] section of the docs.

## Breaking changes

Forge has spent a considerable time in beta development; this is a list of breaking changes made in recent betas (>= 6.0.0-beta.65), so that users who have been using the later beta versions in their apps can more easily transition to the stable release.

_A complete list of changes and commits can be found [here](https://github.com/electron/forge/blob/main/CHANGELOG.md)_.

### Config: Changed `plugins` syntax ([#2963](https://github.com/electron/forge/pull/2963))

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

### Config: Prefer `forge.config.js` for new Forge projects ([#2991](https://github.com/electron/forge/commit/777197e5)) [#2995](https://github.com/electron/forge/pull/2995)

We have changed the `electron-forge init` and `electron-forge import` commands to create a JavaScript config file rather than a section in `package.json`. This is to better
support dynamic build logic that isn't possible with the JSON format. Forge now has better support for alternate configuration syntaxes via [rechoir](https://github.com/gulpjs/rechoir).

This is a breaking change for any existing third-party templates and plugins:
- The internal signature of `Plugin.getHook(name)` has changed to `Plugin.getHooks().name`.
- Templates that mutated the Forge config within `package.json` will need to instantiate their own `forge.config.js` or `forge.config.ts`
  
### Config: Renamed Electron Rebuild config ([#2963](https://github.com/electron/forge/pull/2963))

For consistency with the `packagerConfig` option for `electron-packager`, the field to configure `@electron/rebuild` has now been shortened to `rebuildConfig`.

```diff
{
-  electronRebuildConfig: { /* ... */ }
+  rebuildConfig: { /* ... */ }
}
```

### Config: Renamed `ElectronRebuildConfig` ([#2963](https://github.com/electron/forge/pull/2963))

 Removed `@electron-forge/template-typescript` template ([#2948](https://github.com/electron/forge/commit/fc9421d513300b98c987af41ae71cb5d7e696fd1))

This has been removed in favor of the [Webpack + TypeScript Template]. 
  
### Maker: Upgraded Maker Wix dependency to `electron-wix-msi@5.0.0` ([3008](https://github.com/electron/forge/pull/3008)))

This upgrade includes a rename from `appIconPath` to `icon` in the config ([#153](https://github.com/electron/forge/pull/153)). This aligns WiX MSI's icon config with the other makers.

### Build: Upgraded required Node.js to 14 LTS ([#2921](https://github.com/electron/forge/pull/2921))

### Package: Upgraded package dependency to `electron-packager@17` ([#2978](https://github.com/electron/forge/pull/2978))

The upgrade to Electron Packager 17 introduces the shiny new `@electron/osx-sign` package for macOS code signing. It's a rewrite of the old `electron-osx-sign` tool with more sensible defaults.

To migrate, we recommend seeing if the default `packagerConfig.osxSign` options work for you and tweaking the default entitlements to your needs. Otherwise, see the `@electron/osx-sign` [MIGRATION.md](https://github.com/electron/osx-sign/blob/main/MIGRATION.md) doc for a 1:1 conversion from the old config options to the new ones.

### Command: Removed `lint` command ([#2964](https://github.com/electron/forge/pull/2964))

### Command: Removed `install` command ([#2958](https://github.com/electron/forge/pull/2958))

## Submit your feedback!

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

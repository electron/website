---
title: Introducing Electron Forge 6
date: 2022-11-03T00:00:00.000Z
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
toc_max_heading_level: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

We are excited to announce that Electron Forge v6.0.0 is now available! This release marks the first major release of Forge since 2018 and moves the project from `electron-userland` into the main `electron` organization on Github.

Keep on reading to see what's new and how your app can adopt Electron Forge!

## What is Electron Forge?

[Electron Forge](https://electronforge.io) is a tool for packaging and distributing Electron applications. It unifies Electron's build tooling ecosystem into a single extensible interface so that anyone can jump right into making Electron apps.

Highlight features include:
* 📦 Application packaging and code signing
* 🚚 Customizable installers on Windows, macOS, and Linux (DMG, deb, MSI, PKG, AppX, etc.)
* ☁️ Automated publishing flow for cloud providers (GitHub, S3, Bitbucket, etc.)
* ⚡️ Easy-to-use boilerplate templates for webpack and TypeScript
* ⚙️ Native Node.js module support
* 🔌 Extensible JavaScript plugin API

:::info Further reading

Visit the [Why Electron Forge] explainer document to learn more about Forge's philosophy and architecture.

:::

## What's new in v6?

### Completely rewritten

From v1 to v5, Electron Forge was based on the now-discontinued [`electron-compile`](https://www.npmjs.com/package/electron-compile) project. Forge 6 is a complete rewrite of the project with a new modular architecture that can be extended to meet any Electron application's needs.

In the past few years, Forge `v6.0.0-beta` has achieved feature parity with v5 and code churn has slowed down dramatically, making the tool ready for general adoption.

:::caution Don't install the wrong package

For versions 5 and below, Electron Forge was published to the `electron-forge` package on npm.
Starting with the v6 rewrite, Forge is instead structured as a monorepo project with many smaller
projects.

:::

### Officially supported

Historically, Electron maintainers have been unopinionated about build tooling, leaving the task to various community packages. However, with Electron maturing as a project, it has become harder for new Electron developers to understand which tools they need to build and distribute their apps.

To help guide Electron developers in the distribution process, **we have have decided to make Forge the official batteries-included build pipeline for Electron**.

Over the past year, we have been slowly integrating Forge into the official Electron documentation, and we have recently moved Forge over from its old home in `electron-userland/electron-forge` to the [electron/forge](https://github.com/electron/forge) repo. Now, we are finally ready to release Electron Forge to a general audience!

## Getting started

### Initializing a new Forge project

Scaffolding a new Electron Forge project can be done using the `create-electron-app` CLI script.

<Tabs>
  <TabItem value="Yarn" label="Yarn" default>

```bash
yarn create electron-app my-app --template=webpack
cd my-app
yarn start
```

  </TabItem>
  <TabItem value="npm" label="npm">

```bash
npm init electron-app@latest my-app --template=webpack
cd my-app
npm start
```

  </TabItem>
</Tabs>

The script will create an Electron project in the `my-app` folder with completely JavaScript bundling and a preconfigured build pipeline.

For more info, see the [Getting Started] guide in the Forge docs.

:::info First-class webpack support

The above snippet uses Forge's [Webpack Template], which we recommend as a starting point for new Electron projects. This template is built around the [`@electron-forge/plugin-webpack`](https://www.electronforge.io/config/plugins/webpack) plugin, which integrates webpack with Electron Forge in a few ways, including:

- enhancing local dev flow with [webpack-dev-server](https://webpack.js.org/configuration/dev-server/), including support for HMR in the renderer;
- handling build logic for webpack bundles before application packaging; and
- adding support for Native Node modules in the webpack bundling process.

If you need TypeScript support, consider using the [Webpack + TypeScript Template] instead.

:::

### Importing an existing project

The Electron Forge CLI also contains an import command for existing Electron projects.

<Tabs>
  <TabItem value="Yarn" label="Yarn" default>

```bash
cd my-app
yarn add --dev @electron-forge/cli
yarn electron-forge import
```

  </TabItem>
  <TabItem value="npm" label="npm">

```bash
cd my-app
npm install --save-dev @electron-forge/cli
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

  </TabItem>
</Tabs>

When you use the `import` command, Electron Forge will add a few core dependencies and create a new `forge.config.js` configuration. If you have any existing build tooling (e.g. Electron Packager, Electron Builder, or Forge 5), it will try to migrate as many settings as possible. Some of your existing configuration may need to be migrated manually.

Manual migration details can be found in the Forge [import documentation]. If you need help, please stop by [our Discord server](https://discord.gg/f4cH9BzaDw)!

## Why switch to Forge?

If you already have tooling for packaging and publishing your Electron app, the benefits associated with adopting Electron Forge can still outweigh the initial switching cost.

We believe there are two main benefits to using Forge:

1. **Forge receives new features for application building as soon as they are supported in Electron**. In this case, you won't need to wire in new tooling support yourself, or wait for that support to be eventually implemented by other packages before upgrading. For recent examples, see [macOS universal binaries](https://github.com/electron/universal) and [ASAR integrity checking](https://www.electronjs.org/docs/latest/tutorial/asar-integrity).

1. **Forge's multi-package architecture makes it easy to understand and extend.** Since Forge is made up of many smaller packages with clear responsibilities, it is easier to follow code flow. In addition, Forge's extensible API design means that you can write your own additional build logic separate from the provided configuration options for advanced use cases. For more details on writing custom Forge plugins, makers, and publishers, see the [Extending Electron Forge] section of the docs.

## Breaking changes

Forge 6 has spent a long time in the beta phase, and its release cadence has gradually slowed down. However, we have accelerated development in the second half of 2022 and used the last few releases to push some final breaking changes before the v6.0.0 stable release.

If you are an Electron Forge 6 beta user, see the [v6.0.0 GitHub release notes](https://github.com/electron/forge/releases/tag/v6.0.0) for a list of breaking changes made in recent betas (`>=6.0.0-beta.65`).

A complete list of changes and commits can be found in the repo's [CHANGELOG.md](https://github.com/electron/forge/blob/main/CHANGELOG.md).

## Submit your feedback!

Tell us what you need! The Electron Forge team is always looking to build the project to better suit its users.

You can help us improve Electron Forge by submitting feature requests, posting [issues](https://github.com/electron/forge/issues), or just letting us know your feedback! You can also join us in the [official Electron Discord server](https://discord.com/invite/electronjs), where there is a dedicated channel for Electron Forge discussion.

If you want to give any feedback on the Forge docs at https://electronforge.io, we have a
GitBook instance synced to the
[electron-forge/electron-forge-docs](https://github.com/electron-forge/electron-forge-docs) repo.

<!-- links -->

[getting started]: https://www.electronforge.io/
[import documentation]: https://www.electronforge.io/import-existing-project

[webpack template]: https://www.electronforge.io/templates/webpack-template
[webpack + typescript template]: https://www.electronforge.io/templates/typescript-+-webpack-template
[Extending Electron Forge]: https://www.electronforge.io/advanced/extending-electron-forge
[Why Electron Forge]: https://www.electronforge.io/core-concepts/why-electron-forge

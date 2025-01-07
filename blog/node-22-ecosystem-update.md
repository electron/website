---
title: Moving our Ecosystem to Node 22
date: 2025-01-07T00:00:00.000Z
authors: VerteDinde
slug: ecosystem-node-22
tags: [community, ecosystem]
---

In early 2025, Electron’s npm ecosystem repos (under the `@electron/` and `@electron-forge/` namespaces) will move to Node.js 22 as the minimum supported version.

---

### What does this mean?

In the past, packages in Electron’s npm ecosystem (Forge, Packager, etc) have supported Node versions for as long as possible, even after a version has reached its End-Of-Life (EOL) date. This is done to make sure we don’t fragment the ecosystem—we understand that many projects depend on older versions of Node, and we don’t want to risk stranding those projects unless there was a pressing reason to upgrade.

Over time, using Node.js 14 as our minimum version has become increasingly difficult for a few reasons:

- Lack of official Node.js 14 macOS ARM64 builds requires us to maintain CI infrastructure workarounds to provide full test coverage.
- `engines` requirements for upstream package dependencies have moved forward, making it increasingly difficult to resolve supply chain security issues with dependency bumps.

Additionally, newer versions of Node.js have included many improvements that we would like to leverage, such as runtime-native common utilities (e.g. [`fs.glob`](https://nodejs.org/api/fs.html#fsglobpattern-options-callback) and [`util.parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig)) and entire new batteries-included modules (e.g. [`node:test`](https://nodejs.org/api/test.html), [`node:sqlite`](https://nodejs.org/api/sqlite.html)).

### Why upgrade now?

In July 2024, Electron’s Ecosystem Working Group decided to upgrade all packages to the earliest Node version where `require()`of synchronous ESM graphs will be supported (see [nodejs/node#51977](https://github.com/nodejs/node/pull/51977) and [nodejs/node#53500](https://github.com/nodejs/node/pull/53500)) at a future point after that version reaches its LTS date.

We’ve decided to set that update time to January/February 2025. After this upgrade occurs, Node 22 will be the minimum supported version in existing ecosystem packages.

### What action do I need to take?

We’ll strive to maintain compatibility as much as possible. However, to ensure the best support, we encourage you to upgrade your apps to Node 22 or higher.

Note that the Node version running in your project is unrelated to the Node version embedded into your current version of Electron.

### What's next

Please feel free to write to us at [info@electronjs.org](mailto:info@electronjs.org) if you have any questions or concerns. You can also find community support in our official [Electron Discord](https://discord.gg/electronjs).

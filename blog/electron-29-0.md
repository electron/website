---
title: Electron 29.0.0
date: 2024-02-20T00:00:00.000Z
authors: VerteDinde
slug: electron-29-0
tags: [release]
---

Electron 29.0.0 has been released! It includes upgrades to Chromium `122.0.6261.39`, V8 `12.2`, and Node.js `20.9.0`.

---

The Electron team is excited to announce the release of Electron 29.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

- Added a new top-level `webUtils` module, a renderer process module that provides a utility layer to interact with Web API objects. The first available API in the module is `webUtils.getPathForFile`. Electron's previous `File.path` augmentation was a deviation from web standards; this new API is more in line with current web standards behavior.

## Stack Changes

- Chromium `122.0.6261.39`
  - New in [Chrome 122](https://developer.chrome.com/blog/new-in-chrome-122/) and in [DevTools 122](https://developer.chrome.com/blog/new-in-devtools-122/)
  - New in [Chrome 121](https://developer.chrome.com/blog/new-in-chrome-121/) and in [DevTools 121](https://developer.chrome.com/blog/new-in-devtools-121/)
- Node `20.9.0`
  - [Node 20.9.0 notes](https://nodejs.org/en/blog/release/v20.9.0/)
  - [Node 20.0.0 notes](https://nodejs.org/en/blog/release/v20.0.0/)
- V8 `12.2`

Electron 29 upgrades Chromium from `120.0.6099.56` to `122.0.6261.39`, Node from `18.18.2` to `20.9.0`, and V8 from `12.0` to `12.2`.

## New Features

- Added new `webUtils` module, a utility layer to interact with Web API objects, to replace `File.path` augmentation. [#38776](https://github.com/electron/electron/pull/38776)
- Added [net](https://www.electronjs.org/docs/latest/api/net) module to [utility process](https://www.electronjs.org/docs/latest/glossary#utility-process). [#40890](https://github.com/electron/electron/pull/40890)
- Added a new [Electron Fuse](https://www.electronjs.org/docs/latest/tutorial/fuses), `grantFileProtocolExtraPrivileges`, that opts the `file://` protocol into more secure and restrictive behaviour that matches Chromium. [#40372](https://github.com/electron/electron/pull/40372)
- Added an option in `protocol.registerSchemesAsPrivileged` to allow V8 code cache in custom schemes. [#40544](https://github.com/electron/electron/pull/40544)
- Migrated `app.{set|get}LoginItemSettings(settings)` to use Apple's new recommended underlying framework on macOS 13.0+. [#37244](https://github.com/electron/electron/pull/37244)

## Breaking Changes

### Behavior Changed: `ipcRenderer` can no longer be sent over the `contextBridge`

Attempting to send the entire `ipcRenderer` module as an object over the `contextBridge` will now result in
an empty object on the receiving side of the bridge. This change was made to remove / mitigate
a security footgun. You should not directly expose ipcRenderer or its methods over the bridge.
Instead, provide a safe wrapper like below:

```js
contextBridge.exposeInMainWorld('app', {
  onEvent: (cb) => ipcRenderer.on('foo', (e, ...args) => cb(args)),
});
```

### Removed: `renderer-process-crashed` event on `app`

The `renderer-process-crashed` event on `app` has been removed.
Use the new `render-process-gone` event instead.

```js
// Removed
app.on('renderer-process-crashed', (event, webContents, killed) => {
  /* ... */
});

// Replace with
app.on('render-process-gone', (event, webContents, details) => {
  /* ... */
});
```

### Removed: `crashed` event on `WebContents` and `<webview>`

The `crashed` events on `WebContents` and `<webview>` have been removed.
Use the new `render-process-gone` event instead.

```js
// Removed
win.webContents.on('crashed', (event, killed) => {
  /* ... */
});
webview.addEventListener('crashed', (event) => {
  /* ... */
});

// Replace with
win.webContents.on('render-process-gone', (event, details) => {
  /* ... */
});
webview.addEventListener('render-process-gone', (event) => {
  /* ... */
});
```

### Removed: `gpu-process-crashed` event on `app`

The `gpu-process-crashed` event on `app` has been removed.
Use the new `child-process-gone` event instead.

```js
// Removed
app.on('gpu-process-crashed', (event, killed) => {
  /* ... */
});

// Replace with
app.on('child-process-gone', (event, details) => {
  /* ... */
});
```

## End of Support for 26.x.y

Electron 26.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E29 (Feb'24) | E30 (Apr'24) | E31 (Jun'24) |
| ------------ | ------------ | ------------ |
| 29.x.y       | 30.x.y       | 31.x.y       |
| 28.x.y       | 29.x.y       | 30.x.y       |
| 27.x.y       | 28.x.y       | 29.x.y       |

## What's Next

Did you know that Electron recently added a community Request for Comments (RFC) process? If you want to add a feature to the framework, RFCs can be a useful tool to start a dialogue with maintainers on its design. You can also see upcoming changes being discussed in the Pull Requests. To learn more, check out our [Introducing electron/rfcs](https://www.electronjs.org/blog/rfcs) blog post, or check out the README of the [electron/rfcs](https://www.github.com/electron/rfcs) repository directly.

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

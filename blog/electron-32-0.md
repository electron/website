---
title: Electron 32.0.0
date: 2024-08-20T00:00:00.000Z
authors: VerteDinde
slug: electron-32-0
tags: [release]
---

Electron 32.0.0 has been released! It includes upgrades to Chromium `128.0.6613.36`, V8 `12.8`, and Node `20.16.0`.

---

The Electron team is excited to announce the release of Electron 32.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Added new API version history in our documentation, a feature created by @piotrpdev as part of Google Summer of Code. [#42982](https://github.com/electron/electron/pull/42982)
- Removed nonstandard File.path extension from the Web File API. [#42053](https://github.com/electron/electron/pull/42053)
- Aligned failure pathway in File System Access API with upstream when attempting to open a file or directory in a blocked path. [#42993](https://github.com/electron/electron/pull/42993)
- Added the following existing navigation related APIs to `webcontents.navigationHistory`: `canGoBack`, `goBack`, `canGoForward`, `goForward`, `canGoToOffset`, `goToOffset`, `clear`. The previous navigation APIs are not deprecated. [#41752](https://github.com/electron/electron/pull/41752)

### Stack Changes

- Chromium`128.0.6613.36`
  - [New in 128](https://developer.chrome.com/blog/new-in-chrome-128/)
  - [New in 127](https://developer.chrome.com/blog/new-in-chrome-127/)
- Node `20.16.0`
  - [Node 20.16.0 blog post](https://nodejs.org/en/blog/release/v20.16.0/)
- V8 `12.8`

Electron 32 upgrades Chromium from `126.0.6478.36` to `128.0.6613.36`, Node from `20.14.0` to `20.16.0`, and V8 from `12.6` to `12.8`.

### New Features

- Added support for responding to auth requests initiated from utility process. [#43317](https://github.com/electron/electron/pull/43317)
- Added `cumulativeCPUUsage` to `AppMetrics` and `CPUUsage`. [#41819](https://github.com/electron/electron/pull/41819)
- Added the following existing navigation related APIs to `webcontents.navigationHistory`: `canGoBack`, `goBack`, `canGoForward`, `goForward`, `canGoToOffset`, `goToOffset`, `clear`. [#41752](https://github.com/electron/electron/pull/41752)
- Extended `WebContentsView` to accept pre-existing `webContents` object. [#42086](https://github.com/electron/electron/pull/42086)
- Added a new property `prefersReducedTransparency` to `nativeTheme`, which indicates whether the user has chosen to reduce OS-level transparency via system accessibility settings. [#43137](https://github.com/electron/electron/pull/43137)
- Aligned failure pathway in File System Access API with upstream when attempting to open a file or directory in a blocked path. [#42993](https://github.com/electron/electron/pull/42993)
- Enabled the Windows Control Overlay API on Linux. [#42681](https://github.com/electron/electron/pull/42681)
- Enabled `zstd` compression in net http requests. [#43300](https://github.com/electron/electron/pull/43300)

### Breaking Changes

#### Removed: `File.path`

The nonstandard `path` property of the Web `File` object was added in an early version of Electron as a convenience method for working with native files when doing everything in the renderer was more common. However, it represents a deviation from the standard and poses a minor security risk as well, so beginning in Electron 32.0 it has been removed in favor of the [`webUtils.getPathForFile`](api/web-utils.md#webutilsgetpathforfilefile) method.

```js
// Before (renderer)
const file = document.querySelector('input[type=file]');
alert(`Uploaded file path was: ${file.path}`);
```

```js
// After (renderer)
const file = document.querySelector('input[type=file]');
electron.showFilePath(file);

// After (preload)
const { contextBridge, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  showFilePath(file) {
    // It's best not to expose the full file path to the web content if
    // possible.
    const path = webUtils.getPathForFile(file);
    alert(`Uploaded file path was: ${path}`);
  },
});
```

#### Deprecated: `clearHistory`, `canGoBack`, `goBack`, `canGoForward`, `goForward`, `goToIndex`, `canGoToOffset`, `goToOffset` on `WebContents`

The navigation-related APIs are now deprecated. These APIs have been moved to the `navigationHistory` property of `WebContents` to provide a more structured and intuitive interface for managing navigation history.

```js
// Deprecated
win.webContents.clearHistory();
win.webContents.canGoBack();
win.webContents.goBack();
win.webContents.canGoForward();
win.webContents.goForward();
win.webContents.goToIndex(index);
win.webContents.canGoToOffset();
win.webContents.goToOffset(index);

// Replace with
win.webContents.navigationHistory.clear();
win.webContents.navigationHistory.canGoBack();
win.webContents.navigationHistory.goBack();
win.webContents.navigationHistory.canGoForward();
win.webContents.navigationHistory.goForward();
win.webContents.navigationHistory.canGoToOffset();
win.webContents.navigationHistory.goToOffset(index);
```

## End of Support for 29.x.y

Electron 29.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E32 (Aug'24) | E33 (Oct'24) | E34 (Jan'25) |
| ------------ | ------------ | ------------ |
| 32.x.y       | 33.x.y       | 34.x.y       |
| 31.x.y       | 32.x.y       | 33.x.y       |
| 30.x.y       | 31.x.y       | 32.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

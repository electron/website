---
title: Electron 26.0.0
date: 2023-08-15T00:00:00.000Z
authors: VerteDinde
slug: electron-26-0
tags: [release]
---

Electron 26.0.0 has been released! It includes upgrades to Chromium `116.0.5845.62`, V8 `11.2`, and Node.js `18.16.1`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 26.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Stack Changes

- Chromium `116.0.5845.62`
  - [New in Chrome 116](https://developer.chrome.com/blog/new-in-chrome-116/)
  - [New in DevTools 116](https://developer.chrome.com/blog/new-in-devtools-116/)
- Node.js `18.16.1`
  - [Node 18.16.1 blog post](https://nodejs.org/en/blog/release/v18.16.1/)
- V8 `11.2`

## Breaking Changes

### Deprecated: `webContents.getPrinters`

The `webContents.getPrinters` method has been deprecated. Use
`webContents.getPrintersAsync` instead.

```js
const w = new BrowserWindow({ show: false });

// Deprecated
console.log(w.webContents.getPrinters());
// Replace with
w.webContents.getPrintersAsync().then((printers) => {
  console.log(printers);
});
```

### Deprecated: `systemPreferences.{get,set}AppLevelAppearance` and `systemPreferences.appLevelAppearance`

The `systemPreferences.getAppLevelAppearance` and `systemPreferences.setAppLevelAppearance`
methods have been deprecated, as well as the `systemPreferences.appLevelAppearance` property.
Use the `nativeTheme` module instead.

```js
// Deprecated
systemPreferences.getAppLevelAppearance();
// Replace with
nativeTheme.shouldUseDarkColors;

// Deprecated
systemPreferences.appLevelAppearance;
// Replace with
nativeTheme.shouldUseDarkColors;

// Deprecated
systemPreferences.setAppLevelAppearance('dark');
// Replace with
nativeTheme.themeSource = 'dark';
```

### Deprecated: `alternate-selected-control-text` value for `systemPreferences.getColor`

The `alternate-selected-control-text` value for `systemPreferences.getColor`
has been deprecated. Use `selected-content-background` instead.

```js
// Deprecated
systemPreferences.getColor('alternate-selected-control-text');
// Replace with
systemPreferences.getColor('selected-content-background');
```

### New Features

- Added `safeStorage.setUsePlainTextEncryption` and `safeStorage.getSelectedStorageBackend` api. [#39107](https://github.com/electron/electron/pull/39107)
- Added `safeStorage.setUsePlainTextEncryption` and `safeStorage.getSelectedStorageBackend` api. [#39155](https://github.com/electron/electron/pull/39155)
- Added `senderIsMainFrame` to messages sent via `ipcRenderer.sendTo()`. [#39206](https://github.com/electron/electron/pull/39206)
- Added support for flagging a Menu as being keyboard initiated. [#38954](https://github.com/electron/electron/pull/38954)

## End of Support for 23.x.y

Electron 23.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E26 (Aug'23) | E27 (Oct'23) | E28 (Jan'24) |
| ------------ | ------------ | ------------ |
| 26.x.y       | 27.x.y       | 28.x.y       |
| 25.x.y       | 26.x.y       | 27.x.y       |
| 24.x.y       | 25.x.y       | 26.x.y       |
| 22.x.y       |              |              |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

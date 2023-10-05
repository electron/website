---
title: Electron 27.0.0
date: 2023-10-10T00:00:00.000Z
authors:
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-27-0
---

Electron 27.0.0 has been released! It includes upgrades to Chromium `118.0.5993.32`, V8 `11.8`, and Node.js `18.17.1`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 27.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `118.0.5993.32`
  - [New in Chrome 118](https://developer.chrome.com/blog/new-in-chrome-118/)
  - [New in DevTools 118](https://developer.chrome.com/blog/new-in-devtools-118/)
- Node.js `18.17.1`
  - [Node 18.17.1 blog post](https://nodejs.org/en/blog/release/v18.17.1/)
- V8 `11.8`

### Breaking Changes

### Removed: Extended support for Windows 7/8/8.1

Electron 22 is now end of life (see [Farewell, Windows 7/8/8.1](https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice) for more details). All currently supported versions of Electron have dropped support for Windows 7/8/8.1.

### Removed: macOS 10.13 / 10.14 support

macOS 10.13 (High Sierra) and macOS 10.14 (Mojave) are no longer supported by [Chromium](https://chromium-review.googlesource.com/c/chromium/src/+/4629466).

Older versions of Electron will continue to run on these operating systems, but macOS 10.15 (Catalina)
or later will be required to run Electron v27.0.0 and higher.

### Deprecated: `ipcRenderer.sendTo()`

The `ipcRenderer.sendTo()` API has been deprecated. It should be replaced by setting up a [`MessageChannel`](tutorial/message-ports.md#setting-up-a-messagechannel-between-two-renderers) between the renderers.

The `senderId` and `senderIsMainFrame` properties of `IpcRendererEvent` have been deprecated as well.

### Removed: color scheme events in `systemPreferences`

The following `systemPreferences` events have been removed:

- `inverted-color-scheme-changed`
- `high-contrast-color-scheme-changed`

Use the new `updated` event on the `nativeTheme` module instead.

```js
// Removed
systemPreferences.on('inverted-color-scheme-changed', () => {
  /* ... */
});
systemPreferences.on('high-contrast-color-scheme-changed', () => {
  /* ... */
});

// Replace with
nativeTheme.on('updated', () => {
  /* ... */
});
```

### Removed: `webContents.getPrinters`

The `webContents.getPrinters` method has been removed. Use
`webContents.getPrintersAsync` instead.

```js
const w = new BrowserWindow({ show: false });

// Removed
console.log(w.webContents.getPrinters());
// Replace with
w.webContents.getPrintersAsync().then((printers) => {
  console.log(printers);
});
```

### Removed: `systemPreferences.{get,set}AppLevelAppearance` and `systemPreferences.appLevelAppearance`

The `systemPreferences.getAppLevelAppearance` and `systemPreferences.setAppLevelAppearance`
methods have been removed, as well as the `systemPreferences.appLevelAppearance` property.
Use the `nativeTheme` module instead.

```js
// Removed
systemPreferences.getAppLevelAppearance();
// Replace with
nativeTheme.shouldUseDarkColors;

// Removed
systemPreferences.appLevelAppearance;
// Replace with
nativeTheme.shouldUseDarkColors;

// Removed
systemPreferences.setAppLevelAppearance('dark');
// Replace with
nativeTheme.themeSource = 'dark';
```

### Removed: `alternate-selected-control-text` value for `systemPreferences.getColor`

The `alternate-selected-control-text` value for `systemPreferences.getColor`
has been removed. Use `selected-content-background` instead.

```js
// Removed
systemPreferences.getColor('alternate-selected-control-text');
// Replace with
systemPreferences.getColor('selected-content-background');
```

### New Features

- Added app accessibility transparency settings api [#39631](https://github.com/electron/electron/pull/39631)
- Added support for `chrome.scripting` extension APIs [#39675](https://github.com/electron/electron/pull/39675)
- Enabled `WaylandWindowDecorations` by default [#39644](https://github.com/electron/electron/pull/39644)

## End of Support for 24.x.y

Electron 24.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E27 (Aug'23) | E28 (Oct'23) | E29 (Jan'24) |
| ------------ | ------------ | ------------ |
| 27.x.y       | 28.x.y       | 29.x.y       |
| 26.x.y       | 27.x.y       | 28.x.y       |
| 25.x.y       | 26.x.y       | 27.x.y       |

## End of Extended Support for 22.x.y

Earlier this year, the Electron team extended Electron 22's planned end of life date from May 30, 2023 to October 10, 2023, in order to match Chrome's extended support for Windows 7/8/8.1 (see [Farewell, Windows 7/8/8.1](https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice) for more details).

Electron 22.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy) and this support extension. This will drop support back to the latest three stable major versions, and will end official support for Windows 7/8/8.1.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

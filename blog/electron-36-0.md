---
title: Electron 36.0.0
date: 2025-04-28T00:00:00.000Z
authors:
  - georgexu99
slug: electron-36-0
tags: [release]
---

Electron 36.0.0 has been released! It includes upgrades to Chromium 136, V8 13.6, and Node 22.14.0.

---

The Electron team is excited to announce the release of Electron 36.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Writing Tools Support

In Electron 36, you can enable macOS system-level features like Writing Tools (spelling and grammar), Autofill, and Services menu items in your context menus. To do so, pass a [WebFrameMain](https://www.electronjs.org/docs/latest/api/web-frame-main#class-webframemain) instance into the `frame` parameter for `menu.popup()`.

```js
import { BrowserWindow, Menu, WebFrameMain } from 'electron';

const currentWindow = BrowserWindow.getFocusedWindow();
const focusedFrame = currentWindow.webContents.focusedFrame;
const menu = Menu.buildFromTemplate([{ label: 'Copy', role: 'copy' }]);

menu.popup({
  window: currentWindow,
  frame: focusedFrame,
});
```

### Stack Changes

- Chromium `136.0.7103.48`
  - [New in 136](https://developer.chrome.com/blog/new-in-chrome-136/)
  - [New in 135](https://developer.chrome.com/blog/new-in-chrome-135/)
- Node `22.14.0`
  - [Node 22.14.0 blog post](https://nodejs.org/en/blog/release/v22.14.0/)
- V8 `13.6`

Electron 36 upgrades Chromium from `134.0.6998.23` to `136.0.7103.48`, and V8 from `13.5` to `13.6`.

### New Features and Improvements

- Added `BrowserWindow.isSnapped()` to indicate whether a given window has been arranged via Snap on Windows. [#46226](https://github.com/electron/electron/pull/46226)
- Added `WebContents.focusedFrame` to get the focused frame.
- Fixed `WebContents.opener` to specify potential `null` type. [#45667](https://github.com/electron/electron/pull/45667)
- Added `ffmpeg.dll` to delay load configuration. [#46173](https://github.com/electron/electron/pull/46173) (Also in [34](https://github.com/electron/electron/pull/46174), [35](https://github.com/electron/electron/pull/46172))
- Added `nativeTheme.shouldUseDarkColorsForSystemIntegratedUI` to distinguish system and app theme. [#46598](https://github.com/electron/electron/pull/46598) (Also in [35](https://github.com/electron/electron/pull/46599))
- Added `excludeUrls` to `webRequest` filter and deprecated the use of empty arrays in `urls` property. [#44692](https://github.com/electron/electron/pull/44692) (Also in [35](https://github.com/electron/electron/pull/45678))
- Added support for Autofill, Writing Tools and Services macOS level menu items in context menus via the new `frame` option in `menu.popup`. [#46350](https://github.com/electron/electron/pull/46350)
- Added support for `system-context-menu` on Linux. [#46399](https://github.com/electron/electron/pull/46399)
- Improved ASAR integrity checks on Windows. [#46537](https://github.com/electron/electron/pull/46537)
- Improved performance of `desktopCapturer.getSources` when not requesting thumbnails on macOS. [#46251](https://github.com/electron/electron/pull/46251) (Also in [34](https://github.com/electron/electron/pull/46250), [35](https://github.com/electron/electron/pull/46249))
- Removed 240 FPS limit when use shared texture OSR. [#45669](https://github.com/electron/electron/pull/45669) (Also in [35](https://github.com/electron/electron/pull/45781))

### Breaking Changes

### Deprecated: `NativeImage.getBitmap()`

The `NativeImage.getBitmap()` function is now deprecated and documented as an alias for `NativeImage.toBitmap()`.
The two functions both return a newly-allocated copy of the bitmap and are functionally equivalent.

### Deprecated: Extension methods and events on `session`

`session.loadExtension`, `session.removeExtension`, `session.getExtension`,
`session.getAllExtensions`, and the events `extension-loaded`,
`extension-unloaded`, and `extension-ready` have all moved to the new
[`Extensions` object](https://www.electronjs.org/docs/latest/api/extensions-api)
accessible via the `session.extensions` instance property.

### Removed: `quota` type `syncable` in `session.clearStorageData(options)`

When calling `session.clearStorageData(options)`, the `options.quota` type
`syncable` is no longer supported because it has been
[removed](https://chromium-review.googlesource.com/c/chromium/src/+/6309405)
from upstream Chromium.

### Deprecated: `quota` property in `session.clearStorageData(options)`

When calling `Session.clearStorageData(options)`, the `options.quota`
property is deprecated. Since the `syncable` type was removed, there
is only type left -- `'temporary'` -- so specifying it is unnecessary.

### Behavior Changed: GTK 4 is the default when running on GNOME

After an [upstream change](https://chromium-review.googlesource.com/c/chromium/src/+/6310469), GTK 4 is now the default when running on GNOME.

In rare cases, this may cause some applications or configurations to [error](https://github.com/electron/electron/issues/46538) with the following message:

```stderr
Gtk-ERROR **: 11:30:38.382: GTK 2/3 symbols detected. Using GTK 2/3 and GTK 4 in the same process is not supported
```

Affected users can work around this by specifying the `gtk-version` command-line flag:

```shell
$ electron --gtk-version=3   # or --gtk-version=2
```

The same can be done with the [`app.commandLine.appendSwitch`](https://www.electronjs.org/docs/latest/api/command-line#commandlineappendswitchswitch-value) function.

### Behavior Changed: `app.commandLine`

`app.commandLine` will convert uppercases switches and arguments to lowercase.

`app.commandLine` was only meant to handle Chromium switches (which aren't case-sensitive) and switches passed via `app.commandLine` will not be passed down to any of the child processes.

If you were using `app.commandLine` to parse app-specific command line arguments, you should do this via `process.argv`.

## End of Support for 33.x.y

Electron 33.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E36 (Apr'25) | E37 (Jun'25) | E38 (Aug'25) |
| ------------ | ------------ | ------------ |
| 36.x.y       | 37.x.y       | 38.x.y       |
| 35.x.y       | 36.x.y       | 37.x.y       |
| 34.x.y       | 35.x.y       | 36.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

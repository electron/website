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

The Electron team is excited to announce the release of Electron 36.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Add support for MacOS Autofill, Writing Tools (e.g., spelling, grammar), and Services
  - Electron apps can now hook into AppKit's native context menus via the newly exposed `frame` option in `menu.popup`.
- Added ServiceWorkerMain class to interact with service workers in the main process.
  - Developers can now start serviceworkers with `startWorkerForScope()`, retrieve service worker instances with `fromVersionID()`, and listen for lifecycle events like `runnning-status-changed`

### Stack Changes

- Chromium `136.0.7103.48`
  - [New in 136](https://developer.chrome.com/blog/new-in-chrome-136/)
  - [New in 135](https://developer.chrome.com/blog/new-in-chrome-135/)
- Node `22.14.0`
  - [Node 22.14.0 blog post](https://nodejs.org/en/blog/release/v22.14.0/)
- V8 `13.5`

Electron 36 upgrades Chromium from `134.0.6998.23` to `136.0.7103.48`, and V8 from `13.5` to `13.6`.

### New Features

- Added `BrowserWindow.isSnapped()` to indicate whether a given window has been arranged via Snap. [#46226](https://github.com/electron/electron/pull/46226)
- Added `ServiceWorkerMain` class to interact with service workers in the main process.
  - Added `fromVersionID` on `ServiceWorkers` to get an instance of `ServiceWorkerMain`.
  - Added `running-status-changed` event on `ServiceWorkers` to indicate when a service worker's running status has changed.
  - Added `startWorkerForScope` on `ServiceWorkers` to start a worker that may have been previously stopped. [#45232](https://github.com/electron/electron/pull/45232) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45341))</span>
- Added `WebContents.focusedFrame` to get the focused frame.
  - Fixed `WebContents.opener` to specify potential `null` type. [#45667](https://github.com/electron/electron/pull/45667)
- Added `contextBridge.executeInMainWorld` to safely execute code across world boundaries. [#45229](https://github.com/electron/electron/pull/45229) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45330))</span>
- Added `ffmpeg.dll` to delay load configuration. [#46173](https://github.com/electron/electron/pull/46173) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/46174), [35](https://github.com/electron/electron/pull/46172))</span>
- Added `nativeTheme.shouldUseDarkColorsForSystemIntegratedUI` to distinguish system and app theme. [#46598](https://github.com/electron/electron/pull/46598) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/46599))</span>
- Added `view.getVisible()`. [#44999](https://github.com/electron/electron/pull/44999) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/45410), [35](https://github.com/electron/electron/pull/45409))</span>
- Added `webContents.navigationHistory.restore(index, entries)` API that allows restoration of navigation history. [#45433](https://github.com/electron/electron/pull/45433) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/45584), [35](https://github.com/electron/electron/pull/45583))</span>
- Added excludeUrls to webRequest filter and deprecated the use of empty arrays in `urls` property. [#44692](https://github.com/electron/electron/pull/44692) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45678))</span>
- Added permission support for `document.executeCommand("paste")`. [#45377](https://github.com/electron/electron/pull/45377) <span style="font-size:small;">(Also in [33](https://github.com/electron/electron/pull/45473), [34](https://github.com/electron/electron/pull/45472), [35](https://github.com/electron/electron/pull/45471))</span>
- Added support for Autofill, Writing Tools and Services macOS level menu items in context menus via the new `frame` option in `menu.popup`. [#46350](https://github.com/electron/electron/pull/46350)
- Added support for `roundedCorners` BrowserWindow constructor option on Windows. [#45594](https://github.com/electron/electron/pull/45594) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/45739), [35](https://github.com/electron/electron/pull/45740))</span>
- Added support for `system-context-menu` on Linux. [#46399](https://github.com/electron/electron/pull/46399)
- Added support for service worker preload scripts. [#44411](https://github.com/electron/electron/pull/44411) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45408))</span>
- Redesigned preload script APIs by introducing `registerPreloadScript`, `unregisterPreloadScript`, `getPreloadScripts` on `Session`.
  - Deprecated `getPreloads` and `setPreloads` on `Session`. [#45230](https://github.com/electron/electron/pull/45230) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45329))</span>
- Removed 240 FPS limit when use shared texture OSR. [#45669](https://github.com/electron/electron/pull/45669) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45781))</span>
- Support Portal's globalShortcuts. Electron must be run with --enable-features=GlobalShortcutsPortal in order to have the feature working. [#45171](https://github.com/electron/electron/pull/45171) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/45297))</span>
- Improved ASAR integrity checks on Windows. [#46537](https://github.com/electron/electron/pull/46537)
- Improved performance of desktopCapturer.getSources when not requesting thumbnails on macOS. [#46251](https://github.com/electron/electron/pull/46251) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/46250), [35](https://github.com/electron/electron/pull/46249))</span>

### Breaking Changes

### Deprecated: NativeImage.getBitmap()

The `NativeImage.getBitmap()` function is now deprecated and documented as an alias for `NativeImage.toBitmap()`.
The two functions both return a newly-allocated copy of the bitmap and are functionally equivalent.

### Deprecated: Extension methods and events on `session`

`session.loadExtension`, `session.removeExtension`, `session.getExtension`,
`session.getAllExtensions`, `extension-loaded` event, `extension-unloaded`
event, and `extension-ready` events have all moved to the new
`session.extensions` class.

### Deprecated: `quota` property in `Session.clearStorageData(options)`

When calling `Session.clearStorageData(options)`, the `options.quota`
property is deprecated. Since the `syncable` type was removed, there
is only type left -- `'temporary'` -- so specifying it is unnecessary.

### Behavior Changed: GTK 4 is default when running GNOME

After an [upstream change](https://chromium-review.googlesource.com/c/chromium/src/+/6310469), GTK 4 is now the default when running GNOME.

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

`app.commandLine` will convert upper-cases switches and arguments to lowercase.

`app.commandLine` was only meant to handle chromium switches (which aren't case-sensitive) and switches passed via `app.commandLine` will not be passed down to any of the child processes.

If you were using `app.commandLine` to control the behavior of the main process, you should do this via `process.argv`.

### Removed: `systemPreferences.isAeroGlassEnabled()`

The `systemPreferences.isAeroGlassEnabled()` function has been removed without replacement.
It has been always returning `true` since Electron 23, which only supports Windows 10+, where DWM composition can no longer be disabled.

https://learn.microsoft.com/en-us/windows/win32/dwm/composition-ovw#disabling-dwm-composition-windows7-and-earlier

### Removed:`isDefault` and `status` properties on `PrinterInfo`

These properties have been removed from the PrinterInfo Object
because they have been removed from upstream Chromium.

### Removed: `quota` type `syncable` in `Session.clearStorageData(options)`

When calling `Session.clearStorageData(options)`, the `options.quota` type
`syncable` is no longer supported because it has been
[removed](https://chromium-review.googlesource.com/c/chromium/src/+/6309405)
from upstream Chromium.

---

### Removed: `isDefault` and `status` properties on `PrinterInfo`

These properties have been removed from the PrinterInfo Object
because they have been removed from upstream Chromium.

### Deprecated: `getFromVersionID` on `session.serviceWorkers`

The `session.serviceWorkers.fromVersionID(versionId)` API has been deprecated
in favor of `session.serviceWorkers.getInfoFromVersionID(versionId)`. This was
changed to make it more clear which object is returned with the introduction
of the `session.serviceWorkers.getWorkerFromVersionID(versionId)` API.

```js
// Deprecated
session.serviceWorkers.fromVersionID(versionId);

// Replace with
session.serviceWorkers.getInfoFromVersionID(versionId);
```

### Deprecated: `setPreloads`, `getPreloads` on `Session`

`registerPreloadScript`, `unregisterPreloadScript`, and `getPreloadScripts` are introduced as a
replacement for the deprecated methods. These new APIs allow third-party libraries to register
preload scripts without replacing existing scripts. Also, the new `type` option allows for
additional preload targets beyond `frame`.

```js
// Deprecated
session.setPreloads([path.join(__dirname, 'preload.js')]);

// Replace with:
session.registerPreloadScript({
  type: 'frame',
  id: 'app-preload',
  filePath: path.join(__dirname, 'preload.js'),
});
```

### Deprecated: `level`, `message`, `line`, and `sourceId` arguments in `console-message` event on `WebContents`

The `console-message` event on `WebContents` has been updated to provide details on the `Event`
argument.

```js
// Deprecated
webContents.on(
  'console-message',
  (event, level, message, line, sourceId) => {},
);

// Replace with:
webContents.on(
  'console-message',
  ({ level, message, lineNumber, sourceId, frame }) => {},
);
```

Additionally, `level` is now a string with possible values of `info`, `warning`, `error`, and `debug`.

### Behavior Changed: `urls` property of `WebRequestFilter`.

Previously, an empty urls array was interpreted as including all URLs. To explicitly include all URLs, developers should now use the `<all_urls>` pattern, which is a [designated URL pattern](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns#all_urls) that matches every possible URL. This change clarifies the intent and ensures more predictable behavior.

```js
// Deprecated
const deprecatedFilter = {
  urls: [],
};

// Replace with
const newFilter = {
  urls: ['<all_urls>'],
};
```

### Deprecated: `systemPreferences.isAeroGlassEnabled()`

The `systemPreferences.isAeroGlassEnabled()` function has been deprecated without replacement.
It has been always returning `true` since Electron 23, which only supports Windows 10+, where DWM composition can no longer be disabled.

https://learn.microsoft.com/en-us/windows/win32/dwm/composition-ovw#disabling-dwm-composition-windows7-and-earlier

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

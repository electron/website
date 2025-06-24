---
title: Electron 37.0.0
date: 2025-06-24T00:00:00.000Z
authors:
  - georgexu99
  - vertedinde
slug: electron-37-0
tags: [release]
---

Electron 37.0.0 has been released! It includes upgrades to Chromium 138, V8 13.8, and Node 22.16.0.

---

The Electron team is excited to announce the release of Electron 37.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `138.0.7204.35`
  - [New in 138](https://developer.chrome.com/blog/new-in-chrome-138/)
  - [New in 137](https://developer.chrome.com/blog/new-in-chrome-137/)
- Node `22.14.0`
  - [Node 22.14.0 blog post](https://nodejs.org/en/blog/release/v22.16.0/)
- V8 `13.8`

Electron 37 upgrades Chromium from `136.0.7103.48` to `138.0.7204.35`, and V8 from `13.6` to `13.8`.

### New Features and Improvements

- Added `BrowserWindow.isSnapped()` to indicate whether a given window has been arranged via Snap. [#46079](https://github.com/electron/electron/pull/46079) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/46226))</span>
- Added `before-mouse-event` to allow intercepting and preventing mouse events in WebContents. [#47364](https://github.com/electron/electron/pull/47364) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/47365))</span>
- Added `ffmpeg.dll` to delay load configuration. [#46151](https://github.com/electron/electron/pull/46151) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/46174), [35](https://github.com/electron/electron/pull/46172), [36](https://github.com/electron/electron/pull/46173))</span>
- Added `innerWidth` and `innerHeight` options for window.open. [#47039](https://github.com/electron/electron/pull/47039) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/47045), [36](https://github.com/electron/electron/pull/47038))</span>
- Added `nativeTheme.shouldUseDarkColorsForSystemIntegratedUI` to distinguish system and app theme. [#46438](https://github.com/electron/electron/pull/46438) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/46599), [36](https://github.com/electron/electron/pull/46598))</span>
- Added `scriptURL` property to `ServiceWorkerMain`. [#45863](https://github.com/electron/electron/pull/45863)
- Added a CSS rule for smooth corners. [#45185](https://github.com/electron/electron/pull/45185)
- Added sublabel functionality for menus on macOS >= 14.4. [#47042](https://github.com/electron/electron/pull/47042) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/47041), [36](https://github.com/electron/electron/pull/47040))</span>
- Added support for Autofill, Writing Tools and Services macOS level menu items in context menus via the new `frame` option in `menu.popup`. [#45138](https://github.com/electron/electron/pull/45138) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/46350))</span>
- Added support for `HIDDevice.collections`. [#47483](https://github.com/electron/electron/pull/47483) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/47484))</span>
- Added support for `--no-experimental-global-navigator` flag. [#47418](https://github.com/electron/electron/pull/47418) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/47416), [36](https://github.com/electron/electron/pull/47417))</span>
- Added support for `screen.dipToScreenPoint(point)` and `screen.screenToDipPoint(point)` on Linux X11. [#46895](https://github.com/electron/electron/pull/46895) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/47124), [36](https://github.com/electron/electron/pull/47125))</span>
- Added support for `system-context-menu` on Linux. [#45848](https://github.com/electron/electron/pull/45848) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/46977), [36](https://github.com/electron/electron/pull/46399))</span>
- Added support for menu item role `palette` and `header` on macOS. [#47245](https://github.com/electron/electron/pull/47245)
- Added support for node option `--experimental-network-inspection`. [#47031](https://github.com/electron/electron/pull/47031) <span style="font-size:small;">(Also in [35](https://github.com/electron/electron/pull/47029), [36](https://github.com/electron/electron/pull/47030))</span>
- Added the priority and priorityIncremental options to net.request(). [#47321](https://github.com/electron/electron/pull/47321) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/47320))</span>
- Exposed `win.isContentProtected()` to allow developers to check window protection status. [#47310](https://github.com/electron/electron/pull/47310) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/47311))</span>
- Improved ASAR integrity checks on Windows. [#46509](https://github.com/electron/electron/pull/46509) <span style="font-size:small;">(Also in [36](https://github.com/electron/electron/pull/46537))</span>
- Improved performance of desktopCapturer.getSources when not requesting thumbnails on macOS. [#46138](https://github.com/electron/electron/pull/46138) <span style="font-size:small;">(Also in [34](https://github.com/electron/electron/pull/46250), [35](https://github.com/electron/electron/pull/46249), [36](https://github.com/electron/electron/pull/46251))</span>

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

### Behavior Changed: `process.exit()` kills utility process synchronously

Calling `process.exit()` in a utility process will now kill the utility process synchronously.
This brings the behavior of `process.exit()` in line with Node.js behavior.

Please refer to the
[Node.js docs](https://nodejs.org/docs/latest-v22.x/api/process.html#processexitcode) and
[PR #45690](https://github.com/electron/electron/pull/45690) to understand the potential
implications of that, e.g., when calling `console.log()` before `process.exit()`.

### Behavior Changed: `app.commandLine`

`app.commandLine` will convert uppercases switches and arguments to lowercase.

`app.commandLine` was only meant to handle Chromium switches (which aren't case-sensitive) and switches passed via `app.commandLine` will not be passed down to any of the child processes.

If you were using `app.commandLine` to parse app-specific command line arguments, you should do this via `process.argv`.

## End of Support for 34.x.y

Electron 34.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E37 (Jun'25) | E38 (Aug'25) | E39 (Oct'25) |
| ------------ | ------------ | ------------ |
| 37.x.y       | 38.x.y       | 39.x.y       |
| 36.x.y       | 37.x.y       | 38.x.y       |
| 35.x.y       | 36.x.y       | 37.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

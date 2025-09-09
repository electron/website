---
title: Electron 38.0.0
date: 2025-09-09T00:00:00.000Z
authors:
  - VerteDinde
slug: electron-38-0
tags: [release]
---

Electron 38.0.0 has been released! It includes upgrades to Chromium 140.0.7339.41, V8 14.0, and Node 22.16.0.

---

The Electron team is excited to announce the release of Electron 38.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `140.0.7339.41`
  - [New in 140](https://developer.chrome.com/blog/new-in-chrome-140/)
  - [New in 139](https://developer.chrome.com/blog/new-in-chrome-139/)
- Node `22.18.0`
  - [Node 22.18.0 blog post](https://nodejs.org/en/blog/release/v22.18.0/)
- V8 `14.0`
  - [V8 roll increment](https://chromium.googlesource.com/v8/v8.git/+/fdb12b460f148895f6af2ff0e0d870ff8889f154)

Electron 38 upgrades Chromium from `138.0.7204.35` to `140.0.7339.41`, Node from `22.16.0` to `22.18.0`, and V8 from `13.8` to `14.0`.

### New Features and Improvements

- Added support for customizing system accent color and highlighting of active window border. [#47285](https://github.com/electron/electron/pull/47285) (Also in [37](https://github.com/electron/electron/pull/47537))
- Added `fileBacked` and `purgeable` fields to `process.getSystemMemoryInfo()` for macOS. [#48146](https://github.com/electron/electron/pull/48146) (Also in [37](https://github.com/electron/electron/pull/48143))
- Added `tray.{get|set}AutosaveName` to enable macOS tray icons to maintain position across launches. [#48077](https://github.com/electron/electron/pull/48077) (Also in [37](https://github.com/electron/electron/pull/48076))
- Added `webFrameMain.fromFrameToken(processId, frameToken)` to get a `WebFrameMain` instance from its frame token. [#47942](https://github.com/electron/electron/pull/47942)
- Added sublabel functionality for menus on macOS >= 14.4. [#46887](https://github.com/electron/electron/pull/46887) (Also in [37](https://github.com/electron/electron/pull/47042))
- Added support for `app.getRecentDocuments()` on Windows and macOS. [#47924](https://github.com/electron/electron/pull/47924) (Also in [37](https://github.com/electron/electron/pull/47923))
- Added support for `screen.dipToScreenPoint(point)` and `screen.screenToDipPoint(point)` on Linux X11. [#46211](https://github.com/electron/electron/pull/46211) (Also in [37](https://github.com/electron/electron/pull/46895))
- Internally switched to using `DIR_ASSETS` instead of `DIR_MODULE`/`DIR_EXE` to locate assets and resources, and added "assets" as a key that can be queried via `app.getPath`. [#47950](https://github.com/electron/electron/pull/47950) (Also in [37](https://github.com/electron/electron/pull/47951))
- Fixed an issue where `dialog.showMessageDialog` showed a window incorrectly centered to monitor instead of parent window when passed. [#48215](https://github.com/electron/electron/pull/48215)
- Fixed an issue where users on macOS were unable to interact with a webpage loaded via `loadURL`. [#47575](https://github.com/electron/electron/pull/47575)

### Breaking Changes

### Removed: macOS 11 support

macOS 11 (Big Sur) is no longer supported by [Chromium](https://chromium-review.googlesource.com/c/chromium/src/+/6594615).

Older versions of Electron will continue to run on Big Sur, but macOS 12 (Monterey)
or later will be required to run Electron v38.0.0 and higher.

### Removed: `ELECTRON_OZONE_PLATFORM_HINT` environment variable

The default value of the `--ozone-plaftform` flag [changed to `auto`](https://chromium-review.googlesource.com/c/chromium/src/+/6775426).

You should use the `XDG_SESSION_TYPE=wayland` environment variable instead to use Wayland.

### Removed: `plugin-crashed` event

The `plugin-crashed` event has been removed from `webContents`.

### Deprecated: `webFrame.routingId` property

The `routingId` property will be removed from `webFrame` objects.

You should use `webFrame.frameToken` instead.

### Deprecated: `webFrame.findFrameByRoutingId(routingId)`

The `webFrame.findFrameByRoutingId(routingId)` function will be removed.

You should use `webFrame.findFrameByToken(frameToken)` instead.

## Google Summer of Code Concludes

Our two [Google Summer of Code](https://summerofcode.withgoogle.com/) contributors have just completed their summer projects!

- [@nilayarya](https://github.com/nilayarya) crafted a new [Save/Restore Window State API](https://github.com/electron/rfcs/pull/16/) in Electron core. The new APIs will provide a built-in, standardized way
  to handle window state persistence. See Nilay's original RFC at [electron/rfcs#16](https://github.com/electron/rfcs/pull/16).
- [@hitarth-gg](https://github.com/hitarth-gg) put a lot of hard work into modernizing the long-dormant [Devtron](https://github.com/electron-userland/devtron) extension using Chrome Manifest V3 APIs.
  This project provides tooling for developers to debug IPC communication, track event listeners, and visualize module dependencies in their Electron applications.

Stay tuned for a more detailed blog post outlining their projects and the outcomes.

## End of Support for 35.x.y

Electron 35.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E38 (Sep'25) | E39 (Oct'25) | E40 (Jan'26) |
| ------------ | ------------ | ------------ |
| 38.x.y       | 39.x.y       | 40.x.y       |
| 37.x.y       | 38.x.y       | 39.x.y       |
| 36.x.y       | 37.x.y       | 38.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

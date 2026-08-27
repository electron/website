---
title: Electron 44
date: 2026-08-25T00:00:00.000Z
authors:
  - ckerr
slug: electron-44-0
tags: [release]
---

Electron 44 has been released! It includes upgrades to Chromium 152.0.7977.54, V8 15.2, and Node v24.18.1.

---

The Electron team is excited to announce the release of Electron 44! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Notable Changes

### The `clipboard` module now aligns with the W3C Clipboard API

Electron's `clipboard` module has been rearchitected to align with the [W3C Clipboard API](https://w3c.github.io/clipboard-apis/#clipboard-interface). Its read and write methods are now asynchronous, and the new `ClipboardItem` class provides a MIME-based interface for working with clipboard data. On Linux, the selection clipboard is now available through the `clipboard.selection` namespace. See [RFC 0019](https://github.com/electron/rfcs/blob/main/text/0019-clipboard-rearchitecture.md) and the [planned breaking changes document](https://www.electronjs.org/docs/latest/breaking-changes#api-changed-clipboard-module-rearchitected-to-align-with-the-w3c-clipboard-api) for migration details. [#52508](https://github.com/electron/electron/pull/52508)

As part of this change, the `clipboard` module is no longer exposed directly to renderer processes. Renderers should use `navigator.clipboard`, or carefully expose only the required functionality from a preload script through `contextBridge`.

### Cross-platform window state persistence

Electron 44 adds a cross-platform API for saving and restoring window state, making it easier for applications to preserve window position, size, and display state across launches. [#52270](https://github.com/electron/electron/pull/52270)

### A WHATWG-compatible WebSocket client for the main process

The new `net.WebSocket` API provides a WHATWG-compatible WebSocket client for the main process backed by Chromium's network stack. It supports Electron sessions, Chromium proxy configuration, the platform trust store, and session cookies. [#51593](https://github.com/electron/electron/pull/51593)

### Improved Linux desktop integration

Electron 44 restores `app.setBadgeCount()` and `win.setProgressBar()` on Linux without requiring `libunity`. These APIs now work with docks and taskbars that implement the LauncherEntry D-Bus API. This release also adds `win.setOpacity()` support, system-themed Window Controls Overlay icons, and other improvements for frameless windows on Linux. [#52895](https://github.com/electron/electron/pull/52895) [#51455](https://github.com/electron/electron/pull/51455) [#52531](https://github.com/electron/electron/pull/52531)

## Stack Changes

- Chromium `152.0.7977.54`
  - [New in 152](https://developer.chrome.com/blog/new-in-chrome-152/)
  - [New in 151](https://developer.chrome.com/blog/new-in-chrome-151/)

- Node `v24.18.1`
  - [Node 24.18.1 blog post](https://nodejs.org/en/blog/release/v24.18.1/)
  - [Node 24.18.0 blog post](https://nodejs.org/en/blog/release/v24.18.0/)

- V8 `15.2`

Electron 44 upgrades Chromium from `150.0.7871.46` to `152.0.7977.54`, Node.js from `v24.17.0` to `v24.18.1`, and V8 from `15.0` to `15.2`.

## New Features and Improvements

- Added `Notification.remove()`, `Notification.removeAll()`, and `Notification.removeGroup()` static methods for macOS. [#51182](https://github.com/electron/electron/pull/51182) <sup>(Also in [42](https://github.com/electron/electron/pull/51691), [43](https://github.com/electron/electron/pull/51690))</sup>
- Added `available` to `process.getSystemMemoryInfo()` on Linux, exposing `MemAvailable` from `/proc/meminfo`. [#52380](https://github.com/electron/electron/pull/52380) <sup>(Also in [42](https://github.com/electron/electron/pull/52378), [43](https://github.com/electron/electron/pull/52379))</sup>
- Added `net.WebSocket`, a WHATWG-compatible WebSocket client for the main process that routes through Chromium's network stack. [#51593](https://github.com/electron/electron/pull/51593) <sup>(Also in [42](https://github.com/electron/electron/pull/52345), [43](https://github.com/electron/electron/pull/52344))</sup>
- Added `webContents.setZoomMode(mode)`, `webContents.getZoomMode()`, and `webContents.zoomMode` for per-`WebContents` zoom control. [#49962](https://github.com/electron/electron/pull/49962)
- Added `webFrameMain.printToPDF()` to allow printing individual frames to PDF from the main process. [#52625](https://github.com/electron/electron/pull/52625) <sup>(Also in [42](https://github.com/electron/electron/pull/52626), [43](https://github.com/electron/electron/pull/52627))</sup>
- Added a cross-platform API for saving and restoring window state. [#52270](https://github.com/electron/electron/pull/52270)
- Added a `badge` property to `MenuItem` on macOS 14 and later for showing a count or custom text badge next to a menu item's label. [#53046](https://github.com/electron/electron/pull/53046)
- Added support for `win.setOpacity(opacity)` on Linux. [#51455](https://github.com/electron/electron/pull/51455)
- Added `webContents.caretBrowsingEnabled` for toggling caret browsing in a `WebContents`. [#53035](https://github.com/electron/electron/pull/53035)
- Frameless windows on Linux now use system-themed titlebar icons for Window Controls Overlay. [#52531](https://github.com/electron/electron/pull/52531)
- Frameless windows on Linux now have rounded corners by default, matching macOS and Windows. Rounded corners can be disabled on all platforms by setting `roundedCorners: false` on the window. [#51459](https://github.com/electron/electron/pull/51459) <sup>(Also in [43](https://github.com/electron/electron/pull/52111))</sup>
- Restored `app.setBadgeCount()` and `win.setProgressBar()` for Linux. These APIs now support any dock or taskbar that implements the LauncherEntry D-Bus API, and they no longer require `libunity`. [#52895](https://github.com/electron/electron/pull/52895)
- Enabled ThinLTO on macOS builds. [#51669](https://github.com/electron/electron/pull/51669) <sup>(Also in [41](https://github.com/electron/electron/pull/53001), [42](https://github.com/electron/electron/pull/51823), [43](https://github.com/electron/electron/pull/51819))</sup>
- Made various performance improvements related to initialization and IPC. [#53017](https://github.com/electron/electron/pull/53017) <sup>(Also in [42](https://github.com/electron/electron/pull/53019), [43](https://github.com/electron/electron/pull/53018))</sup>
- Improved app startup time by booting the main process from an embedded Node.js startup snapshot. [#51703](https://github.com/electron/electron/pull/51703) <sup>(Also in [42](https://github.com/electron/electron/pull/51831), [43](https://github.com/electron/electron/pull/51792))</sup>
- Improved application startup time on Linux by skipping GDK's OpenGL probe and loading FontConfig off the main thread during toolkit initialization. [#53107](https://github.com/electron/electron/pull/53107) <sup>(Also in [43](https://github.com/electron/electron/pull/53108))</sup>
- Improved performance of Linux and Windows release builds by enabling ThinLTO link-time optimization for the main Electron binary. [#51809](https://github.com/electron/electron/pull/51809) <sup>(Also in [42](https://github.com/electron/electron/pull/51821), [43](https://github.com/electron/electron/pull/51820))</sup>
- Improved performance of `webRequest` header conversions and several other gin converter hot paths. [#51599](https://github.com/electron/electron/pull/51599) <sup>(Also in [42](https://github.com/electron/electron/pull/51607), [43](https://github.com/electron/electron/pull/51608))</sup>
- Improved performance of native event emission, IPC dispatch, and option-dictionary parsing. [#51596](https://github.com/electron/electron/pull/51596) <sup>(Also in [41](https://github.com/electron/electron/pull/51613), [42](https://github.com/electron/electron/pull/51614), [43](https://github.com/electron/electron/pull/51615))</sup>
- Improved runtime performance by consuming Electron-generated PGO profiles instead of Chrome's published profiles. [#51815](https://github.com/electron/electron/pull/51815) <sup>(Also in [42](https://github.com/electron/electron/pull/51828), [43](https://github.com/electron/electron/pull/51829))</sup>
- Improved sandboxed renderer startup performance by pushing preload scripts and process information ahead of navigation instead of fetching them through blocking IPC, and by caching preload compilation results on disk. [#51602](https://github.com/electron/electron/pull/51602) <sup>(Also in [42](https://github.com/electron/electron/pull/51831), [43](https://github.com/electron/electron/pull/51792))</sup>
- Improved startup time of `utilityProcess.fork()`, `child_process.fork()`, `ELECTRON_RUN_AS_NODE` child processes, and Node.js-enabled renderers. [#53134](https://github.com/electron/electron/pull/53134) <sup>(Also in [42](https://github.com/electron/electron/pull/53136), [43](https://github.com/electron/electron/pull/53135))</sup>
- Linux arm64, Windows arm64, and macOS x64 builds now start the main process from the embedded Node.js startup snapshot like the other platforms. [#52879](https://github.com/electron/electron/pull/52879) <sup>(Also in [42](https://github.com/electron/electron/pull/52880), [43](https://github.com/electron/electron/pull/52881))</sup>
- Reduced idle main-process CPU wakeups caused by Node.js timers and immediates. [#52906](https://github.com/electron/electron/pull/52906) <sup>(Also in [43](https://github.com/electron/electron/pull/52905))</sup>
- Reduced sandboxed renderer cold-start time by approximately 35% by deserializing a build-time V8 code cache for Electron's framework bundles instead of parsing and compiling them from source on every launch. [#51697](https://github.com/electron/electron/pull/51697) <sup>(Also in [42](https://github.com/electron/electron/pull/51831), [43](https://github.com/electron/electron/pull/51792))</sup>
- Reduced the Linux distribution size by approximately 37 MB by shipping only the locale strings and resources that Electron can use. [#51804](https://github.com/electron/electron/pull/51804)
- The first sandboxed `BrowserWindow` now starts in a renderer process launched ahead of time when the default session already exists. Apps that open many windows can keep a spare renderer warm with `--enable-features=SpareRendererForSitePerProcess`. [#53144](https://github.com/electron/electron/pull/53144)

## Breaking Changes

### Behavior Changed: `webContents` may be `null` in `select-client-certificate`

The `app` `'select-client-certificate'` event is now also emitted for requests made through the `net` module and for utility processes created with `respondToAuthRequestsFromMainProcess: true`. For these requests, the `webContents` argument is `null`. Applications handling the event must check the argument before using it. [#52397](https://github.com/electron/electron/pull/52397)

This also means that `net.request()` and `net.fetch()` can now select a client certificate instead of failing with `ERR_SSL_CLIENT_AUTH_CERT_NEEDED` when a server requests one.

### Removed: macOS 12 support

macOS 12 (Monterey) is no longer supported by [Chromium](https://chromium-review.googlesource.com/c/chromium/src/+/7907086). Older versions of Electron will continue to run on Monterey, but macOS 13 (Ventura) or later is required to run Electron 44 and higher. [#51967](https://github.com/electron/electron/pull/51967)

### Behavior Changed: ANGLE is statically linked on all platforms

ANGLE is now [statically linked](https://issues.chromium.org/issues/40268378) into the Electron binary on all platforms, matching upstream Chromium. The `libEGL.(so|dylib|dll)` and `libGLESv2.(so|dylib|dll)` libraries are no longer shipped. Applications that replaced or managed their own ANGLE versions by swapping these libraries can no longer do so. [#52288](https://github.com/electron/electron/pull/52288)

### Behavior Changed: `net.request` rejects frame destinations without navigate mode

`net.request` now rejects requests where `Sec-Fetch-Dest` is `document`, `frame`, `iframe`, or `fencedframe` unless `Sec-Fetch-Mode` is also set to `navigate`. This matches Chromium's enforcement that frame-type request destinations must be navigations. [#52216](https://github.com/electron/electron/pull/52216)

### Removed: Unity desktop environment support on Linux

Electron no longer provides Unity-specific integration on Linux, and `app.isUnityRunning()` has been removed. Electron continues to support modern [Freedesktop](https://specifications.freedesktop.org/) standards. [#51649](https://github.com/electron/electron/pull/51649)

### Removed: Windows 32-bit and Linux 32-bit ARM support

Electron no longer publishes prebuilt binaries for Windows x86 (`win32-ia32`) or Linux ARM (`linux-armv7l`). Electron 44 and higher are published only for 64-bit x64 and arm64 platforms. Older Electron versions will continue to support these platforms until the Electron 43 series reaches end-of-life in January 2027. [#52326](https://github.com/electron/electron/pull/52326)

### Removed: `clipboard` module access from renderer processes

The `clipboard` module is no longer exposed directly to renderer processes. Renderers should use the web platform's [`navigator.clipboard` API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). For more advanced use cases, expose only the required helpers from a preload script through `contextBridge`, taking care not to expose clipboard access to untrusted content. [#52508](https://github.com/electron/electron/pull/52508)

### API Changed: `clipboard` module rearchitected to align with the W3C Clipboard API

The `clipboard` module's `read()`, `write()`, `readText()`, `writeText()`, and `has()` methods are now asynchronous. Clipboard data is represented by the new `ClipboardItem` class, and narrowly scoped helpers such as `readImage()`, `writeHTML()`, and `availableFormats()` have been removed. The Linux selection clipboard is now available through `clipboard.selection`. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#api-changed-clipboard-module-rearchitected-to-align-with-the-w3c-clipboard-api) for the full API mapping and examples. [#52508](https://github.com/electron/electron/pull/52508)

### Removed: Pre-macOS 13 login item attributes

The `openAsHidden` option has been removed from `app.setLoginItemSettings()`, and the `openAsHidden`, `wasOpenedAsHidden`, and `restoreState` fields have been removed from the return value of `app.getLoginItemSettings()`. These attributes only worked on macOS 12 and earlier, which Electron 44 no longer supports. [#52667](https://github.com/electron/electron/pull/52667)

## End of Support for 41.x.y

Electron 41.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

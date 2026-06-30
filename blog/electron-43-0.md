---
title: Electron 43
date: 2026-07-02T00:00:00.000Z
authors:
  - name: jkleinsc
    url: https://github.com/jkleinsc
    image_url: https://github.com/jkleinsc.png?size=96
slug: electron-43-0
tags: [release]
---

Electron 43 has been released! It includes upgrades to Chromium 150.0.7871.46, V8 15.0, and Node v24.17.0.

---

The Electron team is excited to announce the release of Electron 43! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Notable Changes

### Improved app startup performance

Electron 43 ships several improvements to app startup performance. The main process now boots from an embedded Node.js startup snapshot, framework bundles and preload scripts are cached as compiled V8 bytecode, and sandboxed renderer startup data is pushed ahead of navigation instead of fetched via blocking IPC. As a bonus, preload stack traces now show the correct file path and line number. [#51792](https://github.com/electron/electron/pull/51792)

### Frameless windows on Linux now have rounded corners by default

On Linux, frameless windows now have rounded corners by default, matching the behavior on macOS and Windows. Rounded corners can be disabled on all platforms by setting `roundedCorners: false` on the window. [#52111](https://github.com/electron/electron/pull/52111)

### File downloads now open in the Downloads folder by default

File downloads will now open by default in the user's Downloads folder (or the Home directory if Downloads doesn't exist). [#49868](https://github.com/electron/electron/pull/49868)

### New macOS Notification management APIs

Electron 43 adds `Notification.remove()`, `Notification.removeAll()`, and `Notification.removeGroup()` static methods on macOS, giving developers finer control over delivered notifications. Combined with the existing `Notification.getHistory()` API, you can now fully manage the lifecycle of notifications in Notification Center. [#51690](https://github.com/electron/electron/pull/51690)

## Stack Changes

- Chromium `150.0.7871.46`
  - [New in 150](https://developer.chrome.com/blog/new-in-chrome-150/)
  - [New in 149](https://developer.chrome.com/blog/new-in-chrome-149/)

- Node `v24.17.0`
  - [Node 24.17.0 blog post](https://nodejs.org/en/blog/release/v24.17.0/)

- V8 `15.0`

Electron 43 upgrades Chromium from `148.0.7778.96` to `150.0.7871.46`, Node.js from `v24.15.0` to `v24.17.0`, and V8 from `14.8` to `15.0`.

## New Features and Improvements

- Added Clone method to `WebContents`. [#49959](https://github.com/electron/electron/pull/49959)
- Added JS stack trace to crash reports on renderer OOM. [#50043](https://github.com/electron/electron/pull/50043)
- Added Linux support for `app.getApplicationInfoForProtocol()`. [#51297](https://github.com/electron/electron/pull/51297)
- Added `Notification.remove()`, `Notification.removeAll()`, and `Notification.removeGroup()` static methods for macOS. [#51690](https://github.com/electron/electron/pull/51690)
- Added `Notification.getHistory()` for macOS, allowing developers to restore all delivered notifications still present in Notification Center. [#50325](https://github.com/electron/electron/pull/50325)
- Added `accessibilityLabel` property to `MenuItem` constructor options and properties for defining screen-reader-friendly labels. [#50240](https://github.com/electron/electron/pull/50240)
- Added `allowExtensions` privilege to `protocol.registerSchemesAsPrivileged()` to enable Chrome extensions on custom protocols. [#49951](https://github.com/electron/electron/pull/49951)
- Added `app.configureWebAuthn()` to enable the Touch ID platform authenticator for WebAuthn on macOS, and a `select-webauthn-account` session event for choosing between multiple discoverable credentials. [#51255](https://github.com/electron/electron/pull/51255)
- Added `globalShortcut.setSuspended()` and `globalShortcut.isSuspended()` methods to temporarily suspend and resume global shortcut handling. [#50425](https://github.com/electron/electron/pull/50425)
- Added `id` and `groupId` options to the `Notification` constructor on macOS. `id` allows custom identifiers for notifications, and `groupId` visually groups notifications together in Notification Center. [#50097](https://github.com/electron/electron/pull/50097)
- Added `id`, `groupId`, and `groupTitle` support for Windows notifications. [#50328](https://github.com/electron/electron/pull/50328)
- Added `nativeTheme.shouldDifferentiateWithoutColor` on macOS. [#49912](https://github.com/electron/electron/pull/49912)
- Added `nv12` OSR pixel format support for professional use. [#49799](https://github.com/electron/electron/pull/49799)
- Added `view.setBackgroundBlur()`. [#51076](https://github.com/electron/electron/pull/51076)
- Added `webContents.copyVideoFrameAt(x, y)` and `webContents.saveVideoFrameAs(x, y)` methods. [#48149](https://github.com/electron/electron/pull/48149)
- Added session support to net module requests from the utility process. [#51279](https://github.com/electron/electron/pull/51279)
- Added support for heap profiling via `contentTracing.enableHeapProfiling()`. [#50826](https://github.com/electron/electron/pull/50826)
- Added support for importing shared textures using the nv16 pixel format. [#50728](https://github.com/electron/electron/pull/50728)
- Added support for the `urgency` option in Notifications on Windows. [#50225](https://github.com/electron/electron/pull/50225)
- Added support for using a proxy during yarn install. [#50322](https://github.com/electron/electron/pull/50322)
- Allowed the `--experimental-inspector-network-resource` Node.js flag to be passed through Electron. [#49689](https://github.com/electron/electron/pull/49689)
- Enabled ThinLTO on macOS builds. [#51819](https://github.com/electron/electron/pull/51819)
- Enabled profile-guided optimization for V8 builtins in release builds, improving JavaScript builtin performance (Array, String, RegExp, etc.). [#50416](https://github.com/electron/electron/pull/50416)
- Improved app startup performance — the main process now boots from an embedded Node.js startup snapshot, framework bundles and preload scripts are cached as compiled V8 bytecode, and sandboxed renderer startup data is pushed ahead of navigation instead of fetched via blocking IPC. [#51792](https://github.com/electron/electron/pull/51792)
- Improved performance of Linux and Windows release builds by enabling ThinLTO link-time optimization for the main Electron binary. [#51820](https://github.com/electron/electron/pull/51820)
- Improved performance of `app.getApplicationNameForProtocol()` on Linux. [#51251](https://github.com/electron/electron/pull/51251)
- Improved performance of `app.isDefaultProtocolClient()` and `app.setAsDefaultProtocolClient()` on Linux. [#51316](https://github.com/electron/electron/pull/51316)
- Improved performance of `webRequest` header conversions and several other gin converter hot paths. [#51608](https://github.com/electron/electron/pull/51608)
- Improved performance of native event emission, IPC dispatch, and option-dictionary parsing. [#51615](https://github.com/electron/electron/pull/51615)

## Breaking Changes

### Behavior Changed: File downloads now open in the Downloads folder

File downloads will now open by default in the user's Downloads folder (or the Home directory if the Downloads folder doesn't exist). [#49868](https://github.com/electron/electron/pull/49868)

### Behavior Changed: `nativeImage` pixel values are normalized to SRGB

If a `nativeImage` was passed an image with a color profile, its pixel values will now be normalized to SRGB. This ensures that two visually identical images after color space application will receive similar pixel values when converted to a `nativeImage`. [#51565](https://github.com/electron/electron/pull/51565)

### Behavior Changed: Frameless windows have rounded corners on Linux by default

On Linux, frameless windows now have rounded corners by default, matching the behavior on macOS and Windows. Rounded corners can be disabled on all platforms by setting `roundedCorners: false` on the window. [#52111](https://github.com/electron/electron/pull/52111)

### Behavior Changed: WCO respects the native title bar layout on Linux

Frameless windows with Window Controls Overlay (WCO) now adopt the native title bar layout and user settings on Linux. For example, controls will appear on the left side of the frame on RTL systems, and only the close button will be visible by default on GNOME. Depending on the user's desktop environment and configuration, buttons can appear on the left or right side of the frame (or both). To account for all possibilities, use the CSS variables `env(titlebar-area-x, 0px)` and `env(titlebar-area-width, 100%)` to constrain your app's title bar content to a safe area. [#52018](https://github.com/electron/electron/pull/52018)

### Behavior Changed: `chrome.scripting` CSS injection matches more fallback frames

Extensions using `chrome.scripting.insertCSS()` or `chrome.scripting.removeCSS()`
now follow Chrome's behavior when Electron cannot match a frame's URL directly,
such as with `about:blank` or `data:` frames. If the extension has access to the
page that created the frame, CSS may now be inserted into or removed from those
fallback frames as well.
Apps or extensions that relied on Electron skipping those frames should narrow their
injection target, frame IDs, or match patterns. [#51376](https://github.com/electron/electron/pull/51376)

### Removed: `showHiddenFiles` from `dialog` API on Linux

`showHiddenFiles` support has been removed from the `dialog` API on Linux. [#51880](https://github.com/electron/electron/pull/51880)

## End of Support for 40.x.y

Electron 40.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## Support for 32-bit platforms ending

Electron 43.x.y will be the last version series of Electron to ship with prebuilt binaries for 32-bit platforms: Windows x86 (`win32-ia32`) and Linux ARM (`linux-armv7l`). Once the v43 series reaches end of life in January 2027, these 32-bit platforms will no longer be supported.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

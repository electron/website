---
title: Electron 42
date: 2026-05-07T00:00:00.000Z
authors:
  - name: VerteDinde
    url: https://github.com/VerteDinde
    image_url: https://github.com/VerteDinde.png?size=96
slug: electron-42-0
tags: [release]
---

Electron 42 has been released! It includes upgrades to Chromium 148.0.7778.96, V8 14.8, and Node v24.15.0.

---

The Electron team is excited to announce the release of Electron 42! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### macOS notifications now use `UNNotification` API

Electron has migrated from the deprecated `NSUserNotification` API to the [`UNNotification`](https://developer.apple.com/documentation/usernotifications) API on macOS. The new API requires that an application be code-signed in order for notifications to be displayed. If an application is not code-signed, notifications will emit a `failed` event on the `Notification` object. [#47817](https://github.com/electron/electron/pull/47817)

Additionally, Electron 42 adds `Notification.getHistory()` for macOS ([#51123](https://github.com/electron/electron/pull/51123)), and `id` and `groupId` options to the `Notification` constructor to allow custom identifiers and visual grouping in Notification Center ([#50304](https://github.com/electron/electron/pull/50304)).

### `electron` no longer downloads itself via `postinstall` script

Previously, the `electron` npm package would download the Electron binary from the repository's GitHub Releases in the package's `postinstall` script. With recent supply chain security attacks against the npm ecosystem with `postinstall` scripts as a common attack vector, Electron will now download itself dynamically the first time that its main `bin` script is run (e.g. via `npx electron`). With this change, you can now use Electron with the npm `--ignore-scripts` flag. See [RFC #22](https://github.com/electron/rfcs/pull/22) for more context. [#49328](https://github.com/electron/electron/pull/49328)

If you need to download the Electron binary on-demand, you can now call the `install-electron` script:

```sh
npm install electron --save-dev --ignore-scripts
npx install-electron
```

### WebAuthn Touch ID support on macOS

Added `app.configureWebAuthn({ touchID: { keychainAccessGroup } })` to enable the WebAuthn Touch ID platform authenticator on macOS. This also introduces a `select-webauthn-account` session event for discoverable-credential selection. [#51411](https://github.com/electron/electron/pull/51411)

### View animations and background blur

Added animation functionality to `view.setBounds()` and added `view.setBackgroundBlur()`, allowing for smoother UI transitions and native background blur effects. [#48812](https://github.com/electron/electron/pull/48812)

<!--truncate-->

## Stack Changes

- Chromium `148.0.7778.96`
  - [New in 148](https://developer.chrome.com/blog/new-in-chrome-148/)
  - [New in 147](https://developer.chrome.com/blog/new-in-chrome-147/)

- Node `v24.15.0`
  - [Node 24.15.0 blog post](https://nodejs.org/en/blog/release/v24.15.0)

- V8 `14.8`

Electron 42 upgrades Chromium from `146.0.7680.65` to `148.0.7778.96`, Node.js from `v24.14.0` to `v24.15.0`, and V8 from `14.6` to `14.8`.

## New Features and Improvements

- Added `app.configureWebAuthn({ touchID: { keychainAccessGroup } })` to enable the WebAuthn Touch ID platform authenticator on macOS. Also introduces a `select-webauthn-account` session event for discoverable-credential selection. [#51411](https://github.com/electron/electron/pull/51411)
- Added `Notification.getHistory()` for macOS. [#51123](https://github.com/electron/electron/pull/51123)
- Added `Notification.handleActivation(callback)` API on Windows to handle notification clicks, replies, and action buttons — including when the app is launched from a notification (cold start). [#49919](https://github.com/electron/electron/pull/49919)
- Added `ELECTRON_INSTALL_PLATFORM` and `ELECTRON_INSTALL_ARCH` variables to install binaries from other platforms and architectures. [#49981](https://github.com/electron/electron/pull/49981)
- Added `app.isActive()` to check if the app is the active/foreground application (macOS only). [#49622](https://github.com/electron/electron/pull/49622)
- Added `globalShortcut.setSuspended()` and `globalShortcut.isSuspended()` methods to temporarily suspend and resume global shortcut handling. [#50777](https://github.com/electron/electron/pull/50777)
- Added `id` and `groupId` options to the `Notification` constructor on macOS for custom identifiers and visual grouping in Notification Center. [#50304](https://github.com/electron/electron/pull/50304)
- Added `id`, `groupId`, and `groupTitle` support for Windows notifications. [#50895](https://github.com/electron/electron/pull/50895)
- Added `nativeTheme.shouldDifferentiateWithoutColor` on macOS. [#50409](https://github.com/electron/electron/pull/50409) <sup>(Also in [41](https://github.com/electron/electron/pull/50408))</sup>
- Added animation functionality to `view.setBounds` and added `view.setBackgroundBlur`. [#48812](https://github.com/electron/electron/pull/48812)
- Added support for heap profiling in `contentTracing`. [#51162](https://github.com/electron/electron/pull/51162)
- Added support for importing shared textures using the nv16 pixel format. [#51187](https://github.com/electron/electron/pull/51187)
- Added support for importing shared textures using the p010le 10-bit YUV pixel format. [#49272](https://github.com/electron/electron/pull/49272)
- Added support for several more `safeStorage` backends via new asynchronous functionality in `safeStorage`. [#49054](https://github.com/electron/electron/pull/49054)
- Added support for the `urgency` option in Notifications on Windows. [#50383](https://github.com/electron/electron/pull/50383) <sup>(Also in [41](https://github.com/electron/electron/pull/50382))</sup>
- Added the ability to capture JS stack trace on renderer OOM. [#50911](https://github.com/electron/electron/pull/50911)
- Electron now downloads its binary into `node_modules` dynamically on first launch instead of running a `postinstall` script. Added the `install-electron` script to manually trigger the download as well. [#49328](https://github.com/electron/electron/pull/49328)

### Breaking Changes

#### Behavior Changed: macOS notifications now use `UNNotification` API

Electron has migrated from the deprecated `NSUserNotification` API to the `UNNotification` API on macOS. The new API requires that an application be code-signed in order for notifications to be displayed. If an application is not code-signed, notifications will emit a `failed` event on the `Notification` object. [#47817](https://github.com/electron/electron/pull/47817)

#### Behavior Changed: `electron` no longer downloads itself via `postinstall` script

Previously, the `electron` npm package would download the Electron binary from the repository's GitHub Releases in the package's `postinstall` script. With recent supply chain security attacks against the npm ecosystem with `postinstall` scripts as a common attack vector, Electron will now download itself dynamically the first time that its main `bin` script is run (e.g. via `npx electron`). See [RFC #22](https://github.com/electron/rfcs/pull/22) for more context. [#49328](https://github.com/electron/electron/pull/49328)

#### Behavior Changed: Offscreen rendering default device scale factor

Previously, OSR used the primary display's device scale factor for rendering. Starting from Electron 42, the default changes to a constant value of `1.0` for more consistent output sizes. Use `webPreferences.offscreen.deviceScaleFactor` to specify a custom value. [#49683](https://github.com/electron/electron/pull/49683)

#### Removed: `quotas` object from `Session.clearStorageData(options)`

When calling `Session.clearStorageData(options)`, the `options.quotas` object is no longer supported because it has been removed from upstream Chromium.

#### Removed: `ELECTRON_SKIP_BINARY_DOWNLOAD` environment variable

This environment variable is no longer supported due to the new lazy download behavior. [#50459](https://github.com/electron/electron/pull/50459)

#### Deprecated: Passing only an array `hslShift` to `nativeImage.createFromNamedImage()`

Passing only an array `hslShift` to `nativeImage.createFromNamedImage()` is deprecated. You should now pass an options object with an `hslShift` property instead:

```js
// Deprecated
nativeImage.createFromNamedImage(imageName, [0, 1, -1]);
// Replace with
nativeImage.createFromNamedImage(imageName, {
  hslShift: [0, 1, -1],
});
```

## End of Support for 39.x.y

Electron 39.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

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

<!--truncate-->

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

## Stack Changes

- Chromium `148.0.7778.96`
  - [New in 148](https://developer.chrome.com/blog/new-in-chrome-148/)
  - [New in 147](https://developer.chrome.com/blog/new-in-chrome-147/)

- Node `v24.15.0`
  - [Node 24.15.0 blog post](https://nodejs.org/en/blog/release/v24.15.0)

- V8 `14.8`

Electron 42 upgrades Chromium from `146.0.7680.65` to `148.0.7778.96`, Node.js from `v24.14.0` to `v24.15.0`, and V8 from `14.6` to `14.8`.

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

## Deprecated: `showHiddenFiles` in Dialogs on Linux

This property will still be honored on macOS and Windows, but support on Linux
will be removed in Electron 42. GTK intends for this to be a user choice rather
than an app choice and has removed the API to do this programmatically.

## End of Support for 39.x.y

Electron 39.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

---
title: Electron 45
date: 2026-10-20T00:00:00.000Z
authors:
  - name: Electron
    url: https://github.com/electron
    image_url: https://github.com/electron.png?size=96
slug: electron-45-0
tags: [release]
---

Electron 45 has been released! It includes upgrades to Chromium 155.0.8038.2, V8 15.5, and Node v24.21.0.

---

The Electron team is excited to announce the release of Electron 45! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Notable Changes

### Screen sharing now asks for the `display-capture` permission

Requests to capture the screen, a window, or a tab are now passed to `session.setPermissionRequestHandler()` as the documented `display-capture` permission instead of `media`. Previously they arrived as `media` with an empty `mediaTypes` array, indistinguishable from a camera or microphone request. Applications with a permission handler that grants `media` and denies everything else must also grant `display-capture`, or screen sharing will stop working. See the [breaking changes document](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-screen-capture-requests-are-reported-as-display-capture-in-setpermissionrequesthandler) for details. [#52824](https://github.com/electron/electron/pull/52824)

### System passkeys on macOS

Electron 45 extends `app.configureWebAuthn()` with platform passkey support on macOS. Set `platformPasskeys: true` and `navigator.credentials.create()` and `.get()` present Apple's native passkey sheet, served by any credential provider such as iCloud Keychain or 1Password. When both Touch ID and platform passkeys are configured, the new `select-webauthn-authenticator` session event lets your app choose which one to use. [#51563](https://github.com/electron/electron/pull/51563)

### Files inside ASAR archives are read directly from the archive

`fs.open()`, `fs.createReadStream()`, `fs.copyFile()`, `fs.cp()`, and related APIs now read files inside ASAR archives straight out of the archive instead of extracting a temporary copy first. Cold reads of large packed files are up to 100x faster, and apps no longer leave temporary files behind. The descriptors these calls return are only meaningful to Node's `fs` module; see the [breaking changes document](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-file-descriptors-for-files-inside-asar-archives-are-only-usable-through-fs) for what is no longer supported. [#52833](https://github.com/electron/electron/pull/52833) [#53919](https://github.com/electron/electron/pull/53919)

### Network, auth, and download events identify the requesting frame

`webRequest` and `protocol` handler requests now carry an `initiatorOrigin`, `DownloadItem` gains `getInitiatorOrigin()`, and the `will-download` and `preconnect` session events receive the requesting `frame` as a trailing argument. Together with a series of fixes that attribute permission checks to the frame that made them, this makes it easier to write permission and network policies that reason about individual frames rather than whole windows. [#53700](https://github.com/electron/electron/pull/53700) [#53679](https://github.com/electron/electron/pull/53679) [#53690](https://github.com/electron/electron/pull/53690) [#53692](https://github.com/electron/electron/pull/53692)

## Stack Changes

- Chromium `155.0.8038.2`
  - [New in 155](https://developer.chrome.com/blog/new-in-chrome-155/)
  - [New in 154](https://developer.chrome.com/blog/new-in-chrome-154/)
  - [New in 153](https://developer.chrome.com/blog/new-in-chrome-153/)

- Node `v24.21.0`
  - [Node 24.21.0 blog post](https://nodejs.org/en/blog/release/v24.21.0/)

- V8 `15.5`

Electron 45 upgrades Chromium from `152.0.7977.54` to `155.0.8038.2`, Node.js from `v24.18.1` to `v24.21.0`, and V8 from `15.2` to `15.5`.

## New Features and Improvements

- Added `disableWakeLocks` to `webPreferences` so that page activity such as audio playback no longer prevents the system from sleeping. [#52342](https://github.com/electron/electron/pull/52342)
- Added `initiatorOrigin` to `webRequest` and `protocol` handler requests, `DownloadItem.getInitiatorOrigin()`, and a trailing `frame` argument to the `will-download` and `preconnect` session events. [#53700](https://github.com/electron/electron/pull/53700)
- Added `webFrame.getIsolatedWorlds()` and the `isolated-world-created` event so preload scripts can discover isolated worlds as they are created. [#50633](https://github.com/electron/electron/pull/50633)
- Added a Windows Error Reporting helper module so that `crashReporter` captures `__fastfail` and other crashes that bypass the in-process handler on Windows. [#53851](https://github.com/electron/electron/pull/53851)
- Added platform passkey support to `app.configureWebAuthn()` on macOS, and a `select-webauthn-authenticator` session event for choosing between Touch ID and platform passkeys. [#51563](https://github.com/electron/electron/pull/51563)
- Added the `ELECTRON_DEBUG_DRAGGABLE_REGIONS` environment variable, which visualizes and logs draggable regions in unpackaged apps to help debug custom title bars. [#53626](https://github.com/electron/electron/pull/53626)
- Files inside ASAR archives are now read directly from the archive by `fs.open()`, `fs.createReadStream()`, `fs.copyFile()`, `fs.cp()`, and related APIs instead of through a temporary copy, and `fs.opendir()` and `fs.readlink()` now work on archives. [#52833](https://github.com/electron/electron/pull/52833)
- Improved `protocol.handle()` performance by relaying untouched `net.fetch()` responses without passing them through JavaScript. [#53379](https://github.com/electron/electron/pull/53379)
- Improved performance of `fs` operations on paths inside ASAR archives. [#53919](https://github.com/electron/electron/pull/53919)
- Improved performance of `Menu` and `MenuItem` by implementing them natively. [#53914](https://github.com/electron/electron/pull/53914)
- Improved performance of computing draggable regions in windows with many `-webkit-app-region: drag` elements. [#53596](https://github.com/electron/electron/pull/53596) [#53649](https://github.com/electron/electron/pull/53649)
- Improved startup time by loading WHATWG streams and the desktop-name helper only when they are used. [#53899](https://github.com/electron/electron/pull/53899)
- Improved startup time of Node.js-enabled renderers by pushing preload paths to them instead of fetching them with a synchronous IPC. [#53916](https://github.com/electron/electron/pull/53916)
- Renderer network requests no longer wait on the main process when a session's `webRequest` listeners only observe requests or are filtered to other resource types. [#53204](https://github.com/electron/electron/pull/53204) <sup>(Also in [44](https://github.com/electron/electron/pull/53240))</sup>

## Breaking Changes

### Behavior Changed: screen capture requests are reported as `display-capture`

Requests to capture the screen, a window, or a tab, whether made through `navigator.mediaDevices.getDisplayMedia()` or through `getUserMedia()` with the `chromeMediaSource` constraints, are now passed to `session.setPermissionRequestHandler()` as `display-capture`. `media` is now used only for camera and microphone devices, and `details.mediaTypes` lists `video` and/or `audio` for both. A handler that allows only `media` must also allow `display-capture` to keep screen sharing working:

```js
session.defaultSession.setPermissionRequestHandler(
  (webContents, permission, callback) => {
    callback(permission === 'media' || permission === 'display-capture');
  },
);
```

The `display-capture` Permissions-Policy now also applies to the `getUserMedia()` path, so a cross-origin `<iframe>` that captures the screen this way needs `allow="display-capture"`. [#52824](https://github.com/electron/electron/pull/52824)

### Behavior Changed: `window.open()` children of unsandboxed windows get their own sandboxed process

A `window.open()` child whose `sandbox` state differs from its opener's renderer process is now created in its own process with no opener relationship: `window.open()` returns `null` in the opener and `window.opener` is `null` in the child, matching `noopener` behavior. Because child windows default to sandboxed, a child opened from an unsandboxed window is now isolated by default, and a warning is logged to the opener's console. To keep sharing the opener's process, return `webPreferences: { sandbox: false }` from `webContents.setWindowOpenHandler()`. [#52472](https://github.com/electron/electron/pull/52472)

### Behavior Changed: file descriptors for files inside ASAR archives are only usable through `fs`

`fs.open()`, `fs.openSync()`, and `fs.promises.open()` on a file inside an ASAR archive now return a descriptor that only identifies the entry to Node's `fs` module rather than a descriptor for an extracted temporary copy. Code that reads the raw descriptor, such as a native addon, `child_process` `stdio`, or `net.Socket({ fd })`, fails with `EBADF` and is not supported. Opening a packed file with a flag that allows writing now fails with `EACCES`, and `fs.stat()` on a symbolic link inside an archive now follows the link. [#52833](https://github.com/electron/electron/pull/52833)

### Default Changed: `document.requestStorageAccessFor` is disabled

Chromium has disabled `document.requestStorageAccessFor` by default ahead of its removal. The API can temporarily be restored with the `enableBlinkFeatures` web preference set to `RequestStorageAccessFor`. See [Chromium's intent to remove discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/bqHGZYHWxnQ) for more information.

### Removed: `contentTracing.enableHeapProfiling()`

The experimental `contentTracing.enableHeapProfiling()` API has been removed. Chromium removed the memlog implementation that backed it and replaced it with a Perfetto heap-profiling data source, which Electron does not yet integrate.

### Deprecated: synchronous `safeStorage` methods

The synchronous `safeStorage.isEncryptionAvailable()`, `safeStorage.encryptString()`, and `safeStorage.decryptString()` methods are deprecated and will be removed in Electron 46, following Chromium's removal of the synchronous OSCrypt backend they are built on. Use `isAsyncEncryptionAvailable()`, `encryptStringAsync()`, and `decryptStringAsync()` instead; data encrypted with the synchronous method can be decrypted with `decryptStringAsync()`. [#53850](https://github.com/electron/electron/pull/53850)

## End of Support for 42.x.y

Electron 42.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

---
title: Electron 45
date: 2026-10-20T00:00:00.000Z
authors:
  - ckerr
slug: electron-45-0
tags: [release]
---

<!--
Draft checklist before publication:
- Confirm the release date and author.
- Refresh the stack versions against the final 45.0.0 build. Current values
  match 45-x-y at 528eb6fd7f and 45.0.0-beta.5.
- Add the Chrome 155 and 156 "New in Chrome" links when available.
- Recheck older-branch releases for newly shipped backports, particularly
  the fixes with pending manual backports.
-->

Electron 45 has been released! It includes upgrades to Chromium 156.0.8078.36, V8 15.6, and Node v24.22.0.

---

The Electron team is excited to announce the release of Electron 45! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs). Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Notable Changes

### Faster startup, menus, and native API calls

Electron 45 reduces sandboxed renderer startup work by removing Electron's injected JavaScript bootstrap bundle, and improves cold-launch time on macOS by prefetching the framework's files. Building and showing menus is faster, and calls to native methods and properties on windows, views, and web contents have less overhead. [#54048](https://github.com/electron/electron/pull/54048) [#54528](https://github.com/electron/electron/pull/54528) [#53914](https://github.com/electron/electron/pull/53914) [#54359](https://github.com/electron/electron/pull/54359)

Removing the sandboxed renderer bootstrap also removes its bundled Node.js polyfills. If your sandboxed preload scripts use `Buffer` or require the `events`, `timers`, or `url` modules, see the migration notes in the Breaking Changes section below.

### Experimental Prompt API support with a local AI handler

Electron 45 adds an experimental way to connect Chromium's Prompt API to a model supplied by your application. Register a utility process with `session.registerLocalAIHandler()` and implement the handler with the new `localAIHandler` module and `LanguageModelUtility` class. With the `AIPromptAPI` Blink feature enabled, renderer code can then use `LanguageModel.create()` and the resulting model's `prompt()` method.

Electron does not bundle a model or inference engine: your application chooses and provides the implementation. See the [Local AI Handler tutorial](https://www.electronjs.org/docs/latest/tutorial/local-ai-handler) for setup and examples. [#50659](https://github.com/electron/electron/pull/50659)

### System passkeys on macOS

Applications can now enable the macOS system passkey interface with `app.configureWebAuthn({ platformPasskeys: true })`. WebAuthn requests made through `navigator.credentials.create()` and `navigator.credentials.get()` can use iCloud Keychain and other configured credential providers, such as 1Password and Bitwarden.

This extends the existing Touch ID support with credentials that can sync across devices. Unlike device-bound Touch ID credentials, system passkeys are shared across Electron session partitions and other applications associated with the same domain. See the [`app.configureWebAuthn()` documentation](https://www.electronjs.org/docs/latest/api/app#appconfigurewebauthnoptions-macos) for details and limitations. [#51563](https://github.com/electron/electron/pull/51563)

### Native heap profiling with Perfetto

Electron's `contentTracing` module now supports native heap profiling through Perfetto. Pass `nativeHeapProfiling` to `contentTracing.startRecording()` to collect sampled native allocations alongside your trace, then open the recording in the [Perfetto UI](https://ui.perfetto.dev).

This replaces the experimental `contentTracing.enableHeapProfiling()` method. All `contentTracing` recordings now use Perfetto's protobuf format rather than the legacy JSON format; see the Breaking Changes section below for migration details. [#54863](https://github.com/electron/electron/pull/54863)

## Stack Changes

- Chromium `156.0.8078.36`
  <!-- TODO: Add "New in 156" and "New in 155" once their posts are published. -->
  - [New in 154](https://developer.chrome.com/blog/new-in-chrome-154/)
  - [New in 153](https://developer.chrome.com/blog/new-in-chrome-153/)

- Node `v24.22.0`
  - [Node 24.22.0 blog post](https://nodejs.org/en/blog/release/v24.22.0/)
  - [Node 24.21.0 blog post](https://nodejs.org/en/blog/release/v24.21.0/)
  - [Node 24.20.0 blog post](https://nodejs.org/en/blog/release/v24.20.0/)
  - [Node 24.19.0 blog post](https://nodejs.org/en/blog/release/v24.19.0/)

- V8 `15.6`

Electron 45 upgrades Chromium from `152.0.7977.54` to `156.0.8078.36`, Node.js from `v24.18.1` to `v24.22.0`, and V8 from `15.2` to `15.6`.

## New Features and Improvements

- Added experimental Prompt API support through `session.registerLocalAIHandler()`, `localAIHandler`, and `LanguageModelUtility`, allowing applications to provide their own local model implementation in a utility process. [#50659](https://github.com/electron/electron/pull/50659)
- Added `platformPasskeys` to `app.configureWebAuthn()` on macOS, enabling the system passkey interface and configured credential providers. [#51563](https://github.com/electron/electron/pull/51563)
- Added `webFrame.getIsolatedWorlds()` and the `isolated-world-created` event to discover isolated worlds in a frame. [#50633](https://github.com/electron/electron/pull/50633)
- Added the `disableWakeLocks` web preference to disable wake locks for a `WebContents`. [#52342](https://github.com/electron/electron/pull/52342)
- Added native heap profiling to `contentTracing.startRecording()` through the `nativeHeapProfiling` option. [#54863](https://github.com/electron/electron/pull/54863)
- Added a Windows Error Reporting helper so `crashReporter` can capture `__fastfail` terminations and other crashes that bypass the in-process handler on Windows 10 20H1 and later. When renaming the executable for packaging, also rename `electron_wer.dll` to match: for example, `myapp.exe` needs `myapp_wer.dll`. [#53851](https://github.com/electron/electron/pull/53851)
- Files inside ASAR archives can now be opened, streamed, and copied directly from the archive without extracting a temporary file. Added ASAR support for `fs.opendir()` and `fs.readlink()`. See the Breaking Changes section below for changes to file descriptors and write access. [#52833](https://github.com/electron/electron/pull/52833)
- Improved sandboxed renderer startup by removing Electron's injected JavaScript bootstrap bundle. [#54048](https://github.com/electron/electron/pull/54048)
- Improved cold-launch time on macOS by prefetching Electron's framework files. [#54528](https://github.com/electron/electron/pull/54528)
- Improved the performance of building and showing menus. [#53914](https://github.com/electron/electron/pull/53914)
- Reduced the cost of calling native methods and properties on `BrowserWindow`, `BaseWindow`, `WebContents`, `WebFrameMain`, and `View`, and improved the performance of `app.getName()`, `app.name`, `app.getVersion()`, and `app.getAppPath()`. [#54359](https://github.com/electron/electron/pull/54359)
- Reduced IPC dispatch overhead by delivering messages to JavaScript listeners natively. [#53957](https://github.com/electron/electron/pull/53957)
- Fixed `app.getLoginItemSettings()` not finding Windows login items when the executable path contains spaces. [#54419](https://github.com/electron/electron/pull/54419)
- Fixed notifications from long domains sometimes failing to appear on Windows. [#54348](https://github.com/electron/electron/pull/54348)
- Fixed `process.nextTick` and promise callbacks queued in `protocol` and `webRequest` handlers running at the wrong time. [#54301](https://github.com/electron/electron/pull/54301)
- Fixed a possible hang when pressing Esc while a `<webview>` is fullscreen. [#53744](https://github.com/electron/electron/pull/53744)
- Fixed `<select>` dropdowns not appearing in offscreen-rendered frames on macOS. [#53716](https://github.com/electron/electron/pull/53716)
- Fixed content-protected windows temporarily appearing in macOS screen captures during picture-in-picture state changes. [#54612](https://github.com/electron/electron/pull/54612)

## Breaking Changes

### Removed: Node.js module shims and globals in sandboxed preload scripts

Sandboxed preload scripts and service worker preload scripts no longer include the bundled `events`, `timers`, and `url` Node.js module shims, or the `Buffer`, `setImmediate`, and `clearImmediate` globals. Their `require()` function now only loads `electron`, `electron/renderer`, and `electron/common`; `process` and `global` are still provided.

Use Web APIs such as `URL`, `URLSearchParams`, `Uint8Array`, `TextEncoder`, and `TextDecoder`, or bundle the polyfills your application needs. Use `setTimeout` / `clearTimeout` or `queueMicrotask` as appropriate in place of the removed immediate helpers. Preload scripts running with `sandbox: false` retain the full Node.js environment and are unaffected. [#54048](https://github.com/electron/electron/pull/54048)

### Behavior Changed: Sandboxed preload event emitters use a native implementation

In sandboxed preload scripts and service worker preload scripts, `ipcRenderer`, `webFrame`, and `process` now inherit from Electron's native `EventEmitter` implementation rather than the bundled `events` package. Their instance methods, including `on`, `once`, `off`, and `emit`, remain available. Static helpers previously accessed through `require('events')` are no longer provided; bundle the `events` package if you need them. [#54048](https://github.com/electron/electron/pull/54048)

### Removed: `contentTracing.enableHeapProfiling()`

The experimental `contentTracing.enableHeapProfiling()` method has been removed following Chromium's removal of its underlying implementation. To profile native allocations, pass `nativeHeapProfiling` to `contentTracing.startRecording()` instead. The old `samplingRate` option becomes `nativeHeapProfiling.samplingInterval`; the old `mode` and `stackMode` options have no direct equivalents. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#removed-contenttracingenableheapprofiling) for details. [#53342](https://github.com/electron/electron/pull/53342) [#54863](https://github.com/electron/electron/pull/54863)

### Behavior Changed: `contentTracing` recordings use the Perfetto protobuf format

`contentTracing.stopRecording()` now writes Perfetto protobuf traces instead of legacy JSON traces. Update tools that read the old format, open recordings in the [Perfetto UI](https://ui.perfetto.dev), or use Perfetto's [`traceconv` tool](https://perfetto.dev/docs/quickstart/traceconv) to convert a recording to JSON. [#54863](https://github.com/electron/electron/pull/54863)

### Behavior Changed: Screen capture permission requests use `display-capture`

Screen, window, and tab capture requests are now reported to `session.setPermissionRequestHandler()` as `display-capture` instead of `media`. Applications that allow `media` but deny other permissions must also handle `display-capture` to keep screen sharing working. `details.mediaTypes` now reports `video` and/or `audio` for these requests.

This applies to both `getDisplayMedia()` and `getUserMedia()` with the `chromeMediaSource` constraints. The `display-capture` Permissions Policy now also applies to those `getUserMedia()` requests, so cross-origin capturing iframes need `allow="display-capture"`. [#52824](https://github.com/electron/electron/pull/52824)

### Default Changed: `document.requestStorageAccessFor` is disabled

Chromium has disabled `document.requestStorageAccessFor` by default ahead of its removal. Applications can temporarily restore it by setting the `enableBlinkFeatures` web preference to `RequestStorageAccessFor`. See [Chromium's intent to remove discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/bqHGZYHWxnQ) for more information. [#52800](https://github.com/electron/electron/pull/52800)

### Behavior Changed: ASAR file descriptors are only usable through `fs`

Opening a file inside an ASAR archive now returns a descriptor that Node's `fs` APIs use to read the archive directly, rather than a descriptor for an extracted temporary copy. Passing that descriptor to native addons, child-process `stdio`, sockets, or other consumers outside `fs` is no longer supported and fails with `EBADF`.

Opening a packed file for writing now fails with `EACCES`, as do `fs.fchmod()`, `fs.fchown()`, and `fs.futimes()` on these descriptors. `fs.stat()` now follows symbolic links inside archives; use `fs.lstat()` to inspect the link itself. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-file-descriptors-for-files-inside-asar-archives-are-only-usable-through-fs) for the full compatibility notes. [#52833](https://github.com/electron/electron/pull/52833)

### Behavior Changed: `window.open()` children honor their own sandbox setting

When a child window's sandbox setting differs from its opener's renderer process, Electron now creates the child in a separate process without an opener relationship. `window.open()` returns `null`, and `window.opener` in the child is `null`.

Children of unsandboxed windows are sandboxed by default. If your application needs the previous unsandboxed, scriptable opener relationship, explicitly set `sandbox: false` in `overrideBrowserWindowOptions.webPreferences` in `webContents.setWindowOpenHandler()`. Only do this for content you trust. [#52472](https://github.com/electron/electron/pull/52472)

### Deprecated: Synchronous `safeStorage` methods

`safeStorage.isEncryptionAvailable()`, `safeStorage.encryptString()`, and `safeStorage.decryptString()` are deprecated and will be removed in Electron 46. Migrate to `safeStorage.isAsyncEncryptionAvailable()`, `safeStorage.encryptStringAsync()`, and `safeStorage.decryptStringAsync()`. The asynchronous methods use the same platform key stores and can decrypt data encrypted with the synchronous API. Note that `decryptStringAsync()` returns an object containing the decrypted `result`, rather than a string. [#53850](https://github.com/electron/electron/pull/53850)

## End of Support for 42.x.y

Electron 42.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

---
title: Electron 45
date: 2026-10-21T00:00:00.000Z
authors:
  - ckerr
slug: electron-45-0
tags: [release]
---

Electron 45 has been released! It includes upgrades to Chromium 156.0.8078.48, V8 15.6, and Node v24.22.0.

---

The Electron team is excited to announce the release of Electron 45! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Notable Changes

### Faster startup, menus, and native API calls

Electron 45 reduces sandboxed renderer startup work by avoiding Electron's JavaScript bootstrap bundle unless `webviewTag` is enabled, and improves cold-launch time on macOS by prefetching the framework's files. Building and showing menus is faster, and calls to native methods and properties on windows, views, and web contents have less overhead. [#54048](https://github.com/electron/electron/pull/54048) [#54528](https://github.com/electron/electron/pull/54528) [#53914](https://github.com/electron/electron/pull/53914) [#54359](https://github.com/electron/electron/pull/54359)

> [!IMPORTANT]
> Sandboxed preload scripts no longer include `Buffer`, `setImmediate`, `clearImmediate`, or the `events`, `timers`, and `url` module shims. Update affected preloads to use Web APIs or bundle the polyfills they need before upgrading. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#removed-nodejs-module-shims-and-buffer-setimmediate-clearimmediate-globals-in-sandboxed-preload-scripts) for replacements.

### Screen sharing now asks for the `display-capture` permission

Requests to capture the screen, a window, or a tab are now passed to `session.setPermissionRequestHandler()` as the documented `display-capture` permission instead of `media`. Previously they arrived as `media` with an empty `mediaTypes` array, indistinguishable from a camera or microphone request. Applications with a permission handler that grants `media` and denies everything else must also grant `display-capture`, or screen sharing will stop working. See the [breaking changes document](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-screen-capture-requests-are-reported-as-display-capture-in-setpermissionrequesthandler) for details. [#52824](https://github.com/electron/electron/pull/52824)

### Experimental Prompt API support with a local AI handler

Electron 45 adds an experimental way to connect Chromium's Prompt API to a model supplied by your application. Register a utility process with `session.registerLocalAIHandler()` and implement the handler with the new `localAIHandler` module and `LanguageModelUtility` class. With the `AIPromptAPI` Blink feature enabled, renderer code can then use `LanguageModel.create()` and the resulting model's `prompt()` method.

Electron does not bundle a model or inference engine: your application chooses and provides the implementation. See the [Local AI Handler tutorial](https://github.com/electron/electron/blob/v45.0.0/docs/tutorial/local-ai-handler.md) for setup and examples. [#50659](https://github.com/electron/electron/pull/50659)

### System passkeys on macOS

Electron 45 extends `app.configureWebAuthn()` with platform passkey support on macOS. Set `platformPasskeys: true` and `navigator.credentials.create()` and `.get()` present Apple's native passkey sheet, served by any credential provider such as iCloud Keychain or 1Password. When both Touch ID and platform passkeys are configured, the new `select-webauthn-authenticator` session event lets your app choose which one to use. [#51563](https://github.com/electron/electron/pull/51563)

Unlike device-bound Touch ID credentials, system passkeys can sync across devices and are shared across Electron session partitions and other applications associated with the same domain. See the [`app.configureWebAuthn()` documentation](https://www.electronjs.org/docs/latest/api/app#appconfigurewebauthnoptions-macos) for details and limitations.

### Broader crash reporting on Windows

Electron now ships a Windows Error Reporting (WER) helper so `crashReporter` can capture `__fastfail` terminations and other crashes that bypass the in-process handler on Windows 10 20H1 and later. The helper is registered when your application calls `crashReporter.start()`. [#53851](https://github.com/electron/electron/pull/53851)

> [!IMPORTANT]
> Package the helper DLL alongside your application's executable. If you rename `electron.exe` to `myapp.exe`, also rename `electron_wer.dll` to `myapp_wer.dll`. The helper must match the executable's name for Windows to load it.

See the [`crashReporter` documentation](https://www.electronjs.org/docs/latest/api/crash-reporter) for registration details and how to opt out of this additional crash coverage.

### Files inside ASAR archives are read directly from the archive

`fs.open()`, `fs.createReadStream()`, `fs.copyFile()`, `fs.cp()`, and related APIs now read files inside ASAR archives straight out of the archive instead of extracting a temporary copy first. Cold reads of large packed files are up to 100x faster, and apps no longer leave temporary files behind. The descriptors these calls return are only meaningful to Node's `fs` module; see the [breaking changes document](https://www.electronjs.org/docs/latest/breaking-changes#behavior-changed-file-descriptors-for-files-inside-asar-archives-are-only-usable-through-fs) for what is no longer supported. [#52833](https://github.com/electron/electron/pull/52833) [#53919](https://github.com/electron/electron/pull/53919)

### Network, auth, and download events identify the requesting frame

`webRequest` and `protocol` handler requests now carry an `initiatorOrigin`, `DownloadItem` gains `getInitiatorOrigin()`, and the `will-download` and `preconnect` session events receive the requesting `frame` as a trailing argument. Together with a series of fixes that attribute permission checks to the frame that made them, this makes it easier to write permission and network policies that reason about individual frames rather than whole windows. [#53700](https://github.com/electron/electron/pull/53700) [#53679](https://github.com/electron/electron/pull/53679) [#53690](https://github.com/electron/electron/pull/53690) [#53692](https://github.com/electron/electron/pull/53692)

### Native heap profiling with Perfetto

Electron's `contentTracing` module now supports experimental native heap profiling through Perfetto. Pass `nativeHeapProfiling` to `contentTracing.startRecording()` to collect sampled C/C++ allocations alongside your trace. This profiles native memory, not the JavaScript heap.

For example, add this to your main process to record ten seconds while you reproduce an issue in your application:

```js
const { app, contentTracing } = require('electron');
const { setTimeout } = require('node:timers/promises');

app.whenReady().then(async () => {
  await contentTracing.startRecording({
    nativeHeapProfiling: {
      samplingInterval: 128 * 1024,
    },
  });

  await setTimeout(10_000);

  const tracePath = await contentTracing.stopRecording();
  console.log(`Trace saved to ${tracePath}`);
});
```

Open the resulting recording in the [Perfetto UI](https://ui.perfetto.dev). `samplingInterval` is the average number of allocated bytes between samples; lower values provide more detail at a higher performance cost. See the [`contentTracing` documentation](https://www.electronjs.org/docs/latest/api/content-tracing) and [`NativeHeapProfilerOptions` reference](https://github.com/electron/electron/blob/v45.0.0/docs/api/structures/native-heap-profiler-options.md) for configuration details.

This replaces the experimental `contentTracing.enableHeapProfiling()` method. All `contentTracing` recordings now use Perfetto's protobuf format rather than the legacy JSON format; see the Breaking Changes section below for migration details. [#54863](https://github.com/electron/electron/pull/54863)

## Stack Changes

- Chromium `156.0.8078.48`
  - [New in 156](https://chromestatus.com/release-notes/156)
  - [New in 155](https://chromestatus.com/release-notes/155)
  - [New in 154](https://developer.chrome.com/blog/new-in-chrome-154/)
  - [New in 153](https://developer.chrome.com/blog/new-in-chrome-153/)

- Node `v24.22.0`
  - [Node 24.22.0 blog post](https://nodejs.org/en/blog/release/v24.22.0/)
  - [Node 24.21.0 blog post](https://nodejs.org/en/blog/release/v24.21.0/)
  - [Node 24.20.0 blog post](https://nodejs.org/en/blog/release/v24.20.0/)
  - [Node 24.19.0 blog post](https://nodejs.org/en/blog/release/v24.19.0/)

- V8 `15.6`

Electron 45 upgrades Chromium from `152.0.7977.54` to `156.0.8078.48`, Node.js from `v24.18.1` to `v24.22.0`, and V8 from `15.2` to `15.6`.

See the [Electron 45.0.0 release notes](https://github.com/electron/electron/releases/tag/v45.0.0) for the full list of changes.

## New Features and Improvements

Some of these changes are also available in earlier release lines, as noted below.

- Added experimental Prompt API support through `session.registerLocalAIHandler()`, `localAIHandler`, and `LanguageModelUtility`, allowing applications to provide their own local model implementation in a utility process. [#50659](https://github.com/electron/electron/pull/50659)
- Added app shims on macOS, allowing applications to show windows under another app's Dock icon. [#55072](https://github.com/electron/electron/pull/55072) <sup>(Also in [44.9.0](https://github.com/electron/electron/pull/55073))</sup>
- Added support for `Notification` action buttons on Linux. [#54889](https://github.com/electron/electron/pull/54889) <sup>(Also in [44.8.0](https://github.com/electron/electron/pull/54890))</sup>
- Added experimental `protocol.registerSource()` to serve custom schemes from directories on disk, including ASAR archives, without a JavaScript handler or routing requests through the main thread. [#54521](https://github.com/electron/electron/pull/54521) <sup>(Also in [44.6.0](https://github.com/electron/electron/pull/54522))</sup>
- Added launch-failure reporting with `systemErrorCode` to the `app` `child-process-gone` event. [#54230](https://github.com/electron/electron/pull/54230) <sup>(Also in [44.5.0](https://github.com/electron/electron/pull/54231))</sup>
- Added `disableWakeLocks` to `webPreferences` so that page activity such as audio playback no longer prevents the system from sleeping. [#52342](https://github.com/electron/electron/pull/52342)
- Added `initiatorOrigin` to `webRequest` and `protocol` handler requests, `DownloadItem.getInitiatorOrigin()`, and a trailing `frame` argument to the `will-download` and `preconnect` session events. [#53700](https://github.com/electron/electron/pull/53700) <sup>(Also in [43.7.0](https://github.com/electron/electron/pull/53704), [44.4.0](https://github.com/electron/electron/pull/53703))</sup>
- Added `webFrame.getIsolatedWorlds()` and the `isolated-world-created` event so preload scripts can discover isolated worlds as they are created. [#50633](https://github.com/electron/electron/pull/50633)
- Added native heap profiling to `contentTracing.startRecording()` through the `nativeHeapProfiling` option. [#54863](https://github.com/electron/electron/pull/54863)
- Added a Windows Error Reporting helper so `crashReporter` can capture `__fastfail` and other crashes that bypass the in-process handler on Windows 10 20H1 and later. See [Broader crash reporting on Windows](#broader-crash-reporting-on-windows) above for packaging requirements. [#53851](https://github.com/electron/electron/pull/53851)
- Added platform passkey support to `app.configureWebAuthn()` on macOS, and a `select-webauthn-authenticator` session event for choosing between Touch ID and platform passkeys. [#51563](https://github.com/electron/electron/pull/51563)
- Added the `ELECTRON_DEBUG_DRAGGABLE_REGIONS` environment variable, which visualizes and logs draggable regions in unpackaged apps to help debug custom title bars. [#53626](https://github.com/electron/electron/pull/53626) <sup>(Also in [43.7.0](https://github.com/electron/electron/pull/53633), [44.3.0](https://github.com/electron/electron/pull/53627))</sup>
- Files inside ASAR archives are now read directly from the archive by `fs.open()`, `fs.createReadStream()`, `fs.copyFile()`, `fs.cp()`, and related APIs instead of through a temporary copy, and `fs.opendir()` and `fs.readlink()` now work on archives. [#52833](https://github.com/electron/electron/pull/52833)
- Improved `protocol.handle()` performance by relaying untouched `net.fetch()` responses without passing them through JavaScript. [#53379](https://github.com/electron/electron/pull/53379)
- Improved performance of `fs` operations on paths inside ASAR archives. [#53919](https://github.com/electron/electron/pull/53919)
- Improved performance of `Menu` and `MenuItem` by implementing them natively. [#53914](https://github.com/electron/electron/pull/53914)
- Improved sandboxed renderer startup by avoiding Electron's JavaScript bootstrap bundle unless `webviewTag` is enabled. [#54048](https://github.com/electron/electron/pull/54048)
- Improved cold-launch time on macOS by prefetching Electron's framework files. [#54528](https://github.com/electron/electron/pull/54528)
- Reduced the cost of calling native methods and properties on `BrowserWindow`, `BaseWindow`, `WebContents`, `WebFrameMain`, and `View`, and improved the performance of `app.getName()`, `app.name`, `app.getVersion()`, and `app.getAppPath()`. [#54359](https://github.com/electron/electron/pull/54359)
- Reduced IPC dispatch overhead by delivering messages to JavaScript listeners natively. [#53957](https://github.com/electron/electron/pull/53957)
- Improved performance of computing draggable regions in windows with many `-webkit-app-region: drag` elements. [#53596](https://github.com/electron/electron/pull/53596) [#53649](https://github.com/electron/electron/pull/53649)
- Improved startup time by loading WHATWG streams and the desktop-name helper only when they are used. [#53899](https://github.com/electron/electron/pull/53899)
- Improved startup time of Node.js-enabled renderers by pushing preload paths to them instead of fetching them with a synchronous IPC. [#53916](https://github.com/electron/electron/pull/53916)
- Renderer network requests no longer wait on the main process when a session's `webRequest` listeners only observe requests or are filtered to other resource types. [#53204](https://github.com/electron/electron/pull/53204) <sup>(Also in [44](https://github.com/electron/electron/pull/53240))</sup>
- The macOS `autoUpdater` now streams update downloads to disk instead of holding the ZIP in memory, can resume interrupted downloads when the server supports it, and supports binary delta updates when offered by the update feed. Resuming requires `Range` support and an `ETag` or `Last-Modified` header from the server; delta updates require an optional `delta` entry in the feed. See the [`autoUpdater` documentation](https://www.electronjs.org/docs/latest/api/auto-updater#macos) for server and feed requirements. [#52820](https://github.com/electron/electron/pull/52820) <sup>(Also in [44.7.0](https://github.com/electron/electron/pull/54204))</sup>
- Fixed `getDisplayMedia({ audio: { restrictOwnAudio: true } })` being ignored by `setDisplayMediaRequestHandler`, causing loopback audio to include local app playback. [#52455](https://github.com/electron/electron/pull/52455) <sup>(Also in [43.4.0](https://github.com/electron/electron/pull/52533), [44.0.0](https://github.com/electron/electron/pull/52534))</sup>
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

### Behavior Changed: Subframe workers need `nodeIntegrationInSubFrames` for Node.js integration

With `nodeIntegrationInWorker: true`, a `Worker` created by an `<iframe>` now only gets Node.js integration when `nodeIntegrationInSubFrames` is also enabled. Previously a worker created by an iframe in the main frame's process could receive Node.js integration even though the iframe itself had none. Workers created by the main frame are unaffected.

### Behavior Changed: Extension preload scripts respect their embedding frame

A `chrome-extension://` document now receives window and session preload scripts only when it is a top-level frame or is hosted inside the DevTools front-end. An extension frame embedded in an ordinary page is treated like any other subframe and follows `nodeIntegrationInSubFrames`.

### Behavior Changed: WebContents capture uses `chromeMediaSource: 'tab'`

The legacy `chromeMediaSource: 'desktop'` constraint now only accepts screen and window source IDs from `desktopCapturer.getSources()`. To capture a WebContents, use `chromeMediaSource: 'tab'` with an ID from `webContents.getMediaSourceId()`, or use `session.setDisplayMediaRequestHandler()`. Passing a WebContents source ID with `'desktop'` now fails with an "Invalid state" error.

These worker, extension-preload, and WebContents-capture changes were also backported to Electron 44.3.0, 43.7.0, and 42.11.3. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#breaking-api-changes-450) for details.

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

A `window.open()` child whose `sandbox` state differs from its opener's renderer process is now created in its own process with no opener relationship: `window.open()` returns `null` in the opener and `window.opener` is `null` in the child, matching `noopener` behavior. Because child windows default to sandboxed, a child opened from an unsandboxed window is now isolated by default, and a warning is logged to the opener's console. To keep sharing the opener's process, explicitly set `sandbox: false` in `overrideBrowserWindowOptions.webPreferences` in `webContents.setWindowOpenHandler()`. Only do this for content you trust. [#52472](https://github.com/electron/electron/pull/52472)

### Behavior Changed: file descriptors for files inside ASAR archives are only usable through `fs`

`fs.open()`, `fs.openSync()`, and `fs.promises.open()` on a file inside an ASAR archive now return a descriptor that only identifies the entry to Node's `fs` module rather than a descriptor for an extracted temporary copy. Code that reads the raw descriptor, such as a native addon, `child_process` `stdio`, or `net.Socket({ fd })`, fails with `EBADF` and is not supported. Opening a packed file with a flag that allows writing now fails with `EACCES`, as do `fs.fchmod()`, `fs.fchown()`, and `fs.futimes()` on these descriptors. `fs.stat()` on a symbolic link inside an archive now follows the link; use `fs.lstat()` to inspect the link itself. [#52833](https://github.com/electron/electron/pull/52833)

### Default Changed: `document.requestStorageAccessFor` is disabled

Chromium has disabled `document.requestStorageAccessFor` by default ahead of its removal. The API can temporarily be restored with the `enableBlinkFeatures` web preference set to `RequestStorageAccessFor`. See [Chromium's intent to remove discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/bqHGZYHWxnQ) for more information. [#52800](https://github.com/electron/electron/pull/52800)

### Removed: `contentTracing.enableHeapProfiling()`

The experimental `contentTracing.enableHeapProfiling()` method has been removed following Chromium's removal of its underlying implementation. To profile native allocations, pass `nativeHeapProfiling` to `contentTracing.startRecording()` instead. The old `samplingRate` option becomes `nativeHeapProfiling.samplingInterval`; the old `mode` and `stackMode` options have no direct equivalents. See the [migration guide](https://www.electronjs.org/docs/latest/breaking-changes#removed-contenttracingenableheapprofiling) for details. [#53342](https://github.com/electron/electron/pull/53342) [#54863](https://github.com/electron/electron/pull/54863)

### Behavior Changed: `contentTracing` recordings use the Perfetto protobuf format

`contentTracing.stopRecording()` now writes Perfetto protobuf recordings rather than legacy JSON traces. Open recordings in the [Perfetto UI](https://ui.perfetto.dev) or use Perfetto's [Trace Processor](https://perfetto.dev/docs/analysis/trace-processor) to query them. If a tool still requires legacy JSON, convert the recording with Perfetto's [`traceconv`](https://perfetto.dev/docs/quickstart/traceconv) tool. [#54863](https://github.com/electron/electron/pull/54863)

### Deprecated: synchronous `safeStorage` methods

The synchronous `safeStorage.isEncryptionAvailable()`, `safeStorage.encryptString()`, and `safeStorage.decryptString()` methods are deprecated and will be removed in Electron 46, following Chromium's removal of the synchronous OSCrypt backend they are built on. Use `isAsyncEncryptionAvailable()`, `encryptStringAsync()`, and `decryptStringAsync()` instead; data encrypted with the synchronous method can be decrypted with `decryptStringAsync()`. Note that `decryptStringAsync()` returns an object containing the decrypted `result`, rather than a string. [#53850](https://github.com/electron/electron/pull/53850)

## End of Support for 42.x.y

Electron 42.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

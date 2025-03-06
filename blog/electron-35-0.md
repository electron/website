---
title: Electron 35.0.0
date: 2025-03-04T00:00:00.000Z
authors:
  - georgexu99
  - VerteDinde
slug: electron-35-0
tags: [release]
---

Electron 35.0.0 has been released! It includes upgrades to Chromium 134.0.6998.44, V8 13.5, and Node 22.14.0.

---

The Electron team is excited to announce the release of Electron 35.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### HTTP Compression Shared Dictionary Management APIs

HTTP compression allows data to be compressed by a web server before being received by the browser. Modern versions of Chromium support Brotli and Zstandard, which are newer compression algorithms that perform better for text files than older schemes such as gzip.

Custom shared dictionaries to further improve the efficiency of Brotli and Zstandard compression. See the [Chrome for Developers blog on shared dictionaries](https://developer.chrome.com/blog/shared-dictionary-compression) for more information.

[@felixrieseberg](https://github.com/felixrieseberg) added the following APIs in [#44950](https://github.com/electron/electron/pull/44950) to manage shared dictionaries at the Session level:

- `session.getSharedDictionaryUsageInfo()`
- `session.getSharedDictionaryInfo(options)`
- `session.clearSharedDictionaryCache()`
- `session.clearSharedDictionaryCacheForIsolationKey(options)`

### Unresponsive Renderer JavaScript Call Stacks

Electron's [`unresponsive`](https://www.electronjs.org/docs/latest/api/web-contents#event-unresponsive) event occurs whenever a renderer process hangs for an excessive period of time. The new `WebFrameMain.collectJavaScriptCallStack()` API added by [@samuelmaddock](https://github.com/samuelmaddock) in [#44204](https://github.com/electron/electron/pull/44204) allows you to collect the JavaScript call stack from the associated WebFrameMain object (`webContnets.mainFrame`).

This API can be useful to determine why the frame is unresponsive in cases where there's long-running JavaScript events causing the process to hang. For more information, see the [proposed web standard Crash Reporting API](https://wicg.github.io/crash-reporting/).

```js title='Main Process'
const { app } = require('electron');

app.commandLine.appendSwitch(
  'enable-features',
  'DocumentPolicyIncludeJSCallStacksInCrashReports',
);

app.on('web-contents-created', (_, webContents) => {
  webContents.on('unresponsive', async () => {
    // Interrupt execution and collect call stack from unresponsive renderer
    const callStack = await webContents.mainFrame.collectJavaScriptCallStack();
    console.log('Renderer unresponsive\n', callStack);
  });
});
```

### Service Worker Preload Scripts for Improved Extensions Support

Originally proposed in [RFC #8](https://github.com/electron/rfcs/blob/main/text/0008-preload-realm.md) by [@samuelmaddock](https://github.com/samuelmaddock), Electron 35 adds the ability to attach a preload script to [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). With Chrome's Manifest V3 Extensions routing a lot of work through [extension service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers), this feature fills in a gap in Electron's support for modern Chrome extensions.

When registering a preload script programmatically at the Session level, you can now specifically apply it to Service Worker contexts with the [`ses.registerPreloadScript(script)`](https://www.electronjs.org/docs/latest/api/session#sesregisterpreloadscriptscript) API.

```js title='Main Process'
// Add our preload realm script to the session.
session.defaultSession.registerPreloadScript({
  // Our script should only run in service worker preload realms.
  type: 'service-worker',
  // The absolute path to the script.
  script: path.join(__dirname, 'extension-sw-preload.js'),
});
```

Furthermore, IPC is now available between Service Workers and their attached preload scripts via the `ServiceWorkerMain.ipc` class. The preload script will still use the `ipcRenderer` module to communicate with its Service Worker. See the original RFC for more details.

This feature was preceded by many other changes that laid the groundwork for it:

- [#45329](https://github.com/electron/electron/pull/45329) redesigned the Session module's preload APIs to support registering and unregistering individual preload scripts.
- [#45229](https://github.com/electron/electron/pull/45330) added the experimental `contextBridge.executeInMainWorld(executionScript)` script to evaluate JavaScript in the main world over the context bridge.
- [#45341](https://github.com/electron/electron/pull/45341) added the `ServiceWorkerMain` class to interact with Service Workers in the main process.

### Stack Changes

- Chromium `134.0.6998.44`
  - [New in 134](https://developer.chrome.com/blog/new-in-chrome-134/)
  - [New in 133](https://developer.chrome.com/blog/new-in-chrome-133/)
- Node `22.14.0`
  - [Node 22.14.0 blog post](https://nodejs.org/en/blog/release/v22.14.0/)
- V8 `13.5`

Electron 35 upgrades Chromium from `132.0.6834.83` to `134.0.6998.44`, Node from `20.18.1` to `22.14.0`, and V8 from `13.2` to `13.5`.

### New Features

- Added APIs to manage shared dictionaries for compression efficiency using Brotli or ZStandard. The new APIs are `session.getSharedDictionaryUsageInfo()`, `session.getSharedDictionaryInfo(options)`, `session.clearSharedDictionaryCache()`, and `session.clearSharedDictionaryCacheForIsolationKey(options)`. [#44750](https://github.com/electron/electron/pull/44750)
- Added `NSPrefersDisplaySafeAreaCompatibilityMode` = `false` to Info.plist to remove "Scale to fit below built-in camera." from app options. [#45357](https://github.com/electron/electron/pull/45357)
- Added `ServiceWorkerMain` class to interact with service workers in the main process. [#45341](https://github.com/electron/electron/pull/45341)
  - Added `running-status-changed` event on `ServiceWorkers` to indicate when a service worker's running status has changed.
  - Added `startWorkerForScope` on `ServiceWorkers` to start a worker that may have been previously stopped.
- Added `WebFrameMain.collectJavaScriptCallStack()` for accessing the JavaScript call stack of unresponsive renderers. [#44204](https://github.com/electron/electron/pull/44204)
- Added `contextBridge.executeInMainWorld` to safely execute code across world boundaries. [#45330](https://github.com/electron/electron/pull/45330)
- Added `frame` to 'console-message' event. [#43617](https://github.com/electron/electron/pull/43617)
- Added `query-session-end` event and improved `session-end` events on Windows. [#44598](https://github.com/electron/electron/pull/44598)
- Added `view.getVisible()`. [#45409](https://github.com/electron/electron/pull/45409)
- Added `webContents.navigationHistory.restore(index, entries)` API that allows restoration of navigation history. [#45583](https://github.com/electron/electron/pull/45583)
- Added optional animation parameter to BrowserWindow.setVibrancy. [#35987](https://github.com/electron/electron/pull/35987)
- Added permission support for `document.executeCommand("paste")`. [#45471](https://github.com/electron/electron/pull/45471)
- Added support for `roundedCorners` BrowserWindow constructor option on Windows. [#45740](https://github.com/electron/electron/pull/45740)
- Added support for service worker preload scripts. [#45408](https://github.com/electron/electron/pull/45408)
- Support Portal's globalShortcuts. Electron must be run with --enable-features=GlobalShortcutsPortal in order to have the feature working. [#45297](https://github.com/electron/electron/pull/45297)

## Breaking Changes

### Removed: `isDefault` and `status` properties on `PrinterInfo`

These properties have been removed from the `PrinterInfo` object
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

## End of Support for 32.x.y

Electron 32.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E35 (Mar'25) | E36 (Apr'25) | E37 (Jun'25) |
| ------------ | ------------ | ------------ |
| 35.x.y       | 36.x.y       | 37.x.y       |
| 34.x.y       | 35.x.y       | 36.x.y       |
| 33.x.y       | 34.x.y       | 35.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

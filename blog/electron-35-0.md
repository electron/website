---
title: Electron 35.0.0
date: 2025-03-04T00:00:00.000Z
authors:
  - georgexu99
  - VerteDinde
slug: electron-35-0
tags: [release]
---

Electron 35.0.0 has been released! It includes upgrades to Chromium 134.0.6998.23, V8 13.5, and Node 22.14.0.

---

The Electron team is excited to announce the release of Electron 35.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Added `WebFrameMain.collectJavaScriptCallStack()` for accessing the JavaScript call stack of unresponsive renderers. [#44938](https://github.com/electron/electron/pull/44938)
- Added APIs to manage shared dictionaries for compression efficiency using Brotli or ZStandard. The new APIs are `session.getSharedDictionaryUsageInfo()`, `session.getSharedDictionaryInfo(options)`, `session.clearSharedDictionaryCache()`, and `session.clearSharedDictionaryCacheForIsolationKey(options)`. [#44950](https://github.com/electron/electron/pull/44950)

### Stack Changes

- Chromium `134.0.6998.23`
  - [New in 134](https://developer.chrome.com/blog/new-in-chrome-134/)
  - [New in 133](https://developer.chrome.com/blog/new-in-chrome-133/)
- Node `22.14.0`
  - [Node 22.14.0 blog post](https://nodejs.org/en/blog/release/v22.14.0/)
- V8 `13.5`

Electron 35 upgrades Chromium from `132.0.6834.83` to `134.0.6998.23`, Node from `20.18.1` to `22.14.0`, and V8 from `13.2` to `13.5`.

### New Features

-

### Breaking Changes

### Removed: `isDefault` and `status` properties on `PrinterInfo`

These properties have been removed from the PrinterInfo Object
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
  (event, level, message, line, sourceId) => {}
);

// Replace with:
webContents.on(
  'console-message',
  ({ level, message, lineNumber, sourceId, frame }) => {}
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

| E35 (Apr'25) | E36 (Jun'25) | E37 (Aug'25) |
| ------------ | ------------ | ------------ |
| 35.x.y       | 36.x.y       | 37.x.y       |
| 34.x.y       | 35.x.y       | 36.x.y       |
| 33.x.y       | 34.x.y       | 35.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

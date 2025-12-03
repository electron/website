---
title: Electron 34.0.0
date: 2025-01-14T00:00:00.000Z
authors: VerteDinde
slug: electron-34-0
tags: [release]
---

Electron 34.0.0 has been released! It includes upgrades to Chromium 132.0.6834.83, V8 13.2, and Node 20.18.1.

---

The Electron team is excited to announce the release of Electron 34.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### HTTP Compression Shared Dictionary Management APIs

HTTP compression allows data to be compressed by a web server before being received by the browser. Modern versions of Chromium support Brotli and Zstandard, which are newer compression algorithms that perform better for text files than older schemes such as gzip.

Custom shared dictionaries further improve the efficiency of Brotli and Zstandard compression. See the [Chrome for Developers blog on shared dictionaries](https://developer.chrome.com/blog/shared-dictionary-compression) for more information.

[@felixrieseberg](https://github.com/felixrieseberg) added the following APIs in [#44950](https://github.com/electron/electron/pull/44950) to manage shared dictionaries at the Session level:

- `session.getSharedDictionaryUsageInfo()`
- `session.getSharedDictionaryInfo(options)`
- `session.clearSharedDictionaryCache()`
- `session.clearSharedDictionaryCacheForIsolationKey(options)`

### Unresponsive Renderer JavaScript Call Stacks

Electron's [`unresponsive`](https://www.electronjs.org/docs/latest/api/web-contents#event-unresponsive) event occurs whenever a renderer process hangs for an excessive period of time. The new `WebFrameMain.collectJavaScriptCallStack()` API added by [@samuelmaddock](https://github.com/samuelmaddock) in [#44204](https://github.com/electron/electron/pull/44204) allows you to collect the JavaScript call stack from the associated `WebFrameMain` object (`webContnets.mainFrame`).

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

> [!WARNING]
> This API requires the `'Document-Policy': 'include-js-call-stacks-in-crash-reports'` header to be enabled. See [#45356](https://github.com/electron/electron/issues/45356) for more details.

## Stack Changes

- Chromium `132.0.6834.83`
  - [New in 131](https://developer.chrome.com/blog/new-in-chrome-131/)
  - [New in 132](https://developer.chrome.com/blog/new-in-chrome-132/)
- Node `20.18.1`
  - [Node 20.18.1 blog post](https://nodejs.org/en/blog/release/v20.18.1/)
- V8 `13.2`

Electron 34 upgrades Chromium from `130.0.6723.44` to `132.0.6834.83`, Node from `20.18.0` to `20.18.1`, and V8 from `13.0` to `13.2`.

## New Features

- Added APIs to manage shared dictionaries for compression efficiency using Brotli or ZStandard. The new APIs are `session.getSharedDictionaryUsageInfo()`, `session.getSharedDictionaryInfo(options)`, `session.clearSharedDictionaryCache()`, and `session.clearSharedDictionaryCacheForIsolationKey(options)`. [#44950](https://github.com/electron/electron/pull/44950)
- Added `WebFrameMain.collectJavaScriptCallStack()` for accessing the JavaScript call stack of unresponsive renderers. [#44938](https://github.com/electron/electron/pull/44938)
- Added `WebFrameMain.detached` for frames in an unloading state.
  - Added `WebFrameMain.isDestroyed()` to determine if a frame has been destroyed.
  - Fixed `webFrameMain.fromId(processId, frameId)` returning a `WebFrameMain` instance which doesn't match the given parameters when the frame is unloading. [#43473](https://github.com/electron/electron/pull/43473)
- Added error event in utility process to support diagnostic reports on V8 fatal errors. [#43774](https://github.com/electron/electron/pull/43774)
- Feat: GPU accelerated shared texture offscreen rendering. [#42953](https://github.com/electron/electron/pull/42953)

## Breaking Changes

### Behavior Changed: menu bar will be hidden during fullscreen on Windows

This brings the behavior to parity with Linux. Prior behavior: Menu bar is still visible during fullscreen on Windows. New behavior: Menu bar is hidden during fullscreen on Windows.

**Correction**: This was previously listed as a breaking change in Electron 33, but was first released in Electron 34.

## End of Support for 31.x.y

Electron 31.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E34 (Jan'25) | E35 (Apr'25) | E36 (Jun'25) |
| ------------ | ------------ | ------------ |
| 34.x.y       | 35.x.y       | 36.x.y       |
| 33.x.y       | 34.x.y       | 35.x.y       |
| 32.x.y       | 33.x.y       | 34.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

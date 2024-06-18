---
title: Electron 25.0.0
date: 2023-05-30T00:00:00.000Z
authors:
  - name: georgexu99
    url: 'https://github.com/georgexu99'
    image_url: 'https://github.com/georgexu99.png?size=96'
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-25-0
tags: [release]
---

Electron 25.0.0 has been released! It includes upgrades to Chromium `114`, V8 `11.4`, and Node.js `18.15.0`. Read below for more details!

<!-- truncate -->

---

The Electron team is excited to announce the release of Electron 25.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Implemented `net.fetch` within Electron's net module, using Chromium's networking stack. This differs from Node's `fetch()`, which uses Node.js' HTTP stack. See [#36733](https://github.com/electron/electron/pull/36733) and [#36606](https://github.com/electron/electron/pull/36606).
- Added `protocol.handle`, which replaces and deprecates `protocol.{register,intercept}{String,Buffer,Stream,Http,File}Protocol`. [#36674](https://github.com/electron/electron/pull/36674)
- Extended support for Electron 22, in order to match Chromium and Microsoft's Windows 7/8/8.1 deprecation plan. See additional details at the end of this blog post.

### Stack Changes

- Chromium `114`
  - [New in Chrome 114](https://developer.chrome.com/blog/new-in-chrome-114/)
  - [New in Chrome 113](https://developer.chrome.com/blog/new-in-chrome-113/)
  - [New in DevTools 114](https://developer.chrome.com/blog/new-in-devtools-114/)
  - [New in DevTools 113](https://developer.chrome.com/blog/new-in-devtools-113/)
- Node.js `18.15.0`
  - [Node 18.15.0 blog post](https://nodejs.org/en/blog/release/v18.15.0/)
- V8 `11.4`

### Breaking Changes

#### Deprecated: `protocol.{register,intercept}{Buffer,String,Stream,File,Http}Protocol`

The `protocol.register*Protocol` and `protocol.intercept*Protocol` methods have
been replaced with [`protocol.handle`](https://www.electronjs.org/docs/latest/api/protocol#protocolhandlescheme-handler).

The new method can either register a new protocol or intercept an existing
protocol, and responses can be of any type.

```js
// Deprecated in Electron 25
protocol.registerBufferProtocol('some-protocol', () => {
  callback({ mimeType: 'text/html', data: Buffer.from('<h5>Response</h5>') });
});

// Replace with
protocol.handle('some-protocol', () => {
  return new Response(
    Buffer.from('<h5>Response</h5>'), // Could also be a string or ReadableStream.
    { headers: { 'content-type': 'text/html' } }
  );
});
```

```js
// Deprecated in Electron 25
protocol.registerHttpProtocol('some-protocol', () => {
  callback({ url: 'https://electronjs.org' });
});

// Replace with
protocol.handle('some-protocol', () => {
  return net.fetch('https://electronjs.org');
});
```

```js
// Deprecated in Electron 25
protocol.registerFileProtocol('some-protocol', () => {
  callback({ filePath: '/path/to/my/file' });
});

// Replace with
protocol.handle('some-protocol', () => {
  return net.fetch('file:///path/to/my/file');
});
```

#### Deprecated: `BrowserWindow.setTrafficLightPosition(position)`

`BrowserWindow.setTrafficLightPosition(position)` has been deprecated, the
`BrowserWindow.setWindowButtonPosition(position)` API should be used instead
which accepts `null` instead of `{ x: 0, y: 0 }` to reset the position to
system default.

```js
// Deprecated in Electron 25
win.setTrafficLightPosition({ x: 10, y: 10 });
win.setTrafficLightPosition({ x: 0, y: 0 });

// Replace with
win.setWindowButtonPosition({ x: 10, y: 10 });
win.setWindowButtonPosition(null);
```

#### Deprecated: `BrowserWindow.getTrafficLightPosition()`

`BrowserWindow.getTrafficLightPosition()` has been deprecated, the
`BrowserWindow.getWindowButtonPosition()` API should be used instead
which returns `null` instead of `{ x: 0, y: 0 }` when there is no custom
position.

```js
// Deprecated in Electron 25
const pos = win.getTrafficLightPosition();
if (pos.x === 0 && pos.y === 0) {
  // No custom position.
}

// Replace with
const ret = win.getWindowButtonPosition();
if (ret === null) {
  // No custom position.
}
```

### New Features

- Added `net.fetch()`. [#36733](https://github.com/electron/electron/pull/36733)
  - `net.fetch` supports requests to `file:` URLs and custom protocols registered with `protocol.register*Protocol`. [#36606](https://github.com/electron/electron/pull/36606)
- Added BrowserWindow.set/getWindowButtonPosition APIs. [#37094](https://github.com/electron/electron/pull/37094)
- Added `protocol.handle`, replacing and deprecating `protocol.{register,intercept}{String,Buffer,Stream,Http,File}Protocol`. [#36674](https://github.com/electron/electron/pull/36674)
- Added a `will-frame-navigate` event to `webContents` and the `<webview>` tag, which fires whenever any frame within the frame hierarchy attempts to navigate. [#34418](https://github.com/electron/electron/pull/34418)
- Added initiator information to navigator events. This information allows distinguishing `window.open` from a parent frame causing a navigation, as opposed to a child-initiated navigation. [#37085](https://github.com/electron/electron/pull/37085)
- Added net.resolveHost that resolves hosts using defaultSession object. [#38152](https://github.com/electron/electron/pull/38152)
- Added new 'did-resign-active' event to `app`. [#38018](https://github.com/electron/electron/pull/38018)
- Added several standard page size options to `webContents.print()`. [#37159](https://github.com/electron/electron/pull/37159)
- Added the `enableLocalEcho` flag to the session handler `ses.setDisplayMediaRequestHandler()` callback for allowing remote audio input to be echoed in the local output stream when `audio` is a `WebFrameMain`. [#37315](https://github.com/electron/electron/pull/37315)
- Added thermal management information to `powerMonitor`. [#38028](https://github.com/electron/electron/pull/38028)
- Allows an absolute path to be passed to the session.fromPath() API. [#37604](https://github.com/electron/electron/pull/37604)
- Exposes the `audio-state-changed` event on `webContents`. [#37366](https://github.com/electron/electron/pull/37366)

## 22.x.y Continued Support

As noted in [Farewell, Windows 7/8/8.1](https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice), Electron 22's (Chromium 108) planned end of life date will be extended from May 30, 2023 to October 10, 2023. The Electron team will continue to backport any security fixes that are part of this program to Electron 22 until October 10, 2023. The October
support date follows the extended support dates from both Chromium and Microsoft. On October 11, the Electron team will drop support back to the latest three stable major versions, which will no longer support Windows 7/8/8.1.

| E25 (May'23) | E26 (Aug'23) | E27 (Oct'23) |
| ------------ | ------------ | ------------ |
| 25.x.y       | 26.x.y       | 27.x.y       |
| 24.x.y       | 25.x.y       | 26.x.y       |
| 23.x.y       | 24.x.y       | 25.x.y       |
| 22.x.y       | 22.x.y       | --           |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

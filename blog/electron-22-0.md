---
title: Electron 22.0.0
date: 2022-11-29T00:00:00.000Z
authors:
    - name: VerteDinde
      url: 'https://github.com/VerteDinde'
      image_url: 'https://github.com/vertedinde.png?size=96'
    - name: georgexu99
      url: 'https://github.com/georgexu99'
      image_url: 'https://github.com/georgexu99.png?size=96'
slug: electron-22-0

---

Electron 22.0.0 has been released! It includes a new utility process API, updates for Windows 7/8/8.1 support, and upgrades to Chromium `108`, V8 `10.8`, and Node.js `16.17.1`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 22.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

* Chromium `108`
    * [New in Chrome 108](https://developer.chrome.com/blog/new-in-chrome-108/)
    * [New in Chrome 107](https://developer.chrome.com/blog/new-in-chrome-107/)
    * [New in DevTools 108](https://developer.chrome.com/blog/new-in-devtools-108/)
    * [New in DevTools 107](https://developer.chrome.com/blog/new-in-devtools-107/)
* Node.js `16.17.1`
    * [Node 16.17.1 blog post](https://nodejs.org/en/blog/release/v16.17.1/)
* V8 `10.8`

### Highlighted Features

### UtilityProcess API [#36089](https://github.com/electron/electron/pull/36089)

The new `UtilityProcess` main process module allows the creation of a lightweight Chromium child process with only Node.js integration while also allowing communication with a sandboxed renderer using `MessageChannel`. The API was designed based on Node.js `child_process.fork` to allow for easier transition, with one primary difference being that the entry point `modulePath` must be from within the packaged application to allow only for trusted scripts to be loaded. Additionally the module prevents establishing communication channels with renderers by default, upholding the contract in which the main process is the only trusted process in the application.

You can read more about the [new UtilityProcess API in our docs here](https://www.electronjs.org/docs/latest/api/utility-process).

## Windows 7/8/8.1 Support Update

Electron 22 will be the last Electron major version to support Windows 7/8/8.1. Electron follows the planned Chromium deprecation policy, which will [deprecate Windows 7/8/8.1 support in Chromium 109 (read more here)](https://support.google.com/chrome/thread/185534985/sunsetting-support-for-windows-7-8-8-1-in-early-2023?hl=en).

Windows 7/8/8.1 will not be supported in Electron 23 and later major releases.

#### Additional Highlighted Changes 

* Added support for Web Bluetooth pin pairing on Linux and Windows. [#35416](https://github.com/electron/electron/pull/35416)
* Added `LoadBrowserProcessSpecificV8Snapshot` as a new fuse that will let the main/browser process load its v8 snapshot from a file at `browser_v8_context_snapshot.bin`. Any other process will use the same path as is used today. [#35266](https://github.com/electron/electron/pull/35266) 
* Added `WebContents.opener` to access window opener and `webContents.fromFrame(frame)` to get the WebContents corresponding to a WebFrameMain instance. [#35140](https://github.com/electron/electron/pull/35140)
* Added support for `navigator.mediaDevices.getDisplayMedia` via a new session handler, `ses.setDisplayMediaRequestHandler`. [#30702](https://github.com/electron/electron/pull/30702) 

## Breaking API Changes

Below are breaking changes introduced in Electron 22. You can read more about these changes and future changes on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

#### Deprecated: `webContents.incrementCapturerCount(stayHidden, stayAwake)`

`webContents.incrementCapturerCount(stayHidden, stayAwake)` has been deprecated.
It is now automatically handled by `webContents.capturePage` when a page capture completes.

```diff
const w = new BrowserWindow({ show: false })

- w.webContents.incrementCapturerCount()
- w.capturePage().then(image => {
-   console.log(image.toDataURL())
-   w.webContents.decrementCapturerCount()
- })

+ w.capturePage().then(image => {
+   console.log(image.toDataURL())
+ })
```

#### Deprecated: `webContents.decrementCapturerCount(stayHidden, stayAwake)`

`webContents.decrementCapturerCount(stayHidden, stayAwake)` has been deprecated.
It is now automatically handled by `webContents.capturePage` when a page capture completes.

```diff
const w = new BrowserWindow({ show: false })

- w.webContents.incrementCapturerCount()
- w.capturePage().then(image => {
-   console.log(image.toDataURL())
-   w.webContents.decrementCapturerCount()
- })

+ w.capturePage().then(image => {
+   console.log(image.toDataURL())
+ })
```

#### Removed: WebContents `new-window` event

The `new-window` event of WebContents has been removed. It is replaced by [`webContents.setWindowOpenHandler()`](https://electronjs.org/docs/latest/api/web-contents#contentssetwindowopenhandlerhandler).

```diff
- webContents.on('new-window', (event) => {
-   event.preventDefault()
- })

+ webContents.setWindowOpenHandler((details) => {
+   return { action: 'deny' }
+ })
```

#### Deprecated: BrowserWindow `scroll-touch-*` events

The `scroll-touch-begin`, `scroll-touch-end` and `scroll-touch-edge` events on
BrowserWindow are deprecated. Instead, use the newly available [`input-event`
event](https://electronjs.org/docs/latest/api/web-contents#event-input-event) on WebContents.

```diff
// Deprecated
- win.on('scroll-touch-begin', scrollTouchBegin)
- win.on('scroll-touch-edge', scrollTouchEdge)
- win.on('scroll-touch-end', scrollTouchEnd)

// Replace with
+ win.webContents.on('input-event', (_, event) => {
+   if (event.type === 'gestureScrollBegin') {
+     scrollTouchBegin()
+   } else if (event.type === 'gestureScrollUpdate') {
+     scrollTouchEdge()
+   } else if (event.type === 'gestureScrollEnd') {
+     scrollTouchEnd()
+   }
+ })
```

## End of Support for 19.x.y

Electron 19.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E19 (May'22) | E20 (Aug'22) | E21 (Sep'22) | E22 (Nov'22) | E23 (Jan'23) |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       | 23.x.y       |
| 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       |
| 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       |

## What's Next

The Electron project will pause for the the month of December 2022, and return in January 2023. More information can be found in the [December shutdown blog post](https://www.electronjs.org/blog/a-quiet-place-22).

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

---
title: Electron 22.0.0
date: 2022-11-22T00:00:00.000Z
authors:
    - name: vertedinde
      url: 'https://github.com/vertedinde'
      image_url: 'https://github.com/vertedinde.png?size=96'
    - name: georgexu99
      url: 'https://github.com/georgexu99'
      image_url: 'https://github.com/georgexu99.png?size=96'
slug: electron-22-0

---

**
sudowoodo generated release notes
(doesn't seem to have breaking changes? my scrip )
https://corp.quip.com/8FIeArIwJ6Lu/v22-release-notes
**

Electron 22.0.0 has been released! It includes upgrades to Chromium `108`, V8 `10.8`, and Node.js `16.17.1`. Read below for more details!

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

### New Features

* Added WebContents `input-event` event.
  * Deprecated BrowserWindow `scroll-touch-*` events. [#35531](https://github.com/electron/electron/pull/35531) 
* Added `LoadBrowserProcessSpecificV8Snapshot` as a new fuse that will let the main/browser process load its v8 snapshot from a file at `browser_v8_context_snapshot.bin`. Any other process will use the same path as is used today. [#35266](https://github.com/electron/electron/pull/35266) <span style="font-size:small;">(Also in [20](https://github.com/electron/electron/pull/35694), [21](https://github.com/electron/electron/pull/35695))</span>
* Added `WebContents.opener` to access window opener.
  * Added `webContents.fromFrame(frame)` to get the WebContents corresponding to a WebFrameMain instance. [#35140](https://github.com/electron/electron/pull/35140) <span style="font-size:small;">(Also in [21](https://github.com/electron/electron/pull/35819))</span>
* Added `app.getSystemLocale()` method. [#35697](https://github.com/electron/electron/pull/35697) <span style="font-size:small;">(Also in [21](https://github.com/electron/electron/pull/35794))</span>
* Added `contextBridge.exposeInIsolatedWorld(worldId, key, api)` to expose an API to an `isolatedWorld` within a renderer from a preload script. [#34974](https://github.com/electron/electron/pull/34974) 
* Added `webContents.close()` method. [#35509](https://github.com/electron/electron/pull/35509) 
* Added `webFrameMain.origin`. [#35438](https://github.com/electron/electron/pull/35438) <span style="font-size:small;">(Also in [19](https://github.com/electron/electron/pull/35624), [20](https://github.com/electron/electron/pull/35535), [21](https://github.com/electron/electron/pull/35534))</span>
* Added an `app.getPreferredSystemLanguages()` API to return the user's system languages. [#36291](https://github.com/electron/electron/pull/36291) <span style="font-size:small;">(Also in [21](https://github.com/electron/electron/pull/36290))</span>
* Added new UtilityProcess API to launch chromium child process with node integration. [#36089](https://github.com/electron/electron/pull/36089) 
* Added new WebContents event `content-bounds-updated`. [#35533](https://github.com/electron/electron/pull/35533) 
* Added new `WebContents.ipc` and `WebFrameMain.ipc` APIs. [#34959](https://github.com/electron/electron/pull/34959) <span style="font-size:small;">(Also in [21](https://github.com/electron/electron/pull/35231))</span>
* Added support for Web Bluetooth pin pairing on Linux and Windows. [#35416](https://github.com/electron/electron/pull/35416) <span style="font-size:small;">(Also in [21](https://github.com/electron/electron/pull/35818))</span>
* Added support for `navigator.mediaDevices.getDisplayMedia` via a new session handler, `ses.setDisplayMediaRequestHandler`. [#30702](https://github.com/electron/electron/pull/30702) 
* Added support for `serialPort.forget()` as well as a new event `serial-port-revoked` emitted when a given origin is revoked. [#36062](https://github.com/electron/electron/pull/36062)

## Breaking & API Changes

Below are breaking changes introduced in Electron 22. 

## End of Support for 19.x.y

Electron 19.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E19 (May'22) | E20 (Aug'22) | E21 (Sep'22) | E22 (Nov'22) | E23 (Jan'23) |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       | 23.x.y       |
| 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       |
| 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.
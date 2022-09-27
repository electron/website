---
title: Electron 21.0.0
date: 2022-09-27T00:00:00.000Z
authors:
    - name: ckerr
      url: 'https://github.com/ckerr'
      image_url: 'https://github.com/ckerr.png?size=96'
    - name: vertedinde
      url: 'https://github.com/vertedinde'
      image_url: 'https://github.com/vertedinde.png?size=96'
    - name: georgexu99
      url: 'https://github.com/georgexu99'
      image_url: 'https://github.com/georgexu99.png?size=96'
slug: electron-21-0

---

Electron 21.0.0 has been released! It includes upgrades to Chromium `106`, V8 `10.6`, and Node.js `16.16.0`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 21.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

* Chromium `106`
    * [New in Chrome 106](https://developer.chrome.com/blog/new-in-chrome-106/)
    * [New in Chrome 105](https://developer.chrome.com/blog/new-in-chrome-105/)
    * [New in DevTools 106](https://developer.chrome.com/blog/new-in-devtools-106/)
    * [New in DevTools 105](https://developer.chrome.com/blog/new-in-devtools-105/)
* Node.js `16.16.0`
    * [Node 16.16.0 blog post](https://nodejs.org/en/blog/release/v16.16.0/)
* V8 `10.6`

### New Features

* Added `webFrameMain.origin`. [#35534](https://github.com/electron/electron/pull/35534)
* Added new `WebContents.ipc` and `WebFrameMain.ipc` APIs. [#35231](https://github.com/electron/electron/pull/35231) 
* Added support for panel-like behavior. Window can float over full-screened apps. [#34388](https://github.com/electron/electron/pull/34388)
* Added support for push notifications from APNs for macOS apps. [#33574](https://github.com/electron/electron/pull/33574) 

## Breaking & API Changes

Below are breaking changes introduced in Electron 21. 

### V8 Memory Cage Enabled

Electron 21 enables [V8 sandboxed pointers](https://docs.google.com/document/d/1HSap8-J3HcrZvT7-5NsbYWcjfc0BVoops5TDHZNsnko/edit), following Chrome's [decision to do the same in Chrome 103](https://chromiumdash.appspot.com/commit/9a6a76bf13d3ca1c6788de193afc5513919dd0ed). This has some implications for native modules. This feature has performance and security benefits, but also places some new restrictions on native modules, e.g. use of ArrayBuffers that point to external ("off-heap") memory. Please see [this blog post](https://electronjs.org/blog/v8-memory-cage) for more information. [#34724](https://github.com/electron/electron/pull/34724) 

### Refactored webContents.printToPDF
Refactored `webContents.printToPDF` to align with Chromium's headless implementation. See [#33654](https://github.com/electron/electron/pull/33654) for more information.

More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

## End of Support for 18.x.y

Electron 18.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E18 (Mar'22) | E19 (May'22) | E20 (Aug'22) | E21 (Sep'22) | E22 (Dec'22) |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       |
| 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       |
| 16.x.y       | 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

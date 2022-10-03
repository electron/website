---
title: Electron 20.0.0
date: 2022-08-02T00:00:00.000Z
authors:
    - name: ckerr
      url: 'https://github.com/ckerr'
      image_url: 'https://github.com/ckerr.png?size=96'
slug: electron-20-0

---

Electron 20.0.0 has been released! It includes upgrades to Chromium `104`, V8 `10.4`, and Node.js `16.15.0`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 20.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### New Features

* Added immersive dark mode on Windows. [#34549](https://github.com/electron/electron/pull/34549)
* Added support for panel-like behavior. Window can float over full-screened apps. [#34665](https://github.com/electron/electron/pull/34665)
* Updated Windows Control Overlay buttons to look and feel more native on Windows 11. [#34888](https://github.com/electron/electron/pull/34888)
* Renderers are now sandboxed by default unless `nodeIntegration: true` or `sandbox: false` is specified. [#35125](https://github.com/electron/electron/pull/35125)
* Added safeguards when building native modules with nan. [#35160](https://github.com/electron/electron/pull/35160)

### Stack Changes

* Chromium `104`
    * [New in Chrome 104](https://developer.chrome.com/blog/new-in-chrome-104/)
    * [New in Chrome 103](https://developer.chrome.com/blog/new-in-chrome-103/)
    * [New in DevTools](https://developer.chrome.com/blog/new-in-devtools-104/)
* Node.js `16.15.0`
    * [Node 16.15.0 blog post](https://nodejs.org/en/blog/release/v16.15.0/)
* V8 `10.4`

## Breaking & API Changes

Below are breaking changes introduced in Electron 20. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### Default Changed: renderers without `nodeIntegration: true` are sandboxed by default

Previously, renderers that specified a preload script defaulted to being unsandboxed. This meant that by default, preload scripts had access to Node.js. In Electron 20, this default has changed. Beginning in Electron 20, renderers will be sandboxed by default, unless `nodeIntegration: true` or `sandbox: false` is specified.

If your preload scripts do not depend on Node, no action is needed. If your preload scripts do depend on Node, either refactor them to remove Node usage from the renderer, or explicitly specify `sandbox: false` for the relevant renderers.

### Fixed: spontaneous crashing in nan native modules

In Electron 20, we changed two items related to native modules:
1. V8 headers now use `c++17` by default. This flag was added to electron-rebuild.
1. We fixed an issue where a missing include would cause spontaneous crashing in native modules that depended on nan.

For the most stability, we recommend using node-gyp >=8.4.0 and electron-rebuild >=3.2.9 when rebuilding native modules, particularly modules that depend on nan. See electron [#35160](https://github.com/electron/electron/pull/35160) and node-gyp [#2497](https://github.com/nodejs/node-gyp/pull/2497) for more information.

### Removed: `.skipTaskbar` on Linux

On X11, `skipTaskbar` sends a `_NET_WM_STATE_SKIP_TASKBAR` message to the X11 window manager. There is not a direct equivalent for Wayland, and the known workarounds have unacceptable tradeoffs (e.g. Window.is_skip_taskbar in GNOME requires unsafe mode), so Electron is unable to support this feature on Linux.

## End of Support for 17.x.y

Electron 17.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E18 (Mar'22) | E19 (May'22) | E20 (Aug'22) | E21 (Sep'22) | E22 (Dec'22) |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       |
| 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       |
| 16.x.y       | 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       |
| 15.x.y       | --           | --           | --           | --           |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8. Although we are careful not to make promises about release dates, our plan is to release new major versions of Electron with new versions of those components approximately every 2 months.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

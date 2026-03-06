---
title: Electron 41.0.0
date: 2026-03-10T00:00:00.000Z
authors:
  - ckerr
slug: electron-41-0
tags: [release]
---

Electron 41.0.0 has been released! It includes upgrades to Chromium 146.0.7680.31, V8 14.6, and Node v24.14.0.

---

The Electron team is excited to announce the release of Electron 41.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

<!--truncate-->

## Stack Changes

- Chromium `147.0.7714.0`
  - [New in 146](https://developer.chrome.com/blog/new-in-chrome-146/)
  - [New in 145](https://developer.chrome.com/blog/new-in-chrome-145/)

- Node `v24.14.0`
  - [Node 24.14.0 blog post](https://nodejs.org/en/blog/release/v24.14.0)
  - [Node 24.13.1 blog post](https://nodejs.org/en/blog/release/v24.13.1)
  - [Node 24.13.0 blog post](https://nodejs.org/en/blog/release/v24.13.0)
  - [Node 24.12.0 blog post](https://nodejs.org/en/blog/release/v24.12.0)
  -

- V8 `14.4`
  - [V8 roll increment](https://chromium.googlesource.com/v8/v8.git/+/3f4b2d428486d982bf51d7c0487adcd9f73f5fd8)

Electron 41 upgrades Chromium from `144.0.7559.60` to `146.0.7680.31`, Node.js from `v24.11.1` to `v24.14.0`, and V8 from `14.4` to `14.6`.

### New Features and Improvements

TODO
- Added "memory-eviction" as a possible reason for a child process to exit. [#48362](https://github.com/electron/electron/pull/48362)
- Added `RGBAF16` output format with scRGB HDR color space support to Offscreen Rendering. [#48265](https://github.com/electron/electron/pull/48265) <sup>(Also in [39](https://github.com/electron/electron/pull/48504))</sup>
- Added `app.isHardwareAccelerationEnabled()`. [#47614](https://github.com/electron/electron/pull/47614) <sup>(Also in [37](https://github.com/electron/electron/pull/48679), [38](https://github.com/electron/electron/pull/48681), [39](https://github.com/electron/electron/pull/48680))</sup>
- Added bypassCustomProtocolHandlers option to net.request. [#48883](https://github.com/electron/electron/pull/48883) <sup>(Also in [38](https://github.com/electron/electron/pull/48881), [39](https://github.com/electron/electron/pull/48882))</sup>
- Added methods to enable more granular accessibility support management. [#48042](https://github.com/electron/electron/pull/48042) <sup>(Also in [37](https://github.com/electron/electron/pull/48627), [38](https://github.com/electron/electron/pull/48626), [39](https://github.com/electron/electron/pull/48625))</sup>
- Added support to import external shared texture as VideoFrame. [#48831](https://github.com/electron/electron/pull/48831)
- Added the ability to retrieve the system accent color on Linux using `systemPreferences.getAccentColor`. [#48027](https://github.com/electron/electron/pull/48027) <sup>(Also in [39](https://github.com/electron/electron/pull/48628))</sup>
- Allowed for persisting File System API grant status within a given session. [#48170](https://github.com/electron/electron/pull/48170) <sup>(Also in [37](https://github.com/electron/electron/pull/48328), [38](https://github.com/electron/electron/pull/48327), [39](https://github.com/electron/electron/pull/48344))</sup>
- Automatically focus DevTools when element is inspected or breakpoint is triggered. [#46386](https://github.com/electron/electron/pull/46386) <sup>(Also in [37](https://github.com/electron/electron/pull/48703), [38](https://github.com/electron/electron/pull/48701), [39](https://github.com/electron/electron/pull/48702))</sup>
- Enables resetting accent color to follow system accent settings if a previous color has been set via `window.setAccentColor(null)`. [#48274](https://github.com/electron/electron/pull/48274) <sup>(Also in [38](https://github.com/electron/electron/pull/48853), [39](https://github.com/electron/electron/pull/48852))</sup>
- Support dynamic ESM imports in non-context isolated preloads. [#48375](https://github.com/electron/electron/pull/48375) <sup>(Also in [37](https://github.com/electron/electron/pull/48487), [38](https://github.com/electron/electron/pull/48489), [39](https://github.com/electron/electron/pull/48488))</sup>
- Updated `nativeImage.createFromNamedImage` to support SF Symbol names. [#48772](https://github.com/electron/electron/pull/48772) <sup>(Also in [39](https://github.com/electron/electron/pull/48773))</sup>

TODO
### Breaking Changes

#### Deprecated: clipboard API access from renderer processes

Using the clipboard API directly in the renderer process is deprecated. If you want to call this API from a renderer process, place the API call in your preload script and expose it using the contextBridge API.

#### Behavior Changed: MacOS dSYM files now compressed with tar.xz

Debug symbols for MacOS (dSYM) now use xz compression in order to handle larger file sizes. dsym.zip files are now dsym.tar.xz files. End users using debug symbols may need to update their zip utilities.

## End of Support for 38.x.y

Electron 38.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

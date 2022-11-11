---
title: Electron 15.0.0
date: 2021-09-21T00:00:00.000Z
authors:
  - name: sofianguy
    url: 'https://github.com/sofianguy'
    image_url: 'https://github.com/sofianguy.png?size=96'
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-15-0
---

Electron 15.0.0 has been released! It includes upgrades to Chromium `94`, V8 `9.4`, and Node.js `16.5.0`. We've added API updates to window.open, bug fixes, and general improvements. Read below for more details!

---

The Electron team is excited to announce the release of Electron 15.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### Electron Release Cadence Change

Starting with Electron 15, Electron will release a new major stable version every 8 weeks. You can read the [full details here](https://www.electronjs.org/blog/8-week-cadence).

Additionally, Electron will be changing supported versions from latest three versions to latest four versions until May 2022. [See our versioning document](https://www.electronjs.org/docs/latest/tutorial/electron-versioning)for more detailed information about versioning in Electron.

### Stack Changes

* Chromium `94`
    * [New in Chrome 94](https://developer.chrome.com/blog/new-in-chrome-94/)
* Node.js `16.5.0`
    * [Node 16.5.0 blog post](https://nodejs.org/en/blog/release/v16.5.0/)
* V8 `9.4`
    * [V8 9.4 blog post](https://v8.dev/blog/v8-release-94)

### Highlight Features

* `nativeWindowOpen: true` is no longer experimental, and is now the default.
* Added `safeStorage` string encryption API. [#30430](https://github.com/electron/electron/pull/30430) 
* Added 'frame-created' event to `WebContents` which emits when a frame is created in the page. [#30801](https://github.com/electron/electron/pull/30801) 
* Added resize `edge` info to `BrowserWindow`'s `will-resize` event. [#29199](https://github.com/electron/electron/pull/29199)

See the [15.0.0 release notes](https://github.com/electron/electron/releases/tag/v15.0.0) for a full list of new features and changes.

## Breaking Changes

Below are breaking changes introduced in Electron 15. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### Default Changed: nativeWindowOpen defaults to true

Prior to Electron 15, `window.open` was by default shimmed to use `BrowserWindowProxy`. This meant that `window.open('about:blank')` did not work to open synchronously scriptable child windows, among other incompatibilities. `nativeWindowOpen: true` is no longer experimental, and is now the default.

See the documentation for [window.open](https://www.electronjs.org/docs/latest/api/window-open) in Electron for more details.


## API Changes

* Added 'frame-created' event to `WebContents` which emits when a frame is created in the page. [#30801](https://github.com/electron/electron/pull/30801) 
* Added `safeStorage` string encryption API. [#30430](https://github.com/electron/electron/pull/30430) 
* Added `signal` option to `dialog.showMessageBox`. [#26102](https://github.com/electron/electron/pull/26102) 
* Added an [Electron Fuse](https://www.electronjs.org/docs/latest/tutorial/fuses) for enforcing code signatures on the `app.asar` file your application loads.  Requires the latest `asar` module (v3.1.0 or higher). [#30900](https://github.com/electron/electron/pull/30900) 
* Added fuses to disable `NODE_OPTIONS` and `--inspect` debug arguments in packaged apps. [#30420](https://github.com/electron/electron/pull/30420)
* Added new `MenuItem.userAccelerator` property to read user-assigned macOS accelerator overrides. [#26682](https://github.com/electron/electron/pull/26682) 
* Added new `app.runningUnderARM64Translation` property to detect when running under Rosetta on Apple Silicon, or WOW on Windows for ARM. [#29168](https://github.com/electron/electron/pull/29168) 
* Added new `imageAnimationPolicy` web preference to control how images are animated. [#29095](https://github.com/electron/electron/pull/29095) 
* Added support for sending Blobs over the context bridge. [#29247](https://github.com/electron/electron/pull/29247)


### Removed/Deprecated Changes

No APIs have been removed or deprecated.

## Supported Versions

Starting in Electron 15, we will change supported versions from latest three versions to latest four versions until May 2022 with Electron 19. After Electron 19, we will return to supporting the latest three versions. This version support change is part of our new cadence change. Please see [our blog post for full details here](https://www.electronjs.org/blog/8-week-cadence/#-will-electron-extend-the-number-of-supported-versions).

Developers and applications are encouraged to upgrade to a newer version of Electron.

|	E15 (Sep'21) |	E16 (Nov'21) |	E17 (Feb'22) |	E18 (Mar'22) |	E19 (May'22) |
| ---- | ---- | ---- | ---- | ---- |
|	15.x.y |	16.x.y |	17.x.y |	18.x.y |	19.x.y |
|	14.x.y |	15.x.y |	16.x.y |	17.x.y |	18.x.y |
|	13.x.y |	14.x.y |	15.x.y |	16.x.y |	17.x.y |
|	12.x.y |	13.x.y |	14.x.y |	15.x.y |	-- |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8. Although we are careful not to make promises about release dates, our plan is release new major versions of Electron with new versions of those components approximately quarterly.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

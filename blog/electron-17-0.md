---
title: Electron 17.0.0
date: 2022-02-01T00:00:00.000Z
authors:
    - name: mlaurencin
      url: 'https://github.com/mlaurencin'
      image_url: 'https://github.com/mlaurencin.png?size=96'
    - name: VerteDinde
      url: 'https://github.com/VerteDinde'
      image_url: 'https://github.com/VerteDinde.png?size=96'
slug: electron-17-0

---

Electron 17.0.0 has been released! It includes upgrades to Chromium `98`, V8 `9.8`, and Node.js `16.13.0`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 17.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### Electron Release Cadence Change

As of Electron 15, Electron will release a new major stable version every 8 weeks. You can read the [full details here](https://www.electronjs.org/blog/8-week-cadence).

Additionally, Electron has changed supported versions from latest three versions to latest four versions until May 2022. [See our versioning document](https://www.electronjs.org/docs/latest/tutorial/electron-versioning) for more detailed information about versioning in Electron. After May 2022, we will return to supporting latest three versions.

### Stack Changes

* Chromium `98`
    * [New in Chrome 98](https://developer.chrome.com/blog/new-in-chrome-98/)
* Node.js `16.13.0`
    * [Node 16.13.0 blog post](https://nodejs.org/en/blog/release/v16.13.0/)
* V8 `9.8`

### Highlighted Features

* Added `webContents.getMediaSourceId()`, can be used with `getUserMedia` to get a stream for a WebContents. [#31204](https://github.com/electron/electron/pull/31204)
* Deprecates `webContents.getPrinters()` and introduces `webContents.getPrintersAsync()`. [#31023](https://github.com/electron/electron/pull/31023)
* `desktopCapturer.getSources` is now only available in the main process. [#30720](https://github.com/electron/electron/pull/30720)

See the [17.0.0 release notes](https://github.com/electron/electron/releases/tag/v17.0.0) for a full list of new features and changes.

## Breaking Changes

Below are breaking changes introduced in Electron 17. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### desktopCapturer.getSources in the renderer

The desktopCapturer.getSources API is now only available in the main process. This has been changed in order to improve the default security of Electron apps.

### API Changes

There were no API changes in Electron 17. 

### Removed/Deprecated Changes

* Usage of the `desktopCapturer.getSources` API in the renderer has been removed. See [here](https://raw.githubusercontent.com/electron/electron/main/docs/breaking-changes.md#removed-desktopcapturergetsources-in-the-renderer) for details on how to replace this API in your app.

## End of Support for 13.x.y

Electron 13.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/support#supported-versions). Developers and applications are encouraged to upgrade to a newer version of Electron.

As of Electron 15, we have changed supported versions from latest three versions to latest four versions until May 2022 with Electron 19. After Electron 19, we will return to supporting the latest three versions. This version support change is part of our new cadence change. Please see [our blog post for full details here](https://www.electronjs.org/blog/8-week-cadence/#-will-electron-extend-the-number-of-supported-versions).

|	E15 (Sep'21) |	E16 (Nov'21) |	E17 (Feb'22) |	E18 (Mar'22) |	E19 (May'22) |
| ---- | ---- | ---- | ---- | ---- |
|	15.x.y |	16.x.y |	17.x.y |	18.x.y |	19.x.y |
|	14.x.y |	15.x.y |	16.x.y |	17.x.y |	18.x.y |
|	13.x.y |	14.x.y |	15.x.y |	16.x.y |	17.x.y |
|	12.x.y |	13.x.y |	14.x.y |	15.x.y |	-- |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8. Although we are careful not to make promises about release dates, our plan is to release new major versions of Electron with new versions of those components approximately every 2 months.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

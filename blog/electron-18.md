---
title: Electron 18.0.0
date: 2022-03-29T00:00:00.000Z
authors:
    - name: VerteDinde
      url: 'https://github.com/VerteDinde'
      image_url: 'https://github.com/VerteDinde.png?size=96'
    - name: sofianguy
      url: 'https://github.com/sofianguy'
      image_url: 'https://github.com/sofianguy.png?size=96'
slug: electron-18-0

---

Electron 18.0.0 has been released! It includes upgrades to Chromium `100`, V8 `10.0`, and Node.js `16.13.2`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 18.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### Electron Release Cadence Change

As of Electron 15, Electron will release a new major stable version every 8 weeks. You can read the [full details here](https://www.electronjs.org/blog/8-week-cadence).

Additionally, Electron has changed supported versions from latest three versions to latest four versions until May 2022. [See our versioning document](https://www.electronjs.org/docs/latest/tutorial/electron-versioning) for more detailed information about versioning in Electron. After May 2022, we will return to supporting latest three versions.

### Stack Changes

* Chromium `100`
    * [New in Chrome 100](https://developer.chrome.com/blog/new-in-chrome-100/)
* Node.js `16.13.2`
    * [Node 16.13.2 blog post](https://nodejs.org/en/blog/release/v16.13.2/)
* V8 `10.0`

### Highlighted Features

* Added `ses.setCodeCachePath()` API for setting code cache directory. [#33286](https://github.com/electron/electron/pull/33286)
* Removed the old `BrowserWindowProxy`-based implementation of `window.open`. This also removes the `nativeWindowOpen` option from `webPreferences`. [#29405](https://github.com/electron/electron/pull/29405)
* Added 'focus' and 'blur' events to `WebContents`. [#25873](https://github.com/electron/electron/pull/25873) 
* Added Substitutions menu roles on macOS: `showSubstitutions`, `toggleSmartQuotes`, `toggleSmartDashes`, `toggleTextReplacement`. [#32024](https://github.com/electron/electron/pull/32024) 
* Added `first-instance-ack` event to the `app.requestSingleInstanceLock()` flow, so that users can pass some data back from the second instance to the first instance. [#31460](https://github.com/electron/electron/pull/31460)  
* Added support for more color formats in `setBackgroundColor`. [#33364](https://github.com/electron/electron/pull/33364)

See the [18.0.0 release notes](https://github.com/electron/electron/releases/tag/v18.0.0) for a full list of new features and changes.

## Breaking & API Changes

Below are breaking changes introduced in Electron 18. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### Removed: `nativeWindowOpen`

Prior to Electron 15, `window.open` was by default shimmed to use `BrowserWindowProxy`. This meant that `window.open('about:blank')` did not work to open synchronously scriptable child windows, among other incompatibilities. Since Electron 15, `nativeWindowOpen` has been enabled by default.

See the [documentation for window.open](https://www.electronjs.org/docs/latest/api/window-open#windowopenurl-framename-features) in Electron for more details. Removed in [#29405](https://github.com/electron/electron/pull/29405) 

## End of Support for 14.x.y

Electron 14.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

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

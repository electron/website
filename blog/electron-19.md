---
title: Electron 19.0.0
date: 2022-05-24T00:00:00.000Z
authors:
    - name: VerteDinde
      url: 'https://github.com/VerteDinde'
      image_url: 'https://github.com/VerteDinde.png?size=96'
    - name: ckerr
      url: 'https://github.com/ckerr'
      image_url: 'https://github.com/ckerr.png?size=96'
slug: electron-19-0

---

Electron 19.0.0 has been released! It includes upgrades to Chromium `102`, V8 `10.2`, and Node.js `16.14.2`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 19.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### Electron Release Cadence Change

The project is returning to its earlier policy of supporting the latest three major versions. [See our versioning document](https://www.electronjs.org/docs/latest/tutorial/electron-versioning) for more detailed information about Electron versioning and support. This had temporarily been four major versions to help users adjust to the new release cadence that began in Electron 15. You can read the [full details here](https://www.electronjs.org/blog/8-week-cadence). 

### Stack Changes

* Chromium `102`
    * [New in Chrome 102](https://developer.chrome.com/blog/new-in-chrome-102/)
    * [New in Chrome 101](https://developer.chrome.com/blog/new-in-chrome-101/)
* Node.js `16.14.2`
    * [Node 16.14.2 blog post](https://nodejs.org/en/blog/release/v16.14.2/)
* V8 `10.2`

## Breaking & API Changes

Below are breaking changes introduced in Electron 19. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### Unsupported on Linux: `.skipTaskbar`

The BrowserWindow constructor option `skipTaskbar` is no longer supported on Linux. Changed in [#33226](https://github.com/electron/electron/pull/33226)

### Removed WebPreferences.preloadURL

The semi-documented `preloadURL` property has been removed from WebPreferences. [#33228](https://github.com/electron/electron/pull/33228). `WebPreferences.preload` should be used instead.

## End of Support for 15.x.y and 16.x.y

Electron 14.x.y and 15.x.y have both reached end-of-support. This [returns](https://www.electronjs.org/blog/8-week-cadence/#-will-electron-extend-the-number-of-supported-versions) Electron to its [existing policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy) of supporting the latest three major versions. Developers and applications are encouraged to upgrade to a newer version of Electron.

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

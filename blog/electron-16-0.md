---
title: Electron 16.0.0
date: 2021-11-16T00:00:00.000Z
authors:
    - name: sofianguy
      url: 'https://github.com/sofianguy'
      image_url: 'https://github.com/sofianguy.png?size=96'
    - name: ckerr
      url: 'https://github.com/ckerr'
      image_url: 'https://github.com/ckerr.png?size=96'
slug: electron-16-0

---

Electron 16.0.0 has been released! It includes upgrades to Chromium `96`, V8 `9.6`, and Node.js `16.9.1`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 16.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://www.electronjs.org/releases/stable). Continue reading for details about this release and please share any feedback you have!

## Notable Changes

### Electron Release Cadence Change

As of Electron 15, Electron will release a new major stable version every 8 weeks. You can read the [full details here](https://www.electronjs.org/blog/8-week-cadence).

Additionally, Electron has changed supported versions from latest three versions to latest four versions until May 2022. [See our versioning document](https://www.electronjs.org/docs/latest/tutorial/electron-versioning) for more detailed information about versioning in Electron. After May 2022, we will return to supporting latest three versions.

### Stack Changes

* Chromium `96`
    * [New in Chrome 96](https://developer.chrome.com/blog/new-in-chrome-96/)
* Node.js `16.9.1`
    * [Node 16.9.1 blog post](https://nodejs.org/en/blog/release/v16.9.1/)
* V8 `9.6`
    * [V8 9.6 blog post](https://v8.dev/blog/v8-release-96)

### Highlighted Features

* Now supports the [WebHID](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) API. [#30213](https://github.com/electron/electron/pull/30213)
* Add data parameter to `app.requestSingleInstanceLock` to share data between instances. [#30891](https://github.com/electron/electron/pull/30891)
* Pass securityOrigin to media permissions request handler. [#31357](https://github.com/electron/electron/pull/31357)
* Add `commandLine.removeSwitch`. [#30933](https://github.com/electron/electron/pull/30933)

See the [16.0.0 release notes](https://github.com/electron/electron/releases/tag/v16.0.0) for a full list of new features and changes.

## Breaking Changes

Below are breaking changes introduced in Electron 16. More information about these and future changes can be found on the [Planned Breaking Changes](https://www.electronjs.org/docs/latest/breaking-changes) page.

### Building Native Modules

If your project uses node-gyp to build native modules, you may need to call it with `--force-process-config` depending on your project's setup and your Electron version. More information about this change can be found at [#2497](https://github.com/nodejs/node-gyp/pull/2497).

### Behavior Changed: `crashReporter` implementation switched to Crashpad on Linux

The underlying implementation of the `crashReporter` API on Linux has changed from Breakpad to Crashpad, bringing it in line with Windows and Mac. As a result of this, child processes are now automatically monitored, and calling `process.crashReporter.start` in Node child processes is no longer needed (and is not advisable, as it will start a second instance of the Crashpad reporter).

There are also some subtle changes to how annotations will be reported on Linux, including that long values will no longer be split between annotations appended with `__1`, `__2` and so on, and instead will be truncated at the (new, longer) annotation value limit.

### API Changes

There were no API changes in Electron 16.

### Removed/Deprecated Changes

* Usage of the `desktopCapturer.getSources` API in the renderer has been deprecated and will be removed. This change improves the default security of Electron apps. See [here](https://raw.githubusercontent.com/electron/electron/main/docs/breaking-changes.md#removed-desktopcapturergetsources-in-the-renderer) for details on how to replace this API in your app.

## End of Support for 12.x.y

Electron 12.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/support#supported-versions). Developers and applications are encouraged to upgrade to a newer version of Electron.

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

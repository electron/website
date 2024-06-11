---
title: Electron 31.0.0
date: 2024-06-11T00:00:00.000Z
authors:
  - name: VerteDinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-31-0
---

Electron 31.0.0 has been released! It includes upgrades to Chromium `126.0.6478.36`, V8 `12.6`, and Node `20.14.0`.

---

The Electron team is excited to announce the release of Electron 31.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Extended `WebContentsView` to accept pre-existing `webContents` object. [#42319](https://github.com/electron/electron/pull/42319)
- Added support for `NODE_EXTRA_CA_CERTS`. [#41689](https://github.com/electron/electron/pull/41689)
- Updated window.flashFrame(bool) to flash continuously on macOS. [#41391](https://github.com/electron/electron/pull/41391)
- Removed `WebSQL` support [#41868](https://github.com/electron/electron/pull/41868)
- `nativeImage.toDataURL` will preserve PNG colorspace [#41610](https://github.com/electron/electron/pull/41610)
- Extended `webContents.setWindowOpenHandler` to support manual creation of BrowserWindow. [#41432](https://github.com/el
  ectron/electron/pull/41432)

### Stack Changes

- Chromium`126.0.6478.36`
  - [New in 126](https://developer.chrome.com/blog/new-in-chrome-126/)
  - [New in 125](https://developer.chrome.com/blog/new-in-chrome-125/)
- Node `20.14.0`
  - [Node 20.14.0 blog post](https://nodejs.org/en/blog/release/v20.14.0/)
- V8 `12.6`

Electron 31 upgrades Chromium from `124.0.6367.49` to `126.0.6478.36`, Node from `20.11.1` to `20.14.0`, and V8 from `12.4` to `12.6`.

### New Features

- Added `clearData` method to `Session`. [#40983](https://github.com/electron/electron/pull/40983)
  - Added options parameter to `Session.clearData` API. [#41355](https://github.com/electron/electron/pull/41355)
- Added support for Bluetooth ports being requested by service class ID in `navigator.serial`. [#41638](https://github.com/electron/electron/pull/41638)
- Added support for Node's [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile) environment variable. [#41689](https://github.com/electron/electron/pull/41689)
- Extended `webContents.setWindowOpenHandler` to support manual creation of BrowserWindow. [#41432](https://github.com/electron/electron/pull/41432)
- Implemented support for the web standard [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API). [#41419](https://github.com/electron/electron/pull/41419)
- Extended `WebContentsView` to accept pre-existing `WebContents` instances. [#42319](https://github.com/electron/electron/pull/42319)
- Added a new instance property `navigationHistory` on webContents API with `navigationHistory.getEntryAtIndex` method, enabling applications to retrieve the URL and title of any navigation entry within the browsing history. [#41577](https://github.com/electron/electron/pull/41577) <span style={{fontSize: "small"}}>(Also in [29](https://github.com/electron/electron/pull/41661), [30](https://github.com/electron/electron/pull/41662))</span>

### Breaking Changes

#### Removed: `WebSQL` support

Chromium has removed support for WebSQL upstream, transitioning it to Android only. See
[Chromium's intent to remove discussion](https://groups.google.com/a/chromium.org/g/blink-dev/c/fWYb6evVA-w/m/pziWcvboAgAJ)
for more information.

#### Behavior Changed: `nativeImage.toDataURL` will preseve PNG colorspace

PNG decoder implementation has been changed to preserve colorspace data. The
encoded data returned from this function now matches it.

See [crbug.com/332584706](https://issues.chromium.org/issues/332584706) for more information.

#### Behavior Changed: `window.flashFrame(bool)` will flash dock icon continuously on macOS

This brings the behavior to parity with Windows and Linux. Prior behavior: The first `flashFrame(true)` bounces the dock icon only once (using the [NSInformationalRequest](https://developer.apple.com/documentation/appkit/nsrequestuserattentiontype/nsinformationalrequest) level) and `flashFrame(false)` does nothing. New behavior: Flash continuously until `flashFrame(false)` is called. This uses the [NSCriticalRequest](https://developer.apple.com/documentation/appkit/nsrequestuserattentiontype/nscriticalrequest) level instead. To explicitly use `NSInformationalRequest` to cause a single dock icon bounce, it is still possible to use [`dock.bounce('informational')`](https://www.electronjs.org/docs/latest/api/dock#dockbouncetype-macos).

## End of Support for 28.x.y

Electron 28.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E31 (Jun'24) | E32 (Aug'24) | E33 (Oct'24) |
| ------------ | ------------ | ------------ |
| 31.x.y       | 32.x.y       | 33.x.y       |
| 30.x.y       | 31.x.y       | 32.x.y       |
| 28.x.y       | 29.x.y       | 31.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

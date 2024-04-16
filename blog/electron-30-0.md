---
title: Electron 30.0.0
date: 2024-04-16T00:00:00.000Z
authors:
  - name: clavin
    url: 'https://github.com/clavin'
    image_url: 'https://github.com/clavin.png?size=96'
  - name: VerteDinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-30-0
---

Electron 30.0.0 has been released! It includes upgrades to Chromium `124.0.6367.49`, V8 `12.4`, and Node.js `20.11.1`.

---

The Electron team is excited to announce the release of Electron 30.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- ASAR Integrity fuse now supported on Windows ([#40504](https://github.com/electron/electron/pull/40504))
  - Existing apps with ASAR Integrity enabled may not work on Windows if not configured correctly. Apps using Electron packaging tools should upgrade to `@electron/packager@18.3.1` or `@electron/forge@7.4.0`.
  - Take a look at our [ASAR Integrity tutorial](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) for more information.
- Added [`WebContentsView`](https://www.electronjs.org/docs/latest/api/web-contents-view) and [`BaseWindow`](https://www.electronjs.org/docs/latest/api/base-window) main process modules, deprecating & replacing `BrowserView` ([#35658](https://github.com/electron/electron/pull/35658))
  - See [our Web Embeds documentation](https://www.electronjs.org/docs/latest/tutorial/web-embeds) for a comparison of the new `WebContentsView` API to other similar APIs.
- Added [`net`](https://www.electronjs.org/docs/latest/api/net) module to utility process ([#40017](https://github.com/electron/electron/pull/40017))
- Implemented support for the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) ([#41827](https://github.com/electron/electron/commit/cf1087badd437906f280373decb923733a8523e6))

### Stack Changes

- Chromium `124.0.6367.49`
  - New in [Chrome 124](https://developer.chrome.com/blog/new-in-chrome-124/) and in [DevTools 124](https://developer.chrome.com/blog/new-in-devtools-124/)
  - New in [Chrome 123](https://developer.chrome.com/blog/new-in-chrome-123/) and in [DevTools 123](https://developer.chrome.com/blog/new-in-devtools-123/)
- Node `20.11.1`
  - [Node 20.11.1 notes](https://nodejs.org/en/blog/release/v20.11.1/)
- V8 `12.4`

Electron 29 upgrades Chromium from `122.0.6261.39` to `124.0.6367.49`, Node from `20.9.0` to `20.11.1`, and V8 from `12.2` to `12.4`.

### Breaking Changes

#### Behavior Changed: cross-origin iframes now use Permission Policy to access features

Cross-origin iframes must now specify features available to a given `iframe` via the `allow`
attribute in order to access them.

See [documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allow) for
more information.

#### Removed: The `--disable-color-correct-rendering` command line switch

This switch was never formally documented but its removal is being noted here regardless. Chromium itself now has better support for color spaces so this flag should not be needed.

#### Behavior Changed: `BrowserView.setAutoResize` behavior on macOS

In Electron 30, BrowserView is now a wrapper around the new [WebContentsView](https://www.electronjs.org/docs/latest/api/web-contents-view) API.

Previously, the `setAutoResize` function of the `BrowserView` API was backed by [autoresizing](https://developer.apple.com/documentation/appkit/nsview/1483281-autoresizingmask?language=objc) on macOS, and by a custom algorithm on Windows and Linux.
For simple use cases such as making a BrowserView fill the entire window, the behavior of these two approaches was identical.
However, in more advanced cases, BrowserViews would be autoresized differently on macOS than they would be on other platforms, as the custom resizing algorithm for Windows and Linux did not perfectly match the behavior of macOS's autoresizing API.
The autoresizing behavior is now standardized across all platforms.

If your app uses `BrowserView.setAutoResize` to do anything more complex than making a BrowserView fill the entire window, it's likely you already had custom logic in place to handle this difference in behavior on macOS.
If so, that logic will no longer be needed in Electron 30 as autoresizing behavior is consistent.

#### Removed: `params.inputFormType` property on `context-menu` on `WebContents`

The `inputFormType` property of the params object in the `context-menu`
event from `WebContents` has been removed. Use the new `formControlType`
property instead.

#### Removed: `process.getIOCounters()`

Chromium has removed access to this information.

## End of Support for 27.x.y

Electron 27.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E30 (Apr'24) | E31 (Jun'24) | E32 (Aug'24) |
| ------------ | ------------ | ------------ |
| 30.x.y       | 31.x.y       | 32.x.y       |
| 29.x.y       | 30.x.y       | 31.x.y       |
| 28.x.y       | 29.x.y       | 30.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

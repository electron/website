---
title: Electron 33.0.0
date: 2024-10-14T00:00:00.000Z
authors: ckerr
slug: electron-33-0
tags: [release]
---

Electron 33.0.0 has been released! It includes upgrades to Chromium 130.0.6723.44, V8 13.0, and Node 20.18.0.

---

The Electron team is excited to announce the release of Electron 33.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Highlights

- Added a handler, `app.setClientCertRequestPasswordHandler(handler)`, to help unlock cryptographic devices when a PIN is needed. [#41205](https://github.com/electron/electron/pull/41205)
- Extended `navigationHistory` API with 2 new functions for better history management. [#42014](https://github.com/electron/electron/pull/42014)
- Improved native theme transparency checking. [#42862](https://github.com/electron/electron/pull/42862)

### Stack Changes

- Chromium `130.0.6723.44`
  - [New in 130](https://developer.chrome.com/blog/new-in-chrome-130/)
  - [New in 129](https://developer.chrome.com/blog/new-in-chrome-129/)
- Node `20.18.0`
  - [Node 20.18.0 blog post](https://nodejs.org/en/blog/release/v20.18.0/)
  - [Node 20.17.0 blog post](https://nodejs.org/en/blog/release/v20.17.0/)
- V8 `13.0`

Electron 33 upgrades Chromium from `128.0.6613.36` to `130.0.6723.44`, Node from `20.16.0` to `20.18.0`, and V8 from `12.8` to `13.0`.

### New Features

- Added a handler, `app.setClientCertRequestPasswordHandler(handler)`, to help unlock cryptographic devices when a PIN is needed. [#41205](https://github.com/electron/electron/pull/41205)
- Added error event in utility process to support diagnostic reports on V8 fatal errors. [#43997](https://github.com/electron/electron/pull/43997)
- Added `View.setBorderRadius(radius)` for customizing the border radius of views—with compatibility for `WebContentsView`. [#42320](https://github.com/electron/electron/pull/42320)
- Extended `navigationHistory` API with 2 new functions for better history management. [#42014](https://github.com/electron/electron/pull/42014)

### Breaking Changes

#### Removed: macOS 10.15 support

macOS 10.15 (Catalina) is no longer supported by [Chromium](https://chromium-review.googlesource.com/c/chromium/src/+/5734361).

Older versions of Electron will continue to run on Catalina, but macOS 11 (Big Sur)
or later will be required to run Electron v33.0.0 and higher.

#### Behavior Changed: custom protocol URL handling on Windows

Due to changes made in Chromium to support [Non-Special Scheme URLs](http://bit.ly/url-non-special), custom protocol URLs that use Windows file paths will no longer work correctly with the deprecated `protocol.registerFileProtocol` and the `baseURLForDataURL` property on `BrowserWindow.loadURL`, `WebContents.loadURL`, and `<webview>.loadURL`. `protocol.handle` will also not work with these types of URLs but this is not a change since it has always worked that way.

```js
// No longer works
protocol.registerFileProtocol('other', () => {
  callback({ filePath: '/path/to/my/file' });
});

const mainWindow = new BrowserWindow();
mainWindow.loadURL(
  'data:text/html,<script src="loaded-from-dataurl.js"></script>',
  { baseURLForDataURL: 'other://C:\\myapp' }
);
mainWindow.loadURL('other://C:\\myapp\\index.html');

// Replace with
const path = require('node:path');
const nodeUrl = require('node:url');
protocol.handle(other, (req) => {
  const srcPath = 'C:\\myapp\\';
  const reqURL = new URL(req.url);
  return net.fetch(
    nodeUrl.pathToFileURL(path.join(srcPath, reqURL.pathname)).toString()
  );
});

mainWindow.loadURL(
  'data:text/html,<script src="loaded-from-dataurl.js"></script>',
  { baseURLForDataURL: 'other://' }
);
mainWindow.loadURL('other://index.html');
```

#### Behavior Changed: `webContents` property on `login` on `app`

The `webContents` property in the `login` event from `app` will be `null`
when the event is triggered for requests from the [utility process](https://www.electronjs.org/docs/latest/api/utility-process)
created with `respondToAuthRequestsFromMainProcess` option.

#### Deprecated: `textured` option in `BrowserWindowConstructorOption.type`

The `textured` option of `type` in `BrowserWindowConstructorOptions` has been deprecated with no replacement. This option relied on the [`NSWindowStyleMaskTexturedBackground`](https://developer.apple.com/documentation/appkit/nswindowstylemask/nswindowstylemasktexturedbackground) style mask on macOS, which has been deprecated with no alternative.

#### Deprecated: `systemPreferences.accessibilityDisplayShouldReduceTransparency`

The `systemPreferences.accessibilityDisplayShouldReduceTransparency` property is now deprecated in favor of the new `nativeTheme.prefersReducedTransparency`, which provides identical information and works cross-platform.

```js
// Deprecated
const shouldReduceTransparency =
  systemPreferences.accessibilityDisplayShouldReduceTransparency;

// Replace with:
const prefersReducedTransparency = nativeTheme.prefersReducedTransparency;
```

## End of Support for 30.x.y

Electron 30.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E33 (Oct'24) | E34 (Jan'25) | E35 (Apr'25) |
| ------------ | ------------ | ------------ |
| 33.x.y       | 34.x.y       | 35.x.y       |
| 32.x.y       | 33.x.y       | 34.x.y       |
| 31.x.y       | 32.x.y       | 33.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

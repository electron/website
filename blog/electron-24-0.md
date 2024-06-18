---
title: Electron 24.0.0
date: 2023-04-04T00:00:00.000Z
authors:
  - name: georgexu99
    url: 'https://github.com/georgexu99'
    image_url: 'https://github.com/georgexu99.png?size=96'
slug: electron-24-0
tags: [release]
---

Electron 24.0.0 has been released! It includes upgrades to Chromium `112.0.5615.49`, V8 `11.2`, and Node.js `18.14.0`. Read below for more details!

<!-- truncate -->

---

The Electron team is excited to announce the release of Electron 24.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `112.0.5615.49`
  - [New in Chrome 112](https://developer.chrome.com/blog/new-in-chrome-112/)
  - [New in Chrome 111](https://developer.chrome.com/blog/new-in-chrome-111/)
  - [New in DevTools 112](https://developer.chrome.com/blog/new-in-devtools-112/)
  - [New in DevTools 111](https://developer.chrome.com/blog/new-in-devtools-111/)
- Node.js `18.14.0`
  - [Node 18.14.0 blog post](https://nodejs.org/en/blog/release/v18.14.0/)
- V8 `11.2`

### Breaking Changes

#### API Changed: `nativeImage.createThumbnailFromPath(path, size)`

The `maxSize` parameter has been changed to `size` to reflect that the size passed in will be the size the thumbnail created. Previously, Windows would not scale the image up if it were smaller than `maxSize`, and macOS would always set the size to `maxSize`. Behavior is now the same across platforms.

```js
// a 128x128 image.
const imagePath = path.join('path', 'to', 'capybara.png');

// Scaling up a smaller image.
const upSize = { width: 256, height: 256 };
nativeImage.createThumbnailFromPath(imagePath, upSize).then((result) => {
  console.log(result.getSize()); // { width: 256, height: 256 }
});

// Scaling down a larger image.
const downSize = { width: 64, height: 64 };
nativeImage.createThumbnailFromPath(imagePath, downSize).then((result) => {
  console.log(result.getSize()); // { width: 64, height: 64 }
});
```

### New Features

- Added the ability to filter `HttpOnly` cookies with `cookies.get()`. [#37365](https://github.com/electron/electron/pull/37365)
- Added `logUsage` to `shell.openExternal()` options, which allows passing the `SEE_MASK_FLAG_LOG_USAGE` flag to `ShellExecuteEx` on Windows. The `SEE_MASK_FLAG_LOG_USAGE` flag indicates a user initiated launch that enables tracking of frequently used programs and other behaviors. [#37291](https://github.com/electron/electron/pull/37291)
- Added `types` to the `webRequest` filter, adding the ability to filter the requests you listen to.[#37427](https://github.com/electron/electron/pull/37427)
- Added a new `devtools-open-url` event to `webContents` to allow developers to open new windows with them. [#36774](https://github.com/electron/electron/pull/36774)
- Added several standard page size options to `webContents.print()`. [#37265](https://github.com/electron/electron/pull/37265)
- Added the `enableLocalEcho` flag to the session handler `ses.setDisplayMediaRequestHandler()` callback for allowing remote audio input to be echoed in the local output stream when `audio` is a `WebFrameMain`. [#37528](https://github.com/electron/electron/pull/37528)
- Allow an application-specific username to be passed to `inAppPurchase.purchaseProduct()`. [#35902](https://github.com/electron/electron/pull/35902)
- Exposed `window.invalidateShadow()` to clear residual visual artifacts on macOS. [#32452](https://github.com/electron/electron/pull/32452)
- Whole-program optimization is now enabled by default in electron node headers config file, allowing the compiler to perform opimizations with information from all modules in a program as opposed to a per-module (compiland) basis. [#36937](https://github.com/electron/electron/pull/36937)
- `SystemPreferences::CanPromptTouchID` (macOS) now supports Apple Watch. [#36935](https://github.com/electron/electron/pull/36935)

## End of Support for 21.x.y

Electron 21.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

As noted in [Farewell, Windows 7/8/8.1](https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice), Electron 22's (Chromium 108) planned end of life date will be extended from May 30, 2023 to October 10, 2023. The Electron team will continue to backport any security fixes that are part of this program to Electron 22 until October 10, 2023.

| E24 (Apr'23) | E25 (May'23) | E26 (Aug'23) |
| ------------ | ------------ | ------------ |
| 24.x.y       | 25.x.y       | 26.x.y       |
| 23.x.y       | 24.x.y       | 25.x.y       |
| 22.x.y       | 23.x.y       | 24.x.y       |
| --           | 22.x.y       | 22.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

---
title: Electron 39.0.0
date: 2025-10-28T00:00:00.000Z
authors:
  - ckerr
slug: electron-39-0
tags: [release]
---

Electron 39.0.0 has been released! It includes upgrades to Chromium 142.0.7444.52, V8 14.2, and Node 22.20.0.

---

The Electron team is excited to announce the release of Electron 39.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `142.0.7444.52`
  - [New in 142](https://developer.chrome.com/blog/new-in-chrome-142)
  - [New in 141](https://developer.chrome.com/blog/new-in-chrome-141)
- Node `22.22.0`
  - [v22.20.0 Announcement](https://nodejs.org/en/blog/release/v22.20.0)
  - [v22.19.0 Announcement](https://nodejs.org/en/blog/release/v22.19.0)
- V8 `14.0`
  - [V8 roll increment](https://chromium.googlesource.com/v8/v8.git/+/bb294624702efbb17691b642333f06bf5108e600)

Electron 39 upgrades Chromium from `140.0.7339.41` to `142.0.7444.52`, Node.js from `22.18.0` to `v22.20.0`, and V8 from `14.0` to `14.2`.

### ASAR Integrity graduates to stable

A long-standing "experimental" feature -- ASAR integrity -- is now stable in Electron 39. When you enable this feature, it validates your packaged `app.asar` at runtime against a build-time hash to detect any tampering. If no hash is present or if there is a mismatch in the hashes, the app will forcefully terminate.

See [the ASAR integrity documentation](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) for full information on how on the feature works, on how to use it in your application, and how to use it in Electron Forge and Electron Packager.

In related news, [Electron Packager](https://github.com/electron/packager) v19 now enables ASAR by default. [#1841](https://github.com/electron/packager/pull/1841)

### New Features and Improvements

- Added `app.isHardwareAccelerationEnabled()`. [#48680](https://github.com/electron/electron/pull/48680)
- Added `RGBAF16` output format with scRGB HDR color space support to Offscreen Rendering. [#48504](https://github.com/electron/electron/pull/48504)
- Added methods to enable more granular accessibility support management. [#48625](https://github.com/electron/electron/pull/48625)
- Added support for `USBDevice.configurations`. [#47459](https://github.com/electron/electron/pull/47459)
- Added the ability to retrieve the system accent color on Linux using `systemPreferences.getAccentColor`. [#48628](https://github.com/electron/electron/pull/48628)
- Allowed for persisting File System API grant status within a given session. [#48326](https://github.com/electron/electron/pull/48326) <sup>(Also in [37](https://github.com/electron/electron/pull/48328), [38](https://github.com/electron/electron/pull/48327))</sup>
- Support dynamic ESM imports in non-context isolated preloads. [#48488](https://github.com/electron/electron/pull/48488) <sup>(Also in [37](https://github.com/electron/electron/pull/48487), [38](https://github.com/electron/electron/pull/48489))</sup>
- Marked the [ASAR integrity](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) feature as stable. It had previously been experimental. [#48434](https://github.com/electron/electron/pull/48434)

### Breaking Changes

#### Deprecated: `--host-rules` command line switch

Chromium is deprecating the `--host-rules` switch.

You should use `--host-resolver-rules` instead.

#### Behavior Changed: `window.open` popups are always resizable

Per current [WHATWG spec](https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-open-dev), the `window.open` API will now always create a resizable popup window.

To restore previous behavior:

```js
webContents.setWindowOpenHandler((details) => {
  return {
    action: 'allow',
    overrideBrowserWindowOptions: {
      resizable: details.features.includes('resizable=yes'),
    },
  };
});
```

#### Behavior Changed: shared texture OSR `paint` event data structure

When using the shared texture offscreen rendering feature, the `paint` event now emits a more structured object.
It moves the `sharedTextureHandle`, `planes`, `modifier` into a unified `handle` property.
See [here](https://www.electronjs.org/docs/latest/api/structures/offscreen-shared-texture) for more details.

## End of Support for 36.x.y

Electron 36.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E39 (Oct'25) | E40 (Jan'26) | E41 (Feb'26) |
| ------------ | ------------ | ------------ |
| 39.x.y       | 40.x.y       | 41.x.y       |
| 38.x.y       | 39.x.y       | 40.x.y       |
| 37.x.y       | 38.x.y       | 39.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

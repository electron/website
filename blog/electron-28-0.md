---
title: Electron 28.0.0
date: 2023-11-28T00:00:00.000Z
authors:
  - name: ckerr
    url: 'https://github.com/ckerr'
    image_url: 'https://github.com/ckerr.png?size=96'
slug: electron-28-0
---

Electron 28.0.0 has been released! It includes upgrades to Chromium `120.0.6099.56`, V8 `12.0`, and Node.js `18.18.2`.

---

The Electron team is excited to announce the release of Electron 28.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

## Highlights

- Implemented support for ECMAScript modules or ESM (What are ECMAScript modules? [learn more here](https://nodejs.org/api/esm.html#modules-ecmascript-modules). This includes support for ESM in Electron proper, as well as areas such as the `UtilityProcess` API entrypoints. See [#37535](https://github.com/electron/electron/pull/37535). and [#40047](https://github.com/electron/electron/pull/40047) for more details
- In addition to enabling ESM support in Electron itself, Electron Forge also supports using ESM to package, build and develop Electron applications. You can find this support in [Forge v7.0.0](https://github.com/electron/forge/releases/tag/v7.0.0) or higher.

### Stack Changes

- Chromium `120.0.6099.56`
  - New in [Chrome 119](https://developer.chrome.com/blog/new-in-chrome-119/) and in [DevTools 119](https://developer.chrome.com/blog/new-in-devtools-119/)
  - New in [Chrome 120](https://developer.chrome.com/blog/new-in-chrome-120/) and in [DevTools 120](https://developer.chrome.com/blog/new-in-devtools-120/)
- Node `18.18.2`
  - [Node 18.18.0 notes](https://nodejs.org/en/blog/release/v18.18.0/)
  - [Node 18.18.1 notes](https://nodejs.org/en/blog/release/v18.18.1/)
  - [Node 18.18.2 notes](https://nodejs.org/en/blog/release/v18.18.2/)
- V8 `12.0`

### New Features

- Enabled ESM support. [#37535](https://github.com/electron/electron/pull/37535)
  - For more details, see the [ESM documentation](https://github.com/electron/electron/blob/main/docs/tutorial/esm.md).
- Added ESM entrypoints to the `UtilityProcess` API. [#40047](https://github.com/electron/electron/pull/40047)
- Added several properties to the `display` object including `detected`, `maximumCursorSize`, and `nativeOrigin`. [#40554](https://github.com/electron/electron/pull/40554)
- Added support for `ELECTRON_OZONE_PLATFORM_HINT` environment variable on Linux. [#39792](https://github.com/electron/electron/pull/39792)

### Breaking Changes

#### Behavior Changed: `WebContents.backgroundThrottling` set to false affects all `WebContents` in the host `BrowserWindow`

`WebContents.backgroundThrottling` set to false will disable frames throttling
in the `BrowserWindow` for all `WebContents` displayed by it.

#### Removed: `BrowserWindow.setTrafficLightPosition(position)`

`BrowserWindow.setTrafficLightPosition(position)` has been removed, the
`BrowserWindow.setWindowButtonPosition(position)` API should be used instead
which accepts `null` instead of `{ x: 0, y: 0 }` to reset the position to
system default.

```js
// Removed in Electron 28
win.setTrafficLightPosition({ x: 10, y: 10 });
win.setTrafficLightPosition({ x: 0, y: 0 });

// Replace with
win.setWindowButtonPosition({ x: 10, y: 10 });
win.setWindowButtonPosition(null);
```

#### Removed: `BrowserWindow.getTrafficLightPosition()`

`BrowserWindow.getTrafficLightPosition()` has been removed, the
`BrowserWindow.getWindowButtonPosition()` API should be used instead
which returns `null` instead of `{ x: 0, y: 0 }` when there is no custom
position.

```js
// Removed in Electron 28
const pos = win.getTrafficLightPosition();
if (pos.x === 0 && pos.y === 0) {
  // No custom position.
}

// Replace with
const ret = win.getWindowButtonPosition();
if (ret === null) {
  // No custom position.
}
```

#### Removed: `ipcRenderer.sendTo()`

The `ipcRenderer.sendTo()` API has been removed. It should be replaced by setting up a [`MessageChannel`](tutorial/message-ports.md#setting-up-a-messagechannel-between-two-renderers) between the renderers.

The `senderId` and `senderIsMainFrame` properties of `IpcRendererEvent` have been removed as well.

#### Removed: `app.runningUnderRosettaTranslation`

The `app.runningUnderRosettaTranslation` property has been removed.
Use `app.runningUnderARM64Translation` instead.

```js
// Removed
console.log(app.runningUnderRosettaTranslation);
// Replace with
console.log(app.runningUnderARM64Translation);
```

## End of Support for 25.x.y

Electron 25.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E28 (Dec'23) | E29 (Feb'24) | E30 (Apr'24) |
| ------------ | ------------ | ------------ |
| 28.x.y       | 29.x.y       | 30.x.y       |
| 27.x.y       | 28.x.y       | 29.x.y       |
| 26.x.y       | 27.x.y       | 28.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

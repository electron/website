---
title: Electron 28.0.0
date: 2023-12-06T00:00:00.000Z
authors:
  - name: ckerr
    url: 'https://github.com/ckerr'
    image_url: 'https://github.com/ckerr.png?size=96'
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: electron-28-0
---

Electron 28.0.0 has been released! It includes upgrades to Chromium `120.0.5993.32`, V8 `11.8`, and Node.js `18.17.1`.

---

The Electron team is excited to announce the release of Electron 28.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Twitter](https://twitter.com/electronjs) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

- Chromium `120.x`
  - [New in Chrome 118](https://developer.chrome.com/blog/new-in-chrome-118/)
  - [New in DevTools 118](https://developer.chrome.com/blog/new-in-devtools-118/)
- Node.js `18.x`
  - [Node 18.17.1 blog post](https://nodejs.org/en/blog/release/v18.17.1/)
  - [Node 18.17.0 blog post](https://nodejs.org/en/blog/release/v18.17.0/)
- V8 `11.8`

### Breaking Changes

### Behavior Changed: `WebContents.backgroundThrottling` set to false affects all `WebContents` in the host `BrowserWindow`

`WebContents.backgroundThrottling` set to false will disable frames throttling
in the `BrowserWindow` for all `WebContents` displayed by it.

### Removed: `BrowserWindow.setTrafficLightPosition(position)`

`BrowserWindow.setTrafficLightPosition(position)` has been removed, the
`BrowserWindow.setWindowButtonPosition(position)` API should be used instead
which accepts `null` instead of `{ x: 0, y: 0 }` to reset the position to
system default.

```js
// Removed
win.setTrafficLightPosition({ x: 10, y: 10 })
win.setTrafficLightPosition({ x: 0, y: 0 })

// Replace with
win.setWindowButtonPosition({ x: 10, y: 10 })
win.setWindowButtonPosition(null)
```

### Removed: `BrowserWindow.getTrafficLightPosition()`

`BrowserWindow.getTrafficLightPosition()` has been removed, the
`BrowserWindow.getWindowButtonPosition()` API should be used instead
which returns `null` instead of `{ x: 0, y: 0 }` when there is no custom
position.

```js
// Removed
const pos = win.getTrafficLightPosition()
if (pos.x === 0 && pos.y === 0) {
  // No custom position.
}

// Replace with
const ret = win.getWindowButtonPosition()
if (ret === null) {
  // No custom position.
}
```

### Removed: `ipcRenderer.sendTo()`

The `ipcRenderer.sendTo()` API has been removed. It should be replaced by setting up a [`MessageChannel`](tutorial/message-ports.md#setting-up-a-messagechannel-between-two-renderers) between the renderers.

The `senderId` and `senderIsMainFrame` properties of `IpcRendererEvent` have been removed as well.

### Removed: `app.runningUnderRosettaTranslation`

The `app.runningUnderRosettaTranslation` property has been removed.
Use `app.runningUnderARM64Translation` instead.

```js
// Removed
console.log(app.runningUnderRosettaTranslation)

// Replace with
console.log(app.runningUnderARM64Translation)
```

### Deprecated: `renderer-process-crashed` event on `app`

The `renderer-process-crashed` event on `app` has been deprecated.
Use the new `render-process-gone` event instead.

```js
// Deprecated
app.on('renderer-process-crashed', (event, webContents, killed) => { /* ... */ })

// Replace with
app.on('render-process-gone', (event, webContents, details) => { /* ... */ })
```

### Deprecated: `params.inputFormType` property on `context-menu` on `WebContents`

The `inputFormType` property of the params object in the `context-menu`
event from `WebContents` has been deprecated. Use the new `formControlType`
property instead.

```js
// Removed
window.addEventListener('contextmenu', (e) => {
  console.log(e.params.inputFormType)
})

// Replace with
window.addEventListener('contextmenu', (e) => {
  console.log(e.params.formControlType)
})
```


### Deprecated: `crashed` event on `WebContents` and `<webview>`

The `crashed` events on `WebContents` and `<webview>` have been deprecated.
Use the new `render-process-gone` event instead.

```js
// Deprecated
win.webContents.on('crashed', (event, killed) => { /* ... */ })
webview.addEventListener('crashed', (event) => { /* ... */ })

// Replace with
win.webContents.on('render-process-gone', (event, details) => { /* ... */ })
webview.addEventListener('render-process-gone', (event) => { /* ... */ })
```

### Deprecated: `gpu-process-crashed` event on `app`

The `gpu-process-crashed` event on `app` has been deprecated.
Use the new `child-process-gone` event instead.

```js
// Deprecated
app.on('gpu-process-crashed', (event, killed) => { /* ... */ })

// Replace with
app.on('child-process-gone', (event, details) => { /* ... */ })
```

### New Features

- TBD: ADD

## End of Support for 25.x.y

Electron 25.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E28 (Dec'23) | E29 (Feb'24) | E30 (May'24) |
| ------------ | ------------ | ------------ |
| 28.x.y       | 29.x.y       | 30.x.y       |
| 27.x.y       | 38.x.y       | 29.x.y       |
| 26.x.y       | 27.x.y       | 28.x.y       |


## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

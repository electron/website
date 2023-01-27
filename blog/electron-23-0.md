---
title: Electron 23.0.0
date: 2022-1-29T00:00:00.000Z
authors:
    - name: VerteDinde
      url: 'https://github.com/VerteDinde'
      image_url: 'https://github.com/vertedinde.png?size=96'
    - name: georgexu99
      url: 'https://github.com/georgexu99'
      image_url: 'https://github.com/georgexu99.png?size=96'
slug: electron-23-0

---

# QUIP DOC FOR RELEASE NOTES https://corp.quip.com/LOJlA4W58dfC/v23-electron-release-notes
Electron 23.0.0 has been released! It includes a new utility process API, updates for Windows 7/8/8.1 support, and upgrades to Chromium `110`, V8 `10.8`, and Node.js `18.12.1`. Read below for more details!

---

The Electron team is excited to announce the release of Electron 23.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/releases/stable). Continue reading for details about this release.

If you have any feedback, please share it with us on Twitter, or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Stack Changes

* Chromium `110`
    * [New in Chrome 110](https://developer.chrome.com/blog/new-in-chrome-110/)
    * [New in Chrome 109](https://developer.chrome.com/blog/new-in-chrome-109/)
    * [New in DevTools 110](https://developer.chrome.com/blog/new-in-devtools-110/)
    * [New in DevTools 109](https://developer.chrome.com/blog/new-in-devtools-109/)
* Node.js `18.12.1`
    * [Node 18.12.1 blog post](https://nodejs.org/en/blog/release/v18.12.1/)
* V8 `11.0`

### Highlighted Features


### `serial-port-revoked` event [#36062](https://github.com/electron/electron/pull/36062)

Added support for serialPort.forget() as well as a new event `serial-port-revoked` emitted when a given origin is revoked.

This event can be used to help maintain persistent storage of permissions when `setDevicePermissionHandler` is used.

```js
// Browser Process
const { app, BrowserWindow } = require('electron')
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })
  win.webContents.session.on('serial-port-revoked', (event, details) => {
    console.log(`Access revoked for serial device from origin ${details.origin}`)
  })
})
```
```js
// Renderer Process
const portConnect = async () => {
  // Request a port.
  const port = await navigator.serial.requestPort()
  // Wait for the serial port to open.
  await port.open({ baudRate: 9600 })
  // ...later, revoke access to the serial port.
  await port.forget()
}
```


## Windows 7/8/8.1 Support Update

Electron 23 no longer supports Windows 7/8/8.1. Electron follows the planned Chromium deprecation policy, which will [deprecate Windows 7/8/8.1 , as well as Windows Server 2012 and 2012 R2 support in Chromium 109 (read more here)](https://support.google.com/chrome/thread/185534985/sunsetting-support-for-windows-7-8-8-1-in-early-2023?hl=en).

#### Additional Highlighted Changes 

## Breaking API Changes

Below are breaking changes introduced in Electron 23. You can read more about these changes and future changes on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

#### Removed: `BrowserWindow scroll-touch-* events`

The deprecated scroll-touch-begin, scroll-touch-end and scroll-touch-edge events on BrowserWindow have been removed. Instead, use the newly available input-event event on WebContents.

```diff
// Removed in Electron 23.0
-win.on('scroll-touch-begin', scrollTouchBegin)
-win.on('scroll-touch-edge', scrollTouchEdge)
-win.on('scroll-touch-end', scrollTouchEnd)

// Replace with
+win.webContents.on('input-event', (_, event) => {
+  if (event.type === 'gestureScrollBegin') {
+    scrollTouchBegin()
+  } else if (event.type === 'gestureScrollUpdate') +{
+    scrollTouchEdge()
+  } else if (event.type === 'gestureScrollEnd') {
+    scrollTouchEnd()
+  }
+})
```

## End of Support for 20.x.y

Electron 20.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E19 (May'22) | E20 (Aug'22) | E21 (Sep'22) | E22 (Nov'22) | E23 (Jan'23) | E24 (Mar'23) |
| ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       | 23.x.y       | 24.x.y       |
| 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       | 23.x.y       
| 17.x.y       | 18.x.y       | 19.x.y       | 20.x.y       | 21.x.y       | 22.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

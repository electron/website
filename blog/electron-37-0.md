---
title: Electron 37.0.0
date: 2025-06-24T00:00:00.000Z
authors:
  - georgexu99
  - VerteDinde
slug: electron-37-0
tags: [release]
---

Electron 37.0.0 has been released! It includes upgrades to Chromium 138, V8 13.8, and Node 22.16.0.

---

The Electron team is excited to announce the release of Electron 37.0.0! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

## Notable Changes

### Smooth Corners: Native CSS Squircles

![An image showing different corner smoothing values (0%, 30%, 60%, and 100%) applied to rectangles, with 60% labeled as matching macOS style](/assets/img/corner-smoothing.svg)

Electron 37 introduces the custom `-electron-corner-smoothing` CSS property, which allows apps to create smoother rounded corners to match Apple's macOS design language. This feature originally landed in Electron 36, but we felt like it deserved a brighter spotlight.

<table>
<caption>
Example with 100% Corner Smoothing
</caption>
<thead>
<tr>
<th>Code</th>
<th>Result</th>
</tr>
</thead>
<tbody>
<tr>
<td>

```css
.box {
  width: 128px;
  height: 128px;
  border-radius: 24px;
  -electron-corner-smoothing: 100%;
}
```

</td>
<td>
<img src="https://raw.githubusercontent.com/electron/rfcs/d89000c638a6d98b497ce2fbea07bce45c2760a8/images/0012/Rectangle.svg" width="128px" alt="" />
</td>
</tr>
</tbody>
</table>

Unlike the standard `border-radius` property, which carves quarter-circle corners out of a rectangle, `-electron-corner-smoothing` smoothly transitions
the curve into a [**squircle**](https://en.wikipedia.org/wiki/Squircle) shape with a continuous perimeter.

You can adjust the smoothness using values from 0% to 100%, or use the `system-ui` value to match the operating system's style (60% on macOS and 0% otherwise).
This design enhancement can be applied on borders, outlines, and shadows, giving your app a subtle layer of polish.

> [!TIP]
> Read more about Electron's squircle implementation in [@clavin](https://github.com/clavin)'s [RFC 0012](https://github.com/electron/rfcs/blob/main/text/0012-corner-smoothing.md).
> The document goes over the motivation and technical implementation in more detail.
>
> The initial design drew inspiration from Figma's corner smoothing implementation. Read more about their own quest for smooth corners in
> ["Desperately seeking squircles"](https://www.figma.com/blog/desperately-seeking-squircles/).

### Stack Changes

- Chromium `138.0.7204.35`
  - [New in 138](https://developer.chrome.com/blog/new-in-chrome-138/)
  - [New in 137](https://developer.chrome.com/blog/new-in-chrome-137/)
- Node `22.16.0`
  - [Node 22.16.0 blog post](https://nodejs.org/en/blog/release/v22.16.0/)
- V8 `13.8`

Electron 37 upgrades Chromium from `136.0.7103.48` to `138.0.7204.35`, and V8 from `13.6` to `13.8`.

## Google Summer of Code Begins

Our two [Google Summer of Code](https://summerofcode.withgoogle.com/) contributors have started the
program's coding period!

- [@nilayarya](https://github.com/nilayarya) is crafting a new [Save/Restore Window State API](https://github.com/electron/rfcs/pull/16/) in Electron core. The new APIs will provide a built-in, standardized way
  to handle window state persistence. See Nilay's in-progress RFC at [electron/rfcs#16](https://github.com/electron/rfcs/pull/16).
- [@hitarth-gg](https://github.com/hitarth-gg) is hard at work modernizing the long-dormant [Devtron](https://github.com/electron-userland/devtron) extension using Chrome Manifest V3 APIs.
  This project will provide tooling for developers to debug IPC communication, track event listeners, and visualize module dependencies in their Electron applications.

It has been an exciting couple of weeks for our GSOC participants, so stay tuned for more updates!

### New Features and Improvements

- Added `innerWidth` and `innerHeight` options for `window.open`. [#47039](https://github.com/electron/electron/pull/47039) (Also in [35](https://github.com/electron/electron/pull/47045), [36](https://github.com/electron/electron/pull/47038))
- Added `before-mouse-event` to allow intercepting and preventing mouse events in `webContents`. [#47364](https://github.com/electron/electron/pull/47364) (Also in [36](https://github.com/electron/electron/pull/47365))
- Added `scriptURL` property to `ServiceWorkerMain`. [#45863](https://github.com/electron/electron/pull/45863)
- Added `sublabel` functionality for menus on macOS >= 14.4. [#47042](https://github.com/electron/electron/pull/47042) (Also in [35](https://github.com/electron/electron/pull/47041), [36](https://github.com/electron/electron/pull/47040))
- Added support for `HIDDevice.collections`. [#47483](https://github.com/electron/electron/pull/47483) (Also in [36](https://github.com/electron/electron/pull/47484))
- Added support for `--no-experimental-global-navigator` flag. [#47418](https://github.com/electron/electron/pull/47418) (Also in [35](https://github.com/electron/electron/pull/47416), [36](https://github.com/electron/electron/pull/47417))
- Added support for `screen.dipToScreenPoint(point)` and `screen.screenToDipPoint(point)` on Linux X11. [#46895](https://github.com/electron/electron/pull/46895) (Also in [35](https://github.com/electron/electron/pull/47124), [36](https://github.com/electron/electron/pull/47125))
- Added support for menu item role `palette` and `header` on macOS. [#47245](https://github.com/electron/electron/pull/47245)
- Added support for node option `--experimental-network-inspection`. [#47031](https://github.com/electron/electron/pull/47031) (Also in [35](https://github.com/electron/electron/pull/47029), [36](https://github.com/electron/electron/pull/47030))
- Exposed `win.isContentProtected()` to allow developers to check window protection status. [#47310](https://github.com/electron/electron/pull/47310) (Also in [36](https://github.com/electron/electron/pull/47311))

### Breaking Changes

### Utility Process unhandled rejection behavior change

Utility Processes will now warn with an error message when an unhandled
rejection occurs instead of crashing the process.

To restore the previous behavior, you can use:

```js
process.on('unhandledRejection', () => {
  process.exit(1);
});
```

### Behavior Changed: `process.exit()` kills utility process synchronously

Calling `process.exit()` in a utility process will now kill the utility process synchronously.
This brings the behavior of `process.exit()` in line with Node.js behavior.

Please refer to the
[Node.js docs](https://nodejs.org/docs/latest-v22.x/api/process.html#processexitcode) and
[PR #45690](https://github.com/electron/electron/pull/45690) to understand the potential
implications of that, e.g., when calling `console.log()` before `process.exit()`.

### Behavior Changed: WebUSB and WebSerial Blocklist Support

[WebUSB](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) and [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) now support the [WebUSB Blocklist](https://wicg.github.io/webusb/#blocklist) and [Web Serial Blocklist](https://wicg.github.io/serial/#blocklist) used by Chromium and outlined in their respective specifications.

To disable these, users can pass `disable-usb-blocklist` and `disable-serial-blocklist` as command line flags.

### Removed: `null` value for `session` property in `ProtocolResponse`

This deprecated feature has been removed.

Previously, setting the `ProtocolResponse.session` property to `null`
would create a random independent session. This is no longer supported.

Using single-purpose sessions here is discouraged due to overhead costs;
however, old code that needs to preserve this behavior can emulate it by
creating a random session with `session.fromPartition(some_random_string)`
and then using it in `ProtocolResponse.session`.

### Behavior Changed: `BrowserWindow.IsVisibleOnAllWorkspaces()` on Linux

`BrowserWindow.IsVisibleOnAllWorkspaces()` will now return false on Linux if the
window is not currently visible.

## End of Support for 34.x.y

Electron 34.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron.

| E37 (Jun'25) | E38 (Aug'25) | E39 (Oct'25) |
| ------------ | ------------ | ------------ |
| 37.x.y       | 38.x.y       | 39.x.y       |
| 36.x.y       | 37.x.y       | 38.x.y       |
| 35.x.y       | 36.x.y       | 37.x.y       |

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

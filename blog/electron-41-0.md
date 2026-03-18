---
title: Electron 41
date: 2026-03-10T00:00:00.000Z
authors:
  - ckerr
  - name: nmggithub
    url: https://github.com/nmggithub
    image_url: https://github.com/nmggithub.png?size=96
slug: electron-41-0
tags: [release]
---

Electron 41 has been released! It includes upgrades to Chromium 146.0.7680.65, V8 14.6, and Node v24.14.0.

---

The Electron team is excited to announce the release of Electron 41! You can install it with npm via `npm install electron@latest` or download it from our [releases website](https://releases.electronjs.org/release?channel=stable). Continue reading for details about this release.

If you have any feedback, please share it with us on [Bluesky](https://bsky.app/profile/electronjs.org) or [Mastodon](https://social.lfx.dev/@electronjs), or join our community [Discord](https://discord.com/invite/electronjs)! Bugs and feature requests can be reported in Electron's [issue tracker](https://github.com/electron/electron/issues).

> [!IMPORTANT]
> After publishing the initial 41.0.0 package, we integrated some high-priority
> bugs into follow-up patch releases. We recommend installing **41.0.2** when
> upgrading to Electron 41.

## Notable Changes

### ASAR Integrity digest for improved security

As of Electron 41, macOS Electron apps can now embed a digest of their [ASAR Integrity](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) information. This adds an additional layer of tamper detection for apps that use ASAR Integrity by validating the integrity information itself at app launch.

To enable the feature for your app, you can run the following command with `@electron/asar` v4.1.0 and above:

```bash
asar integrity-digest on /path/to/YourApp.app
```

You **_must_** re-sign your app afterwards. For more information, see [the `@electron/asar` CLI documentation.](https://github.com/electron/asar/blob/v4.1.0/README.md#integrity-digest)

Support for this feature in [Electron Forge](https://electronforge.io) is planned for the near future ([electron/forge#4159](https://github.com/electron/forge/pull/4159)).

### Improved Wayland support

On Wayland (Linux), frameless windows now have drop shadows and extended resize boundaries. To create fully frameless windows with no decorations, set `hasShadow: false` in the window constructor. [#49885](https://github.com/electron/electron/pull/49885)

[Mitchell Cohen](https://github.com/mitchchn) is writing a blog article about recent work to improve Electron's support of Wayland and client-side decorations on Linux. Watch this space!

### Added support for MSIX auto-updating

The Electron team recently added MSIX auto-updater support according to [RFC #21](https://github.com/electron/rfcs/pull/21). You can now ship both MSIX and Squirrel.Mac in your update server essentially with the same JSON response format. See the [autoUpdater documentation](https://www.electronjs.org/docs/latest/api/auto-updater) for more information.

This was added in Electron 41 by [#49586](https://github.com/electron/electron/pull/49586) and has also been backported to Electron 39.5.0 ([#49585](https://github.com/electron/electron/pull/49585)) and 40.2.0 ([#49587](https://github.com/electron/electron/pull/49587)).

<!--truncate-->

## Stack Changes

- Chromium `146.0.7680.65`
  - [New in 146](https://developer.chrome.com/blog/new-in-chrome-146/)
  - [New in 145](https://developer.chrome.com/blog/new-in-chrome-145/)

- Node `v24.14.0`
  - [Node 24.14.0 blog post](https://nodejs.org/en/blog/release/v24.14.0)
  - [Node 24.13.1 blog post](https://nodejs.org/en/blog/release/v24.13.1)
  - [Node 24.13.0 blog post](https://nodejs.org/en/blog/release/v24.13.0)
  - [Node 24.12.0 blog post](https://nodejs.org/en/blog/release/v24.12.0)

- V8 `14.4`
  - [V8 roll increment](https://chromium.googlesource.com/v8/v8.git/+/3f4b2d428486d982bf51d7c0487adcd9f73f5fd8)

Electron 41 upgrades Chromium from `144.0.7559.60` to `146.0.7680.65`, Node.js from `v24.11.1` to `v24.14.0`, and V8 from `14.4` to `14.6`.

## New Features and Improvements

- Added `--disable-geolocation` command-line flag for macOS apps to disable location services. [#45934](https://github.com/electron/electron/pull/45934)
- Added NV12 support for import shared texture. [#48922](https://github.com/electron/electron/pull/48922) <sup>(Also in [40](https://github.com/electron/electron/pull/49040))</sup>
- Added a `disclaim` option to the `utilityProcess` API to allow for TCC disclaiming on macOS. [#49693](https://github.com/electron/electron/pull/49693) <sup>(Also in [39](https://github.com/electron/electron/pull/49696), [40](https://github.com/electron/electron/pull/49695))</sup>
- Added a `reason` property to the `Notification` `'closed'` event on Windows to allow developers to know the reason the notification was dismissed. [#50029](https://github.com/electron/electron/pull/50029) <sup>(Also in [40](https://github.com/electron/electron/pull/50030))</sup>
- Added an `usePrinterDefaultPageSize` option to `webContents.print()` to allow using the printer's default page size. [#49812](https://github.com/electron/electron/pull/49812)
- Added support for WebSocket authentication through the `login` event on `webContents`. [#48512](https://github.com/electron/electron/pull/48512) <sup>(Also in [39](https://github.com/electron/electron/pull/49065), [40](https://github.com/electron/electron/pull/49064))</sup>
- Added support for the Node.js [`--experimental-transform-types`](https://nodejs.org/docs/latest-v22.x/api/cli.html#--experimental-transform-types) flag. [#49882](https://github.com/electron/electron/pull/49882) <sup>(Also in [39](https://github.com/electron/electron/pull/49881), [40](https://github.com/electron/electron/pull/49883))</sup>
- Added support for `long-animation-frame` script attribution (via `--enable-features=AlwaysLogLOAFURL`). [#49773](https://github.com/electron/electron/pull/49773) <sup>(Also in [39](https://github.com/electron/electron/pull/49771), [40](https://github.com/electron/electron/pull/49772))</sup>
- Added the ability to disable auto-focusing of `WebContents` on navigation using `webPreferences.focusOnNavigation`. [#49511](https://github.com/electron/electron/pull/49511) <sup>(Also in [40](https://github.com/electron/electron/pull/49512))</sup>
- Irrelevant errors from the Chromium DevTools frontend are now silenced in the main process. [#49292](https://github.com/electron/electron/pull/49292) <sup>(Also in [40](https://github.com/electron/electron/pull/49359))</sup>
- Enable V8 trap handlers for WASM behind `WasmTrapHandlers` [fuse](https://www.electronjs.org/docs/latest/tutorial/fuses). [#49839](https://github.com/electron/electron/pull/49839)
- Extended actions support for Windows notifications to include buttons, select dropdowns, and replies. [#49787](https://github.com/electron/electron/pull/49787) <sup>(Also in [40](https://github.com/electron/electron/pull/49786))</sup>

### Breaking Changes

#### Behavior Changed: PDFs no longer create a separate WebContents

Previously, PDF resources created a separate guest [`WebContents`](https://www.electronjs.org/docs/latest/api/web-contents) for rendering. Now, PDFs are rendered within the same `WebContents` instead. If you have code to detect PDF resources, use the [frame tree](https://www.electronjs.org/docs/latest/api/web-frame-main) instead of `WebContents`.

Under the hood, Chromium [enabled](https://chromium-review.googlesource.com/c/chromium/src/+/7239572) a feature that changes PDFs to use out-of-process iframes (OOPIFs) instead of the `MimeHandlerViewGuest` extension.

#### Behavior Changed: Updated Cookie Change Cause in the Cookie `'changed'` Event

We have updated the cookie change cause in the cookie [`'changed'` event](https://www.electronjs.org/docs/latest/api/cookies#event-changed).
When a new cookie is set, the change cause is `inserted`.
When a cookie is deleted, the change cause remains `explicit`.
When the cookie being set is identical to an existing one (same name, domain, path, and value, with no actual changes), the change cause is `inserted-no-change-overwrite`.
When the value of the cookie being set remains unchanged but some of its attributes are updated, such as the expiration attribute, the change cause will be `inserted-no-value-change-overwrite`.

## End of Support for 38.x.y

Electron 38.x.y has reached end-of-support as per the project's [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines#version-support-policy). Developers and applications are encouraged to upgrade to a newer version of Electron. See https://releases.electronjs.org/schedule to see the timeline for supported versions of Electron.

## What's Next

In the short term, you can expect the team to continue to focus on keeping up with the development of the major components that make up Electron, including Chromium, Node, and V8.

You can find [Electron's public timeline here](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

More information about future changes can be found on the [Planned Breaking Changes](https://github.com/electron/electron/blob/main/docs/breaking-changes.md) page.

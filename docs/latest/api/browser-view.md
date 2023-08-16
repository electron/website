---
title: "BrowserView"
description: "A BrowserView can be used to embed additional web content into a BrowserWindow. It is like a child window, except that it is positioned relative to its owning window. It is meant to be an alternative to the webview tag."
slug: browser-view
hide_title: false
---

# BrowserView

A `BrowserView` can be used to embed additional web content into a
[`BrowserWindow`](latest/api/browser-window.md). It is like a child window, except that it is positioned
relative to its owning window. It is meant to be an alternative to the
`webview` tag.

## Class: BrowserView

> Create and control views.

Process: [Main](latest/glossary.md#main-process)

This module cannot be used until the `ready` event of the `app`
module is emitted.

### Example

```javascript
// In the main process.
const { app, BrowserView, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 })

  const view = new BrowserView()
  win.setBrowserView(view)
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
  view.webContents.loadURL('https://electronjs.org')
})
```

### `new BrowserView([options])` _Experimental_

* `options` Object (optional)
  * `webPreferences` [WebPreferences](latest/api/structures/web-preferences.md) (optional) - Settings of web page's features.
    * `devTools` boolean (optional) - Whether to enable DevTools. If it is set to `false`, can not use `BrowserWindow.webContents.openDevTools()` to open DevTools. Default is `true`.
    * `nodeIntegration` boolean (optional) - Whether node integration is enabled.
      Default is `false`.
    * `nodeIntegrationInWorker` boolean (optional) - Whether node integration is
      enabled in web workers. Default is `false`. More about this can be found
      in [Multithreading](latest/tutorial/multithreading.md).
    * `nodeIntegrationInSubFrames` boolean (optional) - Experimental option for
      enabling Node.js support in sub-frames such as iframes and child windows. All your preloads will load for
      every iframe, you can use `process.isMainFrame` to determine if you are
      in the main frame or not.
    * `preload` string (optional) - Specifies a script that will be loaded before other
      scripts run in the page. This script will always have access to node APIs
      no matter whether node integration is turned on or off. The value should
      be the absolute file path to the script.
      When node integration is turned off, the preload script can reintroduce
      Node global symbols back to the global scope. See example
      [here](latest/api/context-bridge.md#exposing-node-global-symbols).
    * `sandbox` boolean (optional) - If set, this will sandbox the renderer
      associated with the window, making it compatible with the Chromium
      OS-level sandbox and disabling the Node.js engine. This is not the same as
      the `nodeIntegration` option and the APIs available to the preload script
      are more limited. Read more about the option [here](latest/tutorial/sandbox.md).
    * `session` [Session](latest/api/session.md#class-session) (optional) - Sets the session used by the
      page. Instead of passing the Session object directly, you can also choose to
      use the `partition` option instead, which accepts a partition string. When
      both `session` and `partition` are provided, `session` will be preferred.
      Default is the default session.
    * `partition` string (optional) - Sets the session used by the page according to the
      session's partition string. If `partition` starts with `persist:`, the page
      will use a persistent session available to all pages in the app with the
      same `partition`. If there is no `persist:` prefix, the page will use an
      in-memory session. By assigning the same `partition`, multiple pages can share
      the same session. Default is the default session.
    * `zoomFactor` number (optional) - The default zoom factor of the page, `3.0` represents
      `300%`. Default is `1.0`.
    * `javascript` boolean (optional) - Enables JavaScript support. Default is `true`.
    * `webSecurity` boolean (optional) - When `false`, it will disable the
      same-origin policy (usually using testing websites by people), and set
      `allowRunningInsecureContent` to `true` if this options has not been set
      by user. Default is `true`.
    * `allowRunningInsecureContent` boolean (optional) - Allow an https page to run
      JavaScript, CSS or plugins from http URLs. Default is `false`.
    * `images` boolean (optional) - Enables image support. Default is `true`.
    * `imageAnimationPolicy` string (optional) - Specifies how to run image animations (E.g. GIFs).  Can be `animate`, `animateOnce` or `noAnimation`.  Default is `animate`.
    * `textAreasAreResizable` boolean (optional) - Make TextArea elements resizable. Default
      is `true`.
    * `webgl` boolean (optional) - Enables WebGL support. Default is `true`.
    * `plugins` boolean (optional) - Whether plugins should be enabled. Default is `false`.
    * `experimentalFeatures` boolean (optional) - Enables Chromium's experimental features.
      Default is `false`.
    * `scrollBounce` boolean (optional) _macOS_ - Enables scroll bounce
      (rubber banding) effect on macOS. Default is `false`.
    * `enableBlinkFeatures` string (optional) - A list of feature strings separated by `,`, like
      `CSSVariables,KeyboardEventKey` to enable. The full list of supported feature
      strings can be found in the [RuntimeEnabledFeatures.json5][runtime-enabled-features]
      file.
    * `disableBlinkFeatures` string (optional) - A list of feature strings separated by `,`,
      like `CSSVariables,KeyboardEventKey` to disable. The full list of supported
      feature strings can be found in the
      [RuntimeEnabledFeatures.json5][runtime-enabled-features] file.
    * `defaultFontFamily` Object (optional) - Sets the default font for the font-family.
      * `standard` string (optional) - Defaults to `Times New Roman`.
      * `serif` string (optional) - Defaults to `Times New Roman`.
      * `sansSerif` string (optional) - Defaults to `Arial`.
      * `monospace` string (optional) - Defaults to `Courier New`.
      * `cursive` string (optional) - Defaults to `Script`.
      * `fantasy` string (optional) - Defaults to `Impact`.
    * `defaultFontSize` Integer (optional) - Defaults to `16`.
    * `defaultMonospaceFontSize` Integer (optional) - Defaults to `13`.
    * `minimumFontSize` Integer (optional) - Defaults to `0`.
    * `defaultEncoding` string (optional) - Defaults to `ISO-8859-1`.
    * `backgroundThrottling` boolean (optional) - Whether to throttle animations and timers
      when the page becomes background. This also affects the
      [Page Visibility API](latest/api/browser-window.md#page-visibility). Defaults to `true`.
    * `offscreen` boolean (optional) - Whether to enable offscreen rendering for the browser
      window. Defaults to `false`. See the
      [offscreen rendering tutorial](latest/tutorial/offscreen-rendering.md) for
      more details.
    * `contextIsolation` boolean (optional) - Whether to run Electron APIs and
      the specified `preload` script in a separate JavaScript context. Defaults
      to `true`. The context that the `preload` script runs in will only have
      access to its own dedicated `document` and `window` globals, as well as
      its own set of JavaScript builtins (`Array`, `Object`, `JSON`, etc.),
      which are all invisible to the loaded content. The Electron API will only
      be available in the `preload` script and not the loaded page. This option
      should be used when loading potentially untrusted remote content to ensure
      the loaded content cannot tamper with the `preload` script and any
      Electron APIs being used.  This option uses the same technique used by
      [Chrome Content Scripts][chrome-content-scripts].  You can access this
      context in the dev tools by selecting the 'Electron Isolated Context'
      entry in the combo box at the top of the Console tab.
    * `webviewTag` boolean (optional) - Whether to enable the [`<webview>` tag](latest/api/webview-tag.md).
      Defaults to `false`. **Note:** The
      `preload` script configured for the `<webview>` will have node integration
      enabled when it is executed so you should ensure remote/untrusted content
      is not able to create a `<webview>` tag with a possibly malicious `preload`
      script. You can use the `will-attach-webview` event on [webContents](latest/api/web-contents.md)
      to strip away the `preload` script and to validate or alter the
      `<webview>`'s initial settings.
    * `additionalArguments` string[] (optional) - A list of strings that will be appended
      to `process.argv` in the renderer process of this app.  Useful for passing small
      bits of data down to renderer process preload scripts.
    * `safeDialogs` boolean (optional) - Whether to enable browser style
      consecutive dialog protection. Default is `false`.
    * `safeDialogsMessage` string (optional) - The message to display when
      consecutive dialog protection is triggered. If not defined the default
      message would be used, note that currently the default message is in
      English and not localized.
    * `disableDialogs` boolean (optional) - Whether to disable dialogs
      completely. Overrides `safeDialogs`. Default is `false`.
    * `navigateOnDragDrop` boolean (optional) - Whether dragging and dropping a
      file or link onto the page causes a navigation. Default is `false`.
    * `autoplayPolicy` string (optional) - Autoplay policy to apply to
      content in the window, can be `no-user-gesture-required`,
      `user-gesture-required`, `document-user-activation-required`. Defaults to
      `no-user-gesture-required`.
    * `disableHtmlFullscreenWindowResize` boolean (optional) - Whether to
      prevent the window from resizing when entering HTML Fullscreen. Default
      is `false`.
    * `accessibleTitle` string (optional) - An alternative title string provided only
      to accessibility tools such as screen readers. This string is not directly
      visible to users.
    * `spellcheck` boolean (optional) - Whether to enable the builtin spellchecker.
      Default is `true`.
    * `enableWebSQL` boolean (optional) - Whether to enable the [WebSQL api](https://www.w3.org/TR/webdatabase/).
      Default is `true`.
    * `v8CacheOptions` string (optional) - Enforces the v8 code caching policy
      used by blink. Accepted values are
      * `none` - Disables code caching
      * `code` - Heuristic based code caching
      * `bypassHeatCheck` - Bypass code caching heuristics but with lazy compilation
      * `bypassHeatCheckAndEagerCompile` - Same as above except compilation is eager.
      Default policy is `code`.
    * `enablePreferredSizeMode` boolean (optional) - Whether to enable
      preferred size mode. The preferred size is the minimum size needed to
      contain the layout of the document—without requiring scrolling. Enabling
      this will cause the `preferred-size-changed` event to be emitted on the
      `WebContents` when the preferred size changes. Default is `false`.

### Instance Properties

Objects created with `new BrowserView` have the following properties:

#### `view.webContents` _Experimental_

A [`WebContents`](latest/api/web-contents.md) object owned by this view.

### Instance Methods

Objects created with `new BrowserView` have the following instance methods:

#### `view.setAutoResize(options)` _Experimental_

* `options` Object
  * `width` boolean (optional) - If `true`, the view's width will grow and shrink together
    with the window. `false` by default.
  * `height` boolean (optional) - If `true`, the view's height will grow and shrink
    together with the window. `false` by default.
  * `horizontal` boolean (optional) - If `true`, the view's x position and width will grow
    and shrink proportionally with the window. `false` by default.
  * `vertical` boolean (optional) - If `true`, the view's y position and height will grow
    and shrink proportionally with the window. `false` by default.

#### `view.setBounds(bounds)` _Experimental_

* `bounds` [Rectangle](latest/api/structures/rectangle.md)

Resizes and moves the view to the supplied bounds relative to the window.

#### `view.getBounds()` _Experimental_

Returns [`Rectangle`](latest/api/structures/rectangle.md)

The `bounds` of this BrowserView instance as `Object`.

#### `view.setBackgroundColor(color)` _Experimental_

* `color` string - Color in Hex, RGB, ARGB, HSL, HSLA or named CSS color format. The alpha channel is
  optional for the hex type.

Examples of valid `color` values:

* Hex
  * #fff (RGB)
  * #ffff (ARGB)
  * #ffffff (RRGGBB)
  * #ffffffff (AARRGGBB)
* RGB
  * rgb\((\[\d]+),\s*(\[\d]+),\s*(\[\d]+)\)
    * e.g. rgb(255, 255, 255)
* RGBA
  * rgba\((\[\d]+),\s*(\[\d]+),\s*(\[\d]+),\s*(\[\d.]+)\)
    * e.g. rgba(255, 255, 255, 1.0)
* HSL
  * hsl\((-?\[\d.]+),\s*(\[\d.]+)%,\s*(\[\d.]+)%\)
    * e.g. hsl(200, 20%, 50%)
* HSLA
  * hsla\((-?\[\d.]+),\s*(\[\d.]+)%,\s*(\[\d.]+)%,\s*(\[\d.]+)\)
    * e.g. hsla(200, 20%, 50%, 0.5)
* Color name
  * Options are listed in [SkParseColor.cpp](https://source.chromium.org/chromium/chromium/src/+/main:third_party/skia/src/utils/SkParseColor.cpp;l=11-152;drc=eea4bf52cb0d55e2a39c828b017c80a5ee054148)
  * Similar to CSS Color Module Level 3 keywords, but case-sensitive.
    * e.g. `blueviolet` or `red`

**Note:** Hex format with alpha takes `AARRGGBB` or `ARGB`, _not_ `RRGGBBA` or `RGA`.

[chrome-content-scripts]: https://developer.chrome.com/extensions/content_scripts#execution-environment
[runtime-enabled-features]: https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/platform/runtime_enabled_features.json5

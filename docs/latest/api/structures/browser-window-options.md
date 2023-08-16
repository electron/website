---
title: "BrowserWindowConstructorOptions Object"
description: ""
slug: browser-window-options
hide_title: false
---

# BrowserWindowConstructorOptions Object

* `width` Integer (optional) - Window's width in pixels. Default is `800`.
* `height` Integer (optional) - Window's height in pixels. Default is `600`.
* `x` Integer (optional) - (**required** if y is used) Window's left offset from screen.
  Default is to center the window.
* `y` Integer (optional) - (**required** if x is used) Window's top offset from screen.
  Default is to center the window.
* `useContentSize` boolean (optional) - The `width` and `height` would be used as web
  page's size, which means the actual window's size will include window
  frame's size and be slightly larger. Default is `false`.
* `center` boolean (optional) - Show window in the center of the screen. Default is `false`.
* `minWidth` Integer (optional) - Window's minimum width. Default is `0`.
* `minHeight` Integer (optional) - Window's minimum height. Default is `0`.
* `maxWidth` Integer (optional) - Window's maximum width. Default is no limit.
* `maxHeight` Integer (optional) - Window's maximum height. Default is no limit.
* `resizable` boolean (optional) - Whether window is resizable. Default is `true`.
* `movable` boolean (optional) _macOS_ _Windows_ - Whether window is
  movable. This is not implemented on Linux. Default is `true`.
* `minimizable` boolean (optional) _macOS_ _Windows_ - Whether window is
  minimizable. This is not implemented on Linux. Default is `true`.
* `maximizable` boolean (optional) _macOS_ _Windows_ - Whether window is
  maximizable. This is not implemented on Linux. Default is `true`.
* `closable` boolean (optional) _macOS_ _Windows_ - Whether window is
  closable. This is not implemented on Linux. Default is `true`.
* `focusable` boolean (optional) - Whether the window can be focused. Default is
  `true`. On Windows setting `focusable: false` also implies setting
  `skipTaskbar: true`. On Linux setting `focusable: false` makes the window
  stop interacting with wm, so the window will always stay on top in all
  workspaces.
* `alwaysOnTop` boolean (optional) - Whether the window should always stay on top of
  other windows. Default is `false`.
* `fullscreen` boolean (optional) - Whether the window should show in fullscreen. When
  explicitly set to `false` the fullscreen button will be hidden or disabled
  on macOS. Default is `false`.
* `fullscreenable` boolean (optional) - Whether the window can be put into fullscreen
  mode. On macOS, also whether the maximize/zoom button should toggle full
  screen mode or maximize window. Default is `true`.
* `simpleFullscreen` boolean (optional) _macOS_ - Use pre-Lion fullscreen on
  macOS. Default is `false`.
* `skipTaskbar` boolean (optional) _macOS_ _Windows_ - Whether to show the window in taskbar.
  Default is `false`.
* `hiddenInMissionControl` boolean (optional) _macOS_ - Whether window should be hidden when the user toggles into mission control.
* `kiosk` boolean (optional) - Whether the window is in kiosk mode. Default is `false`.
* `title` string (optional) - Default window title. Default is `"Electron"`. If the HTML tag `<title>` is defined in the HTML file loaded by `loadURL()`, this property will be ignored.
* `icon` ([NativeImage](latest/api/native-image.md) | string) (optional) - The window icon. On Windows it is
  recommended to use `ICO` icons to get best visual effects, you can also
  leave it undefined so the executable's icon will be used.
* `show` boolean (optional) - Whether window should be shown when created. Default is
  `true`.
* `paintWhenInitiallyHidden` boolean (optional) - Whether the renderer should be active when `show` is `false` and it has just been created.  In order for `document.visibilityState` to work correctly on first load with `show: false` you should set this to `false`.  Setting this to `false` will cause the `ready-to-show` event to not fire.  Default is `true`.
* `frame` boolean (optional) - Specify `false` to create a
  [frameless window](latest/tutorial/window-customization.md#create-frameless-windows). Default is `true`.
* `parent` BrowserWindow (optional) - Specify parent window. Default is `null`.
* `modal` boolean (optional) - Whether this is a modal window. This only works when the
  window is a child window. Default is `false`.
* `acceptFirstMouse` boolean (optional) _macOS_ - Whether clicking an
  inactive window will also click through to the web contents. Default is
  `false` on macOS. This option is not configurable on other platforms.
* `disableAutoHideCursor` boolean (optional) - Whether to hide cursor when typing.
  Default is `false`.
* `autoHideMenuBar` boolean (optional) - Auto hide the menu bar unless the `Alt`
  key is pressed. Default is `false`.
* `enableLargerThanScreen` boolean (optional) _macOS_ - Enable the window to
  be resized larger than screen. Only relevant for macOS, as other OSes
  allow larger-than-screen windows by default. Default is `false`.
* `backgroundColor` string (optional) - The window's background color in Hex, RGB, RGBA, HSL, HSLA or named CSS color format. Alpha in #AARRGGBB format is supported if `transparent` is set to `true`. Default is `#FFF` (white). See [win.setBackgroundColor](latest/api/browser-window.md#winsetbackgroundcolorbackgroundcolor) for more information.
* `hasShadow` boolean (optional) - Whether window should have a shadow. Default is `true`.
* `opacity` number (optional) _macOS_ _Windows_ - Set the initial opacity of
  the window, between 0.0 (fully transparent) and 1.0 (fully opaque). This
  is only implemented on Windows and macOS.
* `darkTheme` boolean (optional) - Forces using dark theme for the window, only works on
  some GTK+3 desktop environments. Default is `false`.
* `transparent` boolean (optional) - Makes the window [transparent](latest/tutorial/window-customization.md#create-transparent-windows).
  Default is `false`. On Windows, does not work unless the window is frameless.
* `type` string (optional) - The type of window, default is normal window. See more about
  this below.
* `visualEffectState` string (optional) _macOS_ - Specify how the material
  appearance should reflect window activity state on macOS. Must be used
  with the `vibrancy` property. Possible values are:
  * `followWindow` - The backdrop should automatically appear active when the window is active, and inactive when it is not. This is the default.
  * `active` - The backdrop should always appear active.
  * `inactive` - The backdrop should always appear inactive.
* `titleBarStyle` string (optional) _macOS_ _Windows_ - The style of window title bar.
  Default is `default`. Possible values are:
  * `default` - Results in the standard title bar for macOS or Windows respectively.
  * `hidden` - Results in a hidden title bar and a full size content window. On macOS, the window still has the standard window controls (“traffic lights”) in the top left. On Windows, when combined with `titleBarOverlay: true` it will activate the Window Controls Overlay (see `titleBarOverlay` for more information), otherwise no window controls will be shown.
  * `hiddenInset` _macOS_ - Only on macOS, results in a hidden title bar
    with an alternative look where the traffic light buttons are slightly
    more inset from the window edge.
  * `customButtonsOnHover` _macOS_ - Only on macOS, results in a hidden
    title bar and a full size content window, the traffic light buttons will
    display when being hovered over in the top left of the window.
    **Note:** This option is currently experimental.
* `trafficLightPosition` [Point](latest/api/structures/point.md) (optional) _macOS_ -
  Set a custom position for the traffic light buttons in frameless windows.
* `roundedCorners` boolean (optional) _macOS_ - Whether frameless window
  should have rounded corners on macOS. Default is `true`. Setting this property
  to `false` will prevent the window from being fullscreenable.
* `fullscreenWindowTitle` boolean (optional) _macOS_ _Deprecated_ - Shows
  the title in the title bar in full screen mode on macOS for `hiddenInset`
  titleBarStyle. Default is `false`.
* `thickFrame` boolean (optional) - Use `WS_THICKFRAME` style for frameless windows on
  Windows, which adds standard window frame. Setting it to `false` will remove
  window shadow and window animations. Default is `true`.
* `vibrancy` string (optional) _macOS_ - Add a type of vibrancy effect to
  the window, only on macOS. Can be `appearance-based`, `light`, `dark`,
  `titlebar`, `selection`, `menu`, `popover`, `sidebar`, `medium-light`,
  `ultra-dark`, `header`, `sheet`, `window`, `hud`, `fullscreen-ui`,
  `tooltip`, `content`, `under-window`, or `under-page`. Please note that
  `appearance-based`, `light`, `dark`, `medium-light`, and `ultra-dark` are
  deprecated and have been removed in macOS Catalina (10.15).
* `backgroundMaterial` string (optional) _Windows_ - Set the window's
  system-drawn background material, including behind the non-client area.
  Can be `auto`, `none`, `mica`, `acrylic` or `tabbed`. See [win.setBackgroundMaterial](latest/api/browser-window.md#winsetbackgroundmaterialmaterial-windows) for more information.
* `zoomToPageWidth` boolean (optional) _macOS_ - Controls the behavior on
  macOS when option-clicking the green stoplight button on the toolbar or by
  clicking the Window > Zoom menu item. If `true`, the window will grow to
  the preferred width of the web page when zoomed, `false` will cause it to
  zoom to the width of the screen. This will also affect the behavior when
  calling `maximize()` directly. Default is `false`.
* `tabbingIdentifier` string (optional) _macOS_ - Tab group name, allows
  opening the window as a native tab. Windows with the same
  tabbing identifier will be grouped together. This also adds a native new
  tab button to your window's tab bar and allows your `app` and window to
  receive the `new-window-for-tab` event.
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
* `titleBarOverlay` Object | Boolean (optional) -  When using a frameless window in conjunction with `win.setWindowButtonVisibility(true)` on macOS or using a `titleBarStyle` so that the standard window controls ("traffic lights" on macOS) are visible, this property enables the Window Controls Overlay [JavaScript APIs][overlay-javascript-apis] and [CSS Environment Variables][overlay-css-env-vars]. Specifying `true` will result in an overlay with default system colors. Default is `false`.
  * `color` String (optional) _Windows_ - The CSS color of the Window Controls Overlay when enabled. Default is the system color.
  * `symbolColor` String (optional) _Windows_ - The CSS color of the symbols on the Window Controls Overlay when enabled. Default is the system color.
  * `height` Integer (optional) _macOS_ _Windows_ - The height of the title bar and Window Controls Overlay in pixels. Default is system height.

When setting minimum or maximum window size with `minWidth`/`maxWidth`/
`minHeight`/`maxHeight`, it only constrains the users. It won't prevent you from
passing a size that does not follow size constraints to `setBounds`/`setSize` or
to the constructor of `BrowserWindow`.

The possible values and behaviors of the `type` option are platform dependent.
Possible values are:

* On Linux, possible types are `desktop`, `dock`, `toolbar`, `splash`,
  `notification`.
  * The `desktop` type places the window at the desktop background window level
    (kCGDesktopWindowLevel - 1). However, note that a desktop window will not
    receive focus, keyboard, or mouse events. You can still use globalShortcut to
    receive input sparingly.
  * The `dock` type creates a dock-like window behavior.
  * The `toolbar` type creates a window with a toolbar appearance.
  * The `splash` type behaves in a specific way. It is not
    draggable, even if the CSS styling of the window's body contains
    -webkit-app-region: drag. This type is commonly used for splash screens.
  * The `notification` type creates a window that behaves like a system notification.
* On macOS, possible types are `desktop`, `textured`, `panel`.
  * The `textured` type adds metal gradient appearance
    (`NSWindowStyleMaskTexturedBackground`).
  * The `desktop` type places the window at the desktop background window level
    (`kCGDesktopWindowLevel - 1`). Note that desktop window will not receive
    focus, keyboard or mouse events, but you can use `globalShortcut` to receive
    input sparingly.
  * The `panel` type enables the window to float on top of full-screened apps
    by adding the `NSWindowStyleMaskNonactivatingPanel` style mask,normally
    reserved for NSPanel, at runtime. Also, the window will appear on all
    spaces (desktops).
* On Windows, possible type is `toolbar`.

[overlay-css-env-vars]: https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#css-environment-variables
[overlay-javascript-apis]: https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#javascript-apis

[chrome-content-scripts]: https://developer.chrome.com/extensions/content_scripts#execution-environment
[runtime-enabled-features]: https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/platform/runtime_enabled_features.json5

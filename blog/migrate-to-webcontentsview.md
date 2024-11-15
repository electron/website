---
title: Migrating from BrowserView to WebContentsView
date: 2024-11-11T00:00:00.000Z
authors: yangannyx
slug: migrate-to-webcontentsview
tags: [community]
---

`BrowserView` has been deprecated since [Electron 30](http://www.electronjs.org/blog/electron-30-0) and is replaced by `WebContentView`. Thankfully, migrating is fairly painless.

---

Electron is moving from [`BrowserView`](https://www.electronjs.org/docs/latest/api/browser-view) to [`WebContentsView`](https://www.electronjs.org/docs/latest/api/web-contents-view) to align with Chromium’s UI framework, the [Views API](https://www.chromium.org/chromium-os/developer-library/guides/views/intro/). `WebContentsView` offers a reusable view directly tied to Chromium’s rendering pipeline, simplifying future upgrades and opening up the possibility for developers to integrate non-web UI elements to their Electron apps. By adopting `WebContentsView`, applications are not only prepared for upcoming updates but also benefit from reduced code complexity and fewer potential bugs in the long run.

Developers familiar with BrowserWindows and BrowserViews should note that `BrowserWindow` and `WebContentsView` are subclasses inheriting from the [`BaseWindow`](https://www.electronjs.org/docs/latest/api/base-window) and [`View`](https://www.electronjs.org/docs/latest/api/view) base classes, respectively. To fully understand the available instance variables and methods, be sure to consult the documentation for these base classes.

## Migration steps

### 1. Upgrade Electron to 30.0.0 or higher

:::warning
Electron releases may contain breaking changes that affect your application. It’s a good idea to test and land the Electron upgrade on your app _first_ before proceeding with the rest of this migration. A list of breaking changes for each Electron major version can be found [here](https://www.electronjs.org/docs/latest/breaking-changes) as well as in the release notes for each major version on the Electron Blog.
:::

### 2. Familiarize yourself with where your application uses BrowserViews

One way to do this is to search your codebase for `new BrowserView(`. This should give you a sense for how your application is using BrowserViews and how many call sites need to be migrated.

:::tip
For the most part, each instance where your app instantiates new BrowserViews can be migrated in isolation from the others.
:::

### 3. Migrate each usage of `BrowserView`

1. Migrate the instantiation. This should be fairly straightforward because [WebContentsView](https://www.electronjs.org/docs/latest/api/web-contents-view#new-webcontentsviewoptions) and [BrowserView’s](https://www.electronjs.org/docs/latest/api/browser-view#new-browserviewoptions-experimental-deprecated) constructors have essentially the same shape. Both accept [WebPreferences](https://www.electronjs.org/docs/latest/api/structures/web-preferences) via the `webPreferences` param.

   ```diff
   - this.tabBar = new BrowserView({
   + this.tabBar = new WebContentsView({
   ```

2. Migrate where the `BrowserView` gets added to its parent window.

   ```diff
   - this.browserWindow.addBrowserView(this.tabBar)
   + this.browserWindow.contentView.addChildView(this.tabBar);
   ```

3. Migrate `BrowserView` instance method calls on the parent window.

   | Old Method              | New Method                                                         | Notes                                                              |
   | ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
   | `win.setBrowserView`    | `win.contentView.removeChildView` + `win.contentView.addChildView` |                                                                    |
   | `win.getBrowserView`    | `win.contentView.children`                                         |                                                                    |
   | `win.removeBrowserView` | `win.contentView.removeChildView`                                  |                                                                    |
   | `win.setTopBrowserView` | `win.contentView.addChildView`                                     | Calling `addChildView` on an existing view reorders it to the top. |
   | `win.getBrowserViews`   | `win.contentView.children`                                         |                                                                    |

4. Migrate the `setAutoResize` instance method to a resize listener.

   ```diff
   - this.browserView.setAutoResize({
   -   vertical: true,
   - })

   + this.browserWindow.on('resize', () => {
   +   if (!this.browserWindow || !this.webContentsView) {
   +     return;
   +   }
   +   const bounds = this.browserWindow.getBounds();
   +   this.webContentsView.setBounds({
   +     x: 0,
   +     y: 0,
   +     width: bounds.width,
   +     height: bounds.height,
   +    });
   +  });
   ```

   :::tip
   All existing usage of `browserView.webContents` and instance methods `browserView.setBounds`, `browserView.getBounds` , and `browserView.setBackgroundColor` do not need to be migrated and should work with a `WebContentsView` instance out of the box!
   :::

### 4. Test and commit your changes

Running into issues? Check the [WebContentsView](https://github.com/electron/electron/labels/component%2FWebContentsView) tag on Electron's issue tracker to see if the issue you're encountering has been reported. If you don't see your issue there, feel free to add a new bug report. Including testcase gists will help us better triage your issue!

Congrats, you’ve migrated onto WebContentsViews! 🎉

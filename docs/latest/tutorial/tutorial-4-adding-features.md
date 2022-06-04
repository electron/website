---
title: 'Adding Native Application Features'
description: 'In this step of the tutorial we will share some resources you should read to add features to your application'
slug: tutorial-adding-features
hide_title: false
---

:::info Follow along the tutorial

This is **part 4** of the Electron tutorial.

1. [Prerequisites][prerequisites]
1. [Building your First App][building your first app]
1. [Using Preload Scripts][main-renderer]
1. [Adding Features][features]
1. [Packaging Your Application][packaging]
1. [Publishing and Updating][updates]

:::

If you have been following along, you should have an Electron application
with a basic user interface. In this part of the tutorial, you will be
using Electron APIs to give a more native feel to your app and extend
its functionality.

## Managing your app's window lifecycle

Application windows behave differently on each operating system. Rather than
prescribe these behaviours by default, Electron puts the responsibility on developers
to implement these conventions in their app. In this tutorial, we will be going over
a few of the standard windowing behaviours required by the major desktop operating
systems.

:::note

We will be using Node's [`process.platform`][node-platform] variable
to conditionally run applications on certain platforms. There are only three
possible platforms that Electron can run in: `win32` (Windows), `linux` (Linux),
and `darwin` (macOS).

:::

### Quit the app when all windows are closed (Windows & Linux)

On Windows and Linux, exiting all windows generally quits an application entirely.

To implement this pattern in your Electron app, listen for the `app` module's
[`'window-all-closed'`][window-all-closed] event, and call [`app.quit()`][app-quit]
if the user is not on macOS (`darwin`).

```js
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### Open a window if none are open (macOS)

Whereas Linux and Windows apps quit when they have no windows open, macOS apps generally
continue running even without any windows open. Activating the app when no windows
are available should open a new one.

To implement this feature, listen for the `app` module's [`activate`][activate]
event, and call your existing `createWindow()` method if no browser windows are open.

Because windows cannot be created before the `ready` event, you should only listen for
`activate` events after your app is initialized. Do this by attaching your event listener
inside the `whenReady()` callback.

```js
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
```

After integrating these patterns, your code should look like this:

```fiddle docs/latest/fiddles/windows-lifecycle

```

## Other integrations and examples

Electron's documentation has many tutorials to help you with more advanced topics
and deeper operating system integrations.

- [OS Integration]: How to make your application feel more integrated with the Operating
  System where it is running.
- [How to]: A list of more advanced topics that are general to Electron development and
  not for a particular operating system.

:::tip Let us know if something is missing!

If you can't find what you are looking for, please let us know on our [GitHub repo] or in
our [Discord server][discord]!

:::

<!-- Link labels -->

[activate]: latest/api/app.md#event-activate-macos
[app-quit]: latest/api/app.md#appquit
[discord]: https://discord.com/invite/APGC3k5yaH
[github repo]: https://github.com/electron/electronjs.org-new/issues/new
[how to]: ./examples.md
[node-platform]: https://nodejs.org/api/process.html#process_process_platform
[os integration]: ./os-integration.md
[window-all-closed]: latest/api/app.md#event-window-all-closed

<!-- Tutorial links -->

[prerequisites]: tutorial-1-prerequisites.md
[building your first app]: tutorial-2-scaffolding.md
[main-renderer]: tutorial-3-main-renderer.md
[features]: tutorial-4-adding-features.md
[packaging]: tutorial-5-packaging.md
[updates]: tutorial-6-publishing-updating.md

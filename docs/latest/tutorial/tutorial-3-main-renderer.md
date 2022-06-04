---
title: 'Using Preload Scripts'
description: 'This guide will step you through the process of creating a barebones Hello World app in Electron, similar to electron/electron-quick-start.'
slug: tutorial-main-renderer
hide_title: false
---

:::info Follow along the tutorial

This is **part 3** of the Electron tutorial.

1. [Prerequisites][prerequisites]
1. [Building your First App][building your first app]
1. [Using Preload Scripts][main-renderer]
1. [Adding Features][features]
1. [Packaging Your Application][packaging]
1. [Publishing and Updating][updates]

:::

## Learning goals

In this section, you will learn what a preload script is and how to use one to safely
expose privileged features into the renderer process. You will also learn how to safely
communicate between main and renderer processes with Electron's built-in
inter-process communication (IPC) modules.

If you are not familiar with Node.js, we recommend you to first
read [this guide][node-guide] before continuing.

## Using `contextBridge` and a preload script

:::tip Further reading 📚

For a more detailed look at preload scripts, please refer to
[Electron's Process Model][process-model] doc.

:::

Electron's main process is a Node.js process that has full operating system access.
On top of [Electron's built-in modules][modules], you can also access
[Node.js built-ins][node-api], as well as any packages downloaded via npm.

On the other hand, renderer processes are more locked down and do not run a Node.js
environment for security reasons. To add features to your renderer that require
privileged access, you have to use a [preload script][preload-script] in conjunction with the
[`contextBridge` API][contextbridge]. Electron's preload scripts are injected before a web page
loads in the renderer, similar to a Chrome extension's [content scripts][content-script].
By exposing APIs through the context bridge, you are giving your renderer access
to developer-defined [global](https://developer.mozilla.org/en-US/docs/Glossary/Global_object)
objects.

To demonstrate this concept, we are going to create a trivial preload script that exposes your app's
versions of Chrome, Node, and Electron into the renderer. To do this, add a new `preload.js` file
with the following:

```js title="preload.js"
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});
```

:::tip Further reading 📚

To understand more about context isolation, we recommend you to read the
[Context Isolation guide][context-isolation].

:::

The above code accesses Electron's `process.versions` object and exposes some of them in
the renderer process in a global object called `versions`.

To attach this script to your renderer process, pass the path to your preload script
to the `webPreferences.preload` option in the `BrowserWindow` constructor:

```js {8-10} title="main.js"
const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});
```

:::tip

There are two Node.js concepts that are used here:

- The [`__dirname`][dirname] string points to the path of the currently executing script
  (in this case, your project's root folder).
- The [`path.join`][path-join] API joins multiple path segments together, creating a
  combined path string that works across all platforms.

If you are unfamiliar with Node.js, we recommend you to read [this guide][node-guide].

:::

At this point, the renderer has access to the `versions` global, so let's display that
information in the window. Create a `renderer.js` script that contains the following code:

```js title="renderer.js"
const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
```

Then, modify your `index.html` by adding a `<p>` element with `info` as its id,
and attach your `renderer.js` script:

```html {18,20} title="index.html"
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <meta
      http-equiv="X-Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Hello from Electron renderer!</title>
  </head>
  <body>
    <h1>Hello from Electron renderer!</h1>
    <p>👋</p>
    <p id="info"></p>
  </body>
  <script src="./renderer.js"></script>
</html>
```

:::warning

The reason why we do not write the JavaScript directly in the HTML between `<script></script>`
is because we have a Content Security Policy (CSP) that will prevent its execution.
To know more you can visit [MDN's CSP documentation][mdn-csp].

:::

After following the above steps, you should have an Electron application that
displays a message similar to the following one (probably with different versions):

> This app is using Chrome (v94.0.4606.81), Node.js (v16.5.0), and Electron (v15.2.0)

And the code should look like this:

```fiddle docs/latest/fiddles/tutorial-main-renderer

```

## Communicating between processes

In Electron, only the main process has access to Node.js, and only the renderer process
has access to web APIs. This means it is not possible to access the Node.js APIs directly
from the renderer process, nor the HTML Document Object Model (DOM) from the main process.
**They are entirely different processes with different APIs**.

You can set up handlers for inter-process commmunication (IPC) with Electron's
`ipcMain` and `ipcRenderer` modules. To send a message from your web page
to the main process, you can set up a main process handler with `ipcMain.handle` and
set up a preload function that calls `ipcRenderer.invoke` to trigger it.
In general, you never want to directly expose the `ipcRenderer` module via preload,
since allowing the renderer process to send arbitrary messages is a security risk.

In the following example, we will add a global function to the renderer called `ping()`
that will return a string from the main process.

First, set up the `invoke` call in your preload script:

```js {1,7} title="preload.js"
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  // we can also expose variables, not just functions
});
```

Then, set up your `handle` listener in the main process. We do this before
loading the HTML file so that the handler is guaranteed to be ready before
you send out the `invoke` call from the renderer.

```js {1,11} title="main.js"
const { ipcMain } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  ipcMain.handle('ping', () => 'pong');
  win.loadFile('index.html');
};
```
Once you have these two pieces set up, you can now send messages from the renderer
to the main process through the `'ping'` channel you just defined.

```js title='renderer.js'
const func = async () => {
  const response = await window.versions.ping();
  console.log(response); // prints out 'pong'
};

func();
```

:::info

For more in-depth explanations on using the `ipcRenderer` and `ipcMain` modules,
check out the full [Inter-Process Communication][ipc] guide.

:::

## Summary

A preload script contains code that runs before your web page is loaded into the browser
window. It has access to both DOM APIs and Node.js environment, and is often used to
expose privileged APIs to the renderer via the `contextBridge` API.

Because the main and renderer processes have very different responsibilities, Electron
apps often use the preload script to set up inter-process communication (IPC) interfaces
to pass arbitrary messages between the two kinds of processes.

In the next part of the tutorial, we will be learning how to use Electron's APIs to
provide a more native feel to your application.

<!-- Links -->

[advanced-installation]: ./installation.md
[application debugging]: ./application-debugging.md
[app]: ../api/app.md
[app-ready]: ../api/app.md#event-ready
[app-when-ready]: ../api/app.md#appwhenready
[browser-window]: ../api/browser-window.md
[commonjs]: https://nodejs.org/docs/latest/api/modules.html#modules_modules_commonjs_modules
[compound task]: https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks
[content-script]: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
[contextbridge]: ../api/context-bridge.md
[context-isolation]: ./context-isolation.md
[devtools-extension]: ./devtools-extension.md
[dirname]: https://nodejs.org/api/modules.html#modules_dirname
[ipc]: ./ipc.md
[mdn-csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
[modules]: ../api/app.md
[node-api]: https://nodejs.org/dist/latest/docs/api/
[node-guide]: https://nodejs.dev/learn
[package-json-main]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main
[package-scripts]: https://docs.npmjs.com/cli/v7/using-npm/scripts
[path-join]: https://nodejs.org/api/path.html#path_path_join_paths
[preload-script]: ./sandbox.md#preload-scripts
[process-model]: ./process-model.md
[react]: https://reactjs.org
[sandbox]: ./sandbox.md
[webpack]: https://webpack.js.org

<!-- Tutorial links -->

[prerequisites]: tutorial-1-prerequisites.md
[building your first app]: tutorial-2-scaffolding.md
[main-renderer]: tutorial-3-main-renderer.md
[features]: tutorial-4-adding-features.md
[packaging]: tutorial-5-packaging.md
[updates]: tutorial-6-publishing-updating.md

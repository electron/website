---
title: 'Building your First App'
description: 'This guide will step you through the process of creating a barebones Hello World app in Electron, similar to electron/electron-quick-start.'
slug: tutorial-scaffolding
hide_title: false
---

:::info Follow along the tutorial

This is **part 2** of the Electron tutorial.

1. [Prerequisites][prerequisites]
1. [Building your First App][building your first app]
1. [Using Preload Scripts][main-renderer]
1. [Adding Features][features]
1. [Packaging Your Application][packaging]
1. [Publishing and Updating][updates]

:::

After this part of the tutorial, you will have an Electron application
running in development mode with a basic user interface.

## Setting up your npm project

Electron apps follow the same general structure as other Node.js projects.
Start by creating a folder and initializing an npm package.

```sh npm2yarn
mkdir my-electron-app && cd my-electron-app
npm init
```

:::warning Avoid WSL

If you are on a Windows machine, please do not use [Windows Subsystem for Linux][wsl] (WSL)
when following this tutorial as you will run into issues when trying to execute the
application.

<!--https://www.electronforge.io/guides/developing-with-wsl-->

:::

The interactive `init` command will prompt you to set some fields in your config.
There are a few rules to follow for the purposes of this tutorial:

- `entry point` should be `main.js`.
- `author`, `license`, and `description` can be any value, but will be necessary for
  [app packaging][packaging] later on.

Your `package.json` file should look something like this:

```json title='package.json'
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT"
}
```

Then, install Electron into your app's dev dependencies.

```sh npm2yarn
npm install --save-dev electron
```

## Starting the main process

The entry point of any Electron application is its main script. This script controls the
**main process**, which runs in a Node.js environment and is responsible for
controlling your app's lifecycle, displaying native interfaces, performing privileged
operations, and managing renderer processes (more on that later).

:::tip Further reading

If you haven't yet, please read [Electron's process model][process-model] to better
understand how Electron's multiple process types work together.

:::

During execution, Electron will look for this script in the [`main`][package-json-main]
field of the app's `package.json` config. In the previous step, you set that field to
a file called `main.js`, which we have not created yet.

To initialize the main script, create a file named `main.js` in the root folder
of your project with a single line of code:

```js title='main.js'
console.log(`Hello from Electron 👋`);
```

To execute this script, add `electron .` to the `start` command in the
[`scripts`][package-scripts] field of your `package.json`.

```json {7-9} title='package.json'
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT",
  "scripts": {
    "start": "electron ."
  }
}
```

This `start` command will tell the Electron executable to look for the `main.js`
entry point in the current directory and run it in development mode.

```sh npm2yarn
npm run start
```

Your terminal's console should print out `Hello from Electron 👋`. Congratulations,
you have executed your first line of code in Electron! Next, we'll learn how to
create a browser window.

## Creating a web page and loading it into a BrowserWindow

In Electron, each window displays a website that can be loaded either from a local HTML
file or a remote URL. For this tutorial, we'll be using a local file.

Start by creating an `index.html` file in the root folder of your project:

```html title='index.html'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
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
  </body>
</html>
```

Now that you have a web page, you can display it within a [BrowserWindow][browser-window].
To do so, replace the contents of your `main.js` file from the previous step with the
following snippet:

```js title='main.js'
const { app, BrowserWindow } = require('electron');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});
```

In the first line, we are importing 2 Electron modules with the CommonJS
`require` syntax:

- [`app`][app], which controls your application's event lifecycle.
- [`BrowserWindow`][browser-window], which creates and manages app windows.

```js
const { app, BrowserWindow } = require('electron');
```

:::warning ESM and Electron
[ECMAScript modules](https://nodejs.org/api/esm.html) (i.e. using `import` to load a module)
are currently not directly supported in Electron. You can find more information about the
state of ESM in Electron in [this GitHub issue](https://github.com/electron/electron/issues/21457).
:::

Then, the `createWindow()` function loads `index.html` into a new BrowserWindow
instance:

```js
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('index.html');
};
```

:::tip Further reading
You can find all the constructor options available in the [BrowserWindow API docs][browser-window].
:::

In Electron, BrowserWindows can only be created after the app module's
[`ready`][app-ready] event is fired. You can wait for this event by using the
[`app.whenReady()`][app-when-ready] API. Call `createWindow()` after `whenReady()`
resolves its promise. This is done in the last 3 lines of the code:

```js
app.whenReady().then(() => {
  createWindow();
});
```

At this point, your Electron application should successfully open a window that displays your
web page! Each window created by your app will run in a separate process called a
**renderer** process (or simply _renderer_ for short).

Renderer processes behave very similarly to regular websites. This means you can use the same
JavaScript APIs and tooling you use for typical front-end development, such as using [webpack]
to bundle and minify your code or [React][react] to build your user interfaces.

<!-- :::tip sandboxing
One important thing from the code above is `sandbox: true`. The sandbox limits the harm that malicious
code can cause by limiting access to most system resources. While the sandbox used to be disabled by
default, that changes in Electron 18 where `sandbox: true` will be the default.

The sandbox will appear again in the tutorial, and you can read now more about it in the
[Process Sandboxing guide][sandbox].
::: -->

## Optional: Debugging from VS Code

If you want to debug your application using VS Code instead of using the terminal, you have to
remember to attach VS Code to both the main and renderer processes.

We are going to create a configuration file that allow us to debug both at the same time:

1. Create a new folder `.vscode` in the root of your project.
1. Create a new file `launch.json` with the following content:

```json title='.vscode/launch.json'
{
  "version": "0.2.0",
  "compounds": [
    {
      "name": "Main + renderer",
      "configurations": ["Main", "Renderer"],
      "stopAll": true
    }
  ],
  "configurations": [
    {
      "name": "Renderer",
      "port": 9222,
      "request": "attach",
      "type": "pwa-chrome",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Main",
      "type": "pwa-node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": [".", "--remote-debugging-port=9222"],
      "outputCapture": "std",
      "console": "integratedTerminal"
    }
  ]
}
```

<!-- markdownlint-disable MD029 -->

3. The option `Main + renderer` will appear when you select `Run and Debug`
from the sidebar, allowing you to set breakpoints and inspect all the variables among
other things in both the main and renderer processes.
<!-- markdownlint-enable MD029 -->

What we have done in the `launch.json` file is to create 3 configurations:

- `Main` is used to start the main process and also expose port 9222 for remote debugging
  (`--remote-debugging-port=9222`). This is the port that we will use to attach the debugger
  for the `Renderer`. Because the main process is a Node.js process, the type is set to
  `pwa-node` (`pwa-` is the prefix that tells VS Code to use the latest JavaScript debugger).
- `Renderer` is used to debug the renderer process. Because the main process is the one
  that creates the process, we have to "attach" to it (`"request": "attach"`) instead of
  creating a new one.
  The renderer process is a web one, so the debugger we have to use is `pwa-chrome`.
- `Main + renderer` is a [compound task] that executes the previous ones simulatenously.

:::caution

Because we are attaching to a process in `Renderer`, it is possible that the first lines of
your code will be skipped as the debugger will not have had enough time to connect before they are
being executed.
You can work around this by refreshing the page or setting a timeout before executing the code
in development mode.

:::

:::tip Further reading

If you want to dig deeper in the debugging area, the following guides provide more information:

- [Application Debugging]
- [DevTools Extensions][devtools extension]

:::

<!-- Links -->

[activate]: latest/api/app.md#event-activate-macos
[advanced-installation]: installation.md
[app]: latest/api/app.md
[app-quit]: latest/api/app.md#appquit
[app-ready]: latest/api/app.md#event-ready
[app-when-ready]: latest/api/app.md#appwhenready
[application debugging]: ./application-debugging.md
[browser-window]: latest/api/browser-window.md
[commonjs]: https://nodejs.org/docs/latest/api/modules.html#modules_modules_commonjs_modules
[compound task]: https://code.visualstudio.com/Docs/editor/tasks#_compound-tasks
[devtools extension]: ./devtools-extension.md
[node-platform]: https://nodejs.org/api/process.html#process_process_platform
[package-json-main]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main
[package-scripts]: https://docs.npmjs.com/cli/v7/using-npm/scripts
[process-model]: process-model.md
[react]: https://reactjs.org
[sandbox]: ./sandbox.md
[webpack]: https://webpack.js.org
[window-all-closed]: latest/api/app.md#event-window-all-closed
[wsl]: https://docs.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2

<!-- Tutorial links -->

[prerequisites]: tutorial-1-prerequisites.md
[building your first app]: tutorial-2-scaffolding.md
[main-renderer]: tutorial-3-main-renderer.md
[features]: tutorial-4-adding-features.md
[packaging]: tutorial-5-packaging.md
[updates]: tutorial-6-publishing-updating.md

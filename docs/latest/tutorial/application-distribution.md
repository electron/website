---
title: 'Application Distribution'
description: 'To distribute your app with Electron, you need to package and rebrand it. To do this, you can either use specialized tooling or manual approaches.'
slug: application-distribution
hide_title: false
---

:::info Tutorial parts
This is part 6 of the Electron tutorial. The other parts are:

1. [Prerequisites]
1. [Scaffolding]
1. [Main and Renderer process communication][main-renderer]
1. [Adding Features][features]
1. [Application Distribution]
1. [Code Signing]
1. [Updating Your Application][updates]

:::

To distribute your app with Electron, you need to package and rebrand it.
To do this, you can either use specialized tooling or manual approaches. At the end of this part you will know how to prepare your application to distribute it to your users.

## With tooling

The fastest way to distribute your newly created app is using
[Electron Forge](https://www.electronforge.io).

First, add Electron Forge as a development dependency of your app, and use its `import` command to set up.

Forge's scaffolding:

```sh npm2yarn
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

The output of this command should be similar to the following:

```plain
✔ Checking your system
✔ Initializing Git Repository
✔ Writing modified package.json file
✔ Installing dependencies
✔ Writing modified package.json file
✔ Fixing .gitignore

We have ATTEMPTED to convert your app to be in a format that electron-forge understands.

Thanks for using "electron-forge"!!!
```

Then create a distributable using Forge's `make` command:

```sh npm2yarn
npm run make
```

And the output should look like:

```plain
> my-electron-app@1.0.0 make /my-electron-app
> electron-forge make

✔ Checking your system
✔ Resolving Forge Config
We need to package your application before we can make it
✔ Preparing to Package Application for arch: x64
✔ Preparing native dependencies
✔ Packaging Application
Making for the following targets: zip
✔ Making for target: zip - On platform: darwin - For arch: x64
```

Electron Forge creates the `out` folder where your package will be located:

```plain
// Example for macOS
out/
├── out/make/zip/darwin/x64/my-electron-app-darwin-x64-1.0.0.zip
├── ...
└── out/my-electron-app-darwin-x64/my-electron-app.app/Contents/MacOS/my-electron-app
```

There are also other tools you can use to distribute your application:

- [electron-forge](https://github.com/electron-userland/electron-forge)
- [electron-builder](https://github.com/electron-userland/electron-builder)
- [electron-packager](https://github.com/electron/electron-packager)

:::tip Further reading 📚
It is recommended to read their documentation to know how to rebrand and sign the
executable, change the icons, etc.

You should also read all the documents under the "Distribution" category in the sidebar.
:::

## Manual distribution

If you prefer the manual approach, there are 2 ways to distribute your application:

- With prebuilt binaries
- With an app source code archive

### With prebuilt binaries

To distribute your app manually, you need to download Electron's [prebuilt
binaries](https://github.com/electron/electron/releases). Next, the folder
containing your app should be named `app` and placed in Electron's resources
directory as shown in the following examples.

:::note
The location of Electron's prebuilt binaries is indicated
with `electron/` in the examples below.
:::

_On macOS:_

```plain
electron/Electron.app/Contents/Resources/app/
├── package.json
├── main.js
└── index.html
```

_On Windows and Linux:_

```plain
electron/resources/app
├── package.json
├── main.js
└── index.html
```

Then execute `Electron.app` on macOS, `electron` on Linux, or `electron.exe`
on Windows, and Electron will start as your app. The `electron` directory
will then be your distribution to deliver to users.

### With an app source code archive

Instead of shipping your app by copying all of its source files, you can
package your app into an [asar] archive to improve the performance of reading
files on platforms like Windows, if you are not already using a bundler such
as Parcel or Webpack.

To use an `asar` archive to replace the `app` folder, you need to rename the
archive to `app.asar`, and put it under Electron's resources directory like
below, and Electron will then try to read the archive and start from it.

_On macOS:_

```plaintext
electron/Electron.app/Contents/Resources/
└── app.asar
```

_On Windows and Linux:_

```plaintext
electron/resources/
└── app.asar
```

You can find more details on how to use `asar` in the
[`electron/asar` repository][asar].

### Rebranding with downloaded binaries

After bundling your app into Electron, you will want to rebrand Electron
before distributing it to users.

- **Windows:** You can rename `electron.exe` to any name you like, and edit
  its icon and other information with tools like [rcedit](https://github.com/electron/rcedit).
- **Linux:** You can rename the `electron` executable to any name you like.
- **macOS:** You can rename `Electron.app` to any name you want, and you also have to rename
  the `CFBundleDisplayName`, `CFBundleIdentifier` and `CFBundleName` fields in the
  following files:

  - `Electron.app/Contents/Info.plist`
  - `Electron.app/Contents/Frameworks/Electron Helper.app/Contents/Info.plist`

  You can also rename the helper app to avoid showing `Electron Helper` in the
  Activity Monitor, but make sure you have renamed the helper app's executable
  file's name.

  The structure of a renamed app would be like:

```plain
MyApp.app/Contents
├── Info.plist
├── MacOS/
│   └── MyApp
└── Frameworks/
    └── MyApp Helper.app
        ├── Info.plist
        └── MacOS/
            └── MyApp Helper
```

:::note
it is also possible to rebrand Electron by changing the product name and
building it from source. To do this you need to set the build argument
corresponding to the product name (`electron_product_name = "YourProductName"`)
in the `args.gn` file and rebuild.

Keep in mind this is not recommended as setting up the environment to compile
from source is not trivial and takes significant time.
:::

## Distributing via the OS stores

Once you have your packed application, you can put the file on a place accessible
to your users (for example, a web server), or you can use the platform's store.

There are some considerations and steops when doing the later. You can find more
information in the following links:

- [Mac App Store Submission Guide]
- [Windows Store Guide]
- [Snapcraft Guide (Linux)]

[asar]: https://github.com/electron/asar
[mac app store submission guide]: mac-app-store-submission-guide.md
[snapcraft guide (linux)]: snapcraft.md
[windows store guide]: windows-store-guide.md

<!-- Tutorial links -->

[prerequisites]: tutorial-prerequisites.md
[scaffolding]: tutorial-scaffolding.md
[main-renderer]: ./tutorial-main-renderer.md
[features]: ./tutorial-adding-features.md
[application distribution]: application-distribution.md
[code signing]: code-signing.md
[updates]: updates.md

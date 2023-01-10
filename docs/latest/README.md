---
title: "Official Guides"
description: "Please make sure that you use the documents that match your Electron version. The version number should be a part of the page URL. If it's not, you are probably using the documentation of a development branch which may contain API changes that are not compatible with your Electron version. To view older versions of the documentation, you can browse by tag on GitHub by opening the \"Switch branches/tags\" dropdown and selecting the tag that matches your version."
slug: README
hide_title: false
---

# Official Guides

Please make sure that you use the documents that match your Electron version.
The version number should be a part of the page URL. If it's not, you are
probably using the documentation of a development branch which may contain API
changes that are not compatible with your Electron version. To view older
versions of the documentation, you can
[browse by tag](https://github.com/electron/electron/tree/v1.4.0)
on GitHub by opening the "Switch branches/tags" dropdown and selecting the tag
that matches your version.

## FAQ

There are questions that are asked quite often. Check this out before creating
an issue:

* [Electron FAQ](latest/faq.md)

## Guides and Tutorials

### Getting started

* [Introduction](latest/tutorial/introduction.md)
* [Quick Start](latest/tutorial/quick-start.md)
* [Process Model](latest/tutorial/process-model.md)

### Learning the basics

* Adding Features to Your App
  * [Notifications](latest/tutorial/notifications.md)
  * [Recent Documents](latest/tutorial/recent-documents.md)
  * [Application Progress](latest/tutorial/progress-bar.md)
  * [Custom Dock Menu](latest/tutorial/macos-dock.md)
  * [Custom Windows Taskbar](latest/tutorial/windows-taskbar.md)
  * [Custom Linux Desktop Actions](latest/tutorial/linux-desktop-actions.md)
  * [Keyboard Shortcuts](latest/tutorial/keyboard-shortcuts.md)
  * [Offline/Online Detection](latest/tutorial/online-offline-events.md)
  * [Represented File for macOS BrowserWindows](latest/tutorial/represented-file.md)
  * [Native File Drag & Drop](latest/tutorial/native-file-drag-drop.md)
  * [Offscreen Rendering](latest/tutorial/offscreen-rendering.md)
  * [Dark Mode](latest/tutorial/dark-mode.md)
  * [Web embeds in Electron](latest/tutorial/web-embeds.md)
* [Boilerplates and CLIs](latest/tutorial/boilerplates-and-clis.md)
  * [Boilerplate vs CLI](latest/tutorial/boilerplates-and-clis.md#boilerplate-vs-cli)
  * [Electron Forge](latest/tutorial/boilerplates-and-clis.md#electron-forge)
  * [electron-builder](latest/tutorial/boilerplates-and-clis.md#electron-builder)
  * [electron-react-boilerplate](latest/tutorial/boilerplates-and-clis.md#electron-react-boilerplate)
  * [Other Tools and Boilerplates](latest/tutorial/boilerplates-and-clis.md#other-tools-and-boilerplates)

### Advanced steps

* Application Architecture
  * [Using Native Node.js Modules](latest/tutorial/using-native-node-modules.md)
  * [Performance Strategies](latest/tutorial/performance.md)
  * [Security Strategies](latest/tutorial/security.md)
  * [Process Sandboxing](latest/tutorial/sandbox.md)
* [Accessibility](latest/tutorial/accessibility.md)
  * [Manually Enabling Accessibility Features](latest/tutorial/accessibility.md#manually-enabling-accessibility-features)
* [Testing and Debugging](latest/tutorial/application-debugging.md)
  * [Debugging the Main Process](latest/tutorial/debugging-main-process.md)
  * [Debugging with Visual Studio Code](latest/tutorial/debugging-vscode.md)
  * [Testing on Headless CI Systems (Travis, Jenkins)](latest/tutorial/testing-on-headless-ci.md)
  * [DevTools Extension](latest/tutorial/devtools-extension.md)
  * [Automated Testing](latest/tutorial/automated-testing.md)
  * [REPL](latest/tutorial/repl.md)
* [Distribution](latest/tutorial/application-distribution.md)
  * [Code Signing](latest/tutorial/code-signing.md)
  * [Mac App Store](latest/tutorial/mac-app-store-submission-guide.md)
  * [Windows Store](latest/tutorial/windows-store-guide.md)
  * [Snapcraft](latest/tutorial/snapcraft.md)
  * [ASAR Archives](latest/tutorial/asar-archives.md)
* [Updates](latest/tutorial/updates.md)
* [Getting Support](latest/tutorial/support.md)

## Detailed Tutorials

These individual tutorials expand on topics discussed in the guide above.

* [Installing Electron](latest/tutorial/installation.md)
  * [Proxies](latest/tutorial/installation.md#proxies)
  * [Custom Mirrors and Caches](latest/tutorial/installation.md#custom-mirrors-and-caches)
  * [Troubleshooting](latest/tutorial/installation.md#troubleshooting)
* Electron Releases & Developer Feedback
  * [Versioning Policy](latest/tutorial/electron-versioning.md)
  * [Release Timelines](latest/tutorial/electron-timelines.md)

---

* [Glossary of Terms](latest/glossary.md)

## API References

* [Synopsis](latest/api/synopsis.md)
* [Process Object](latest/api/process.md)
* [Supported Command Line Switches](latest/api/command-line-switches.md)
* [Environment Variables](latest/api/environment-variables.md)
* [Chrome Extensions Support](latest/api/extensions.md)
* [Breaking API Changes](latest/breaking-changes.md)

### Custom DOM Elements:

* [`File` Object](latest/api/file-object.md)
* [`<webview>` Tag](latest/api/webview-tag.md)
* [`window.open` Function](latest/api/window-open.md)

### Modules for the Main Process:

* [app](latest/api/app.md)
* [autoUpdater](latest/api/auto-updater.md)
* [BrowserView](latest/api/browser-view.md)
* [BrowserWindow](latest/api/browser-window.md)
* [contentTracing](latest/api/content-tracing.md)
* [dialog](latest/api/dialog.md)
* [globalShortcut](latest/api/global-shortcut.md)
* [inAppPurchase](latest/api/in-app-purchase.md)
* [ipcMain](latest/api/ipc-main.md)
* [Menu](latest/api/menu.md)
* [MenuItem](latest/api/menu-item.md)
* [MessageChannelMain](latest/api/message-channel-main.md)
* [MessagePortMain](latest/api/message-port-main.md)
* [net](latest/api/net.md)
* [netLog](latest/api/net-log.md)
* [nativeTheme](latest/api/native-theme.md)
* [Notification](latest/api/notification.md)
* [powerMonitor](latest/api/power-monitor.md)
* [powerSaveBlocker](latest/api/power-save-blocker.md)
* [protocol](latest/api/protocol.md)
* [screen](latest/api/screen.md)
* [session](latest/api/session.md)
* [ShareMenu](latest/api/share-menu.md)
* [systemPreferences](latest/api/system-preferences.md)
* [TouchBar](latest/api/touch-bar.md)
* [Tray](latest/tutorial/tray.md)
* [webContents](latest/api/web-contents.md)
* [webFrameMain](latest/api/web-frame-main.md)

### Modules for the Renderer Process (Web Page):

* [contextBridge](latest/api/context-bridge.md)
* [ipcRenderer](latest/api/ipc-renderer.md)
* [webFrame](latest/api/web-frame.md)

### Modules for Both Processes:

* [clipboard](latest/api/clipboard.md)
* [crashReporter](latest/api/crash-reporter.md)
* [desktopCapturer](latest/api/desktop-capturer.md)
* [nativeImage](latest/api/native-image.md)
* [shell](latest/api/shell.md)

## Development

See [development/README.md](latest/development/README.md)

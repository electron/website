---
title: Introducing Window State Persistence (GSoC 2025)
date: 2025-11-24T00:00:00.000Z
authors: nilayarya
slug: introducing-window-state-persistence
tags: [feature, community]
---

Electron applications can now automatically save and restore window states across sessions.

---

Hi 👋, I'm Nilay Arya, a 2025 [Google Summer of Code (GSoC)](https://summerofcode.withgoogle.com/) contributor to Electron.

Over the summer, I implemented a simple but powerful constructor option called `windowStatePersistence` in Electron's [`BaseWindowConstructorOptions`](/docs/latest/api/structures/base-window-options). This feature automatically saves and restores window positions, sizes, and display modes.

![Window State Persistence GIF](/assets/img/save-restore-window.gif)

## Motivation

Window state persistence represents a core functionality that many production Electron apps implement, and by elevating it to a first-class feature, Electron acknowledges its essential nature while providing a standardized approach directly in the framework. With less than three additional lines of code, developers can now enable reliable window state persistence, saving them significant time and implementation efforts.

## API Design

A new property called `name` was introduced to the [`BaseWindowConstructorOptions`](/docs/latest/api/structures/base-window-options) to uniquely identify windows and their persisted state.

`windowStatePersistence` at its simplest:

```javascript
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  name: 'main-window',
  windowStatePersistence: true,
});
```

That's it. The window now saves and restores its bounds and display mode across application restarts.

For more control, you can configure exactly what gets restored:

```javascript
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  name: 'main-window',
  windowStatePersistence: {
    bounds: true,
    displayMode: false,
  },
});
```

For the complete technical specification and design rationale, see the [RFC document](https://github.com/electron/rfcs/blob/main/text/0016-save-restore-window-state.md).

## Implementation

I utilized [Chromium's PrefService](https://source.chromium.org/chromium/chromium/src/+/main:components/prefs/pref_service.h) implementation to save/restore window state (bounds, position, fullscreen state, etc.) as planned out in the [proposal](https://github.com/electron/rfcs/blob/main/text/0016-save-restore-window-state.md). I wrote the documentation and added 100% test coverage including a native module for multi-monitor testing on macOS!

For those of you who work on Electron and need to test features on multiple monitors, you can now use the Swift native module `@electron-ci/virtual-display` on macOS. It leverages macOS CoreGraphics APIs to programmatically create and destroy virtual displays, enabling automated testing of multi-monitor scenarios without requiring physical hardware.

## Try It Now

You can quickly try out the new API using [Electron Fiddle](https://electronjs.org/fiddle):

<!-- markdownlint-disable MD029 -->

1. Load the [demonstration gist](https://gist.github.com/nilayarya/ab802bea77a6079a3fb32a748448c9af)

2. Inside Settings->Execution, enable **"Do not delete user data directories"**

<div style={{marginLeft: '20px'}}>
![Settings image](/assets/img/fiddle-setting.jpeg)
</div>

3. Run the application, move and resize the window, then close it

4. Run it again—the window returns to where you left it

<!-- markdownlint-enable MD029 -->

## Future Possibilities

While the current implementation covers most use cases, there are several areas for potential enhancement. The RFC addresses some of these in the [future possibilities](https://github.com/electron/rfcs/blob/main/text/0016-save-restore-window-state.md#future-possibilities) section.

We're eager to hear from the community about your experience with this feature and what additional functionality would be valuable.

## Conclusion

Implementing this feature has been a rewarding experience, and I'm excited to see this feature reduce boilerplate across the Electron ecosystem.

I want to sincerely thank my mentors—Erick Zhao ([@erickzhao](https://github.com/erickzhao)), Keeley Hammond ([@VerteDinde](https://github.com/VerteDinde)), David Sanders ([@dsanders11](https://github.com/dsanders11)), and George Xu ([@georgexu99](https://github.com/georgexu99)).

...and everyone in the Electron community who provided feedback during the RFC process.

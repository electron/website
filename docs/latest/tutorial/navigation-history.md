---
title: "Navigation history"
description: "The NavigationHistory API allows you to manage and interact with the browsing history of your Electron application."
slug: navigation-history
hide_title: false
---

# Navigation History

## Overview
The [NavigationHistory](latest/api/navigation-history.md) API allows you to manage and interact with the browsing history of your Electron application. This powerful feature enables you to create intuitive navigation experiences for your users.

### Accessing NavigationHistory
To use NavigationHistory, access it through the webContents of your BrowserWindow:

```js
const { BrowserWindow } = require('electron')

let mainWindow = new BrowserWindow({ width: 800, height: 600 })
let navigationHistory = mainWindow.webContents.navigationHistory
```
### Key Features
#### Navigating Through History
Easily implement back and forward navigation:

```js
// Go back
if (navigationHistory.canGoBack()) {
  navigationHistory.goBack()
}

// Go forward
if (navigationHistory.canGoForward()) {
  navigationHistory.goForward()
}
```

#### Accessing History Entries
Retrieve and display the user's browsing history:

```js
const entries = navigationHistory.getAllEntries()
entries.forEach(entry => {
  console.log(`${entry.title}: ${entry.url}`)
})
```

#### Navigating to Specific Entries
Allow users to jump to any point in their browsing history:
```js
// Navigate to the 5th entry in the history
navigationHistory.goToIndex(4) 

// Navigate to the 2nd entry from the current position
navigationHistory.goToOffset(2)
```


Here's a full example that you can open with Electron Fiddle:
```fiddle docs/latest/fiddles/native-ui/tray
```
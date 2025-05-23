---
title: Menus
description: Configure cross-platform native OS menus with the Menu API.
slug: menus
hide_title: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocCardList from '@theme/DocCardList';

# Menus

Electron's [Menu](../api/menu.md) class provides a standardized way to create cross-platform native
menus throughout your application.

## Types of menus

The same menu API is used for multiple use cases:

* The **application menu** is the top-level menu for your application. Each app only has a single
  application menu at a time.
* **Context menus** are triggered by the user when right-clicking on a portion of your app's
  interface.
* The **tray menu** is a special context menu triggered when right-clicking on your app's [Tray](../api/tray.md)
  instance.
* On macOS, the **dock menu** is a special context menu triggered when right-clicking on your app's
  icon in the system [Dock](https://support.apple.com/en-ca/guide/mac-help/mh35859/mac).

To learn more about the various types of native menus you can create and how to specify keyboard
shortcut strings (also known as **accelerators**), see the individual guides in this section:

<DocCardList />

## Building menus

Each `Menu` instance is composed of an array of [MenuItem](../api/menu-item.md) objects accessible via
the `menu.items` instance property. Menus can be nested by setting the `item.submenu` property to
another menu.

There are two ways to build a menu: either by directly calling [`menu.append`](../api/menu.md/#menuappendmenuitem)
or by using the static [`Menu.buildFromTemplate`](../api/menu.md#menubuildfromtemplatetemplate)
helper function.

The helper function reduces boilerplate by allowing you to pass a collection of `MenuItem`
constructor options (or instantiated `MenuItem` instances) in a single array rather than having to
append each item in a separate function call.

Below is an example of a minimal application menu:

<Tabs>
  <TabItem value="constructor" label="Constructor">
		```js title='menu.js'
		const submenu = new Menu()
    submenu.append(new MenuItem({ label: 'Hello' }))
    submenu.append(new MenuItem({ type: 'separator' }))
    submenu.append(new MenuItem({ label: 'Electron', type: 'checkbox', checked: true }))

		const menu = new Menu()
		menu.append(new MenuItem({ label: 'Menu', submenu }))
		Menu.setApplicationMenu(menu)
		```
	</TabItem>
  <TabItem value="template" label="Template Helper">
		```js title='menu.js'
		const menu = Menu.buildFromTemplate([{
		  label: 'Menu',
		  submenu: [
		    { label: 'Hello' },
		    { type: 'separator' },
		    { label: 'Electron', type: 'checkbox', checked: true }
		  ]
		}])
		Menu.setApplicationMenu(menu)
		```
	</TabItem>
</Tabs>

> [!IMPORTANT]
> All menu items (except for the `separator` type) must have a label. Labels can either be manually
> defined using the `label` property or inherited from the item's `role`.

### `MenuItem` types

A menu item's type grants it a particular appearance and functionality. Some types are
automatically assigned based on other constructor options:

* By default, menu items have the `normal` type.
* Menu items that contain the `submenu` property will be assigned the `submenu` type.

Other available types, when specified, give special additional properties to the menu item:

* `checkbox` - toggles the `checked` property whenever the menu item is clicked
* `radio` - toggles the `checked` property and turns off that property for all adjacent `radio` items

> [!TIP]
> Adjacent `radio` items are at the same level of submenu and not divided by a separator.
> ```js
>  [
>    { type: 'radio', label: 'Adjacent 1' },
>    { type: 'radio', label: 'Adjacent 2' },
>    { type: 'separator' },
>    { type: 'radio', label: 'Non-adjacent' } // unaffected by the others
>  ]
> ```


### `MenuItem` roles

Roles give `normal` type menu items predefined behaviors.

We recommend specifying the `role` attribute for any menu item that matches a standard role
rather than trying to manually implement the behavior in a `click` function.
The built-in `role` behavior will give the best native experience.

The `label` and `accelerator` values are optional when using a `role` and will
default to appropriate values for each platform.

> [!TIP]
> Role strings are **case-insensitive**. For example, `toggleDevTools`, `toggledevtools`, and
> `TOGGLEDEVTOOLS` are all equivalent roles when defining menu items.

#### Edit roles

* `undo`
* `redo`
* `cut`
* `copy`
* `paste`
* `pasteAndMatchStyle`
* `selectAll`
* `delete`

#### Window roles

* `about` - Trigger a native about panel (custom message box on Window, which does not provide its own).
* `minimize` - Minimize current window.
* `close` - Close current window.
* `quit` - Quit the application.
* `reload` - Reload the current window.
* `forceReload` - Reload the current window ignoring the cache.
* `toggleDevTools` - Toggle developer tools in the current window.
* `togglefullscreen` - Toggle full screen mode on the current window.
* `resetZoom` - Reset the focused page's zoom level to the original size.
* `zoomIn` - Zoom in the focused page by 10%.
* `zoomOut` - Zoom out the focused page by 10%.
* `toggleSpellChecker` - Enable/disable built-in spellchecker.

#### Default menu roles

* `fileMenu` - The submenu is a "File" menu (Close / Quit)
* `editMenu` - The submenu is an "Edit" menu (Undo, Copy, etc.)
* `viewMenu` - The submenu is a "View" menu (Reload, Toggle Developer Tools, etc.)
* `windowMenu` - The submenu is a "Window" menu (Minimize, Zoom, etc.)

#### macOS-only roles

* `hide` - Map to the [`hide`](https://developer.apple.com/documentation/appkit/nsapplication/hide(_:)) action.
* `hideOthers` - Map to the [`hideOtherApplications`](https://developer.apple.com/documentation/appkit/nsapplication/hideotherapplications(_:)) action.
* `unhide` - Map to the [`unhideAllApplications`](https://developer.apple.com/documentation/appkit/nsapplication/unhideallapplications(_:)) action.
* `showSubstitutions` - Map to the [`orderFrontSubstitutionsPanel`](https://developer.apple.com/documentation/appkit/nstextview/orderfrontsubstitutionspanel(_:)) action.
* `toggleSmartQuotes` - Map to the [`toggleAutomaticQuoteSubstitution`](https://developer.apple.com/documentation/appkit/nstextview/toggleautomaticquotesubstitution(_:)) action.
* `toggleSmartDashes` - Map to the [`toggleAutomaticDashSubstitution`](https://developer.apple.com/documentation/appkit/nstextview/toggleautomaticdashsubstitution(_:)) action.
* `toggleTextReplacement` - Map to the [`toggleAutomaticTextReplacement`](https://developer.apple.com/documentation/appkit/nstextview/toggleautomatictextreplacement(_:)) action.
* `startSpeaking` - Map to the `startSpeaking` action.
* `stopSpeaking` - Map to the `stopSpeaking` action.
* `front` - Map to the [`arrangeInFront`](https://developer.apple.com/documentation/appkit/nsapplication/arrangeinfront(_:)) action.
* `zoom` - Map to the `performZoom` action.
* `toggleTabBar` - Map to the `toggleTabBar` action.
* `selectNextTab` - Map to the `selectNextTab` action.
* `selectPreviousTab` - Map to the `selectPreviousTab` action.
* `showAllTabs` - Map to the `showAllTabs` action.
* `mergeAllWindows` - Map to the `mergeAllWindows` action.
* `moveTabToNewWindow` - Map to the `moveTabToNewWindow` action.
* `appMenu` - Whole default "App" menu (About, Services, etc.)
* `services` - The submenu is a ["Services"](https://developer.apple.com/documentation/appkit/nsapplication/1428608-servicesmenu?language=objc) menu. This is only intended for use in the Application Menu and is _not_ the same as the "Services" submenu used in context menus in macOS apps, which is not implemented in Electron.
* `recentDocuments` - The submenu is an "Open Recent" menu.
* `clearRecentDocuments` - Map to the `clearRecentDocuments` action.
<!-- * `window` - The submenu is a "Window" menu. -->
<!-- * `help` - The submenu is a "Help" menu. -->
* `shareMenu` - The submenu is [share menu][ShareMenu]. The `sharingItem` property must also be set to indicate the item to share.

When specifying a `role` on macOS, `label` and `accelerator` are the only
options that will affect the menu item. All other options will be ignored.

> [!NOTE]
> The `enabled` and `visibility` properties are not available for top-level menu items in the tray on macOS.







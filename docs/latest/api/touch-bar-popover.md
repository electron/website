---
title: "Class: TouchBarPopover"
description: "Create a popover in the touch bar for native macOS applications"
slug: touch-bar-popover
hide_title: false
---

## Class: TouchBarPopover

> Create a popover in the touch bar for native macOS applications

Process: [Main](latest/glossary.md#main-process)<br />
_This class is not exported from the `'electron'` module. It is only available as a return value of other methods in the Electron API._

### `new TouchBarPopover(options)`

* `options` Object
  * `label` string (optional) - Popover button text.
  * `icon` [NativeImage](latest/api/native-image.md) (optional) - Popover button icon.
  * `items` [TouchBar](latest/api/touch-bar.md) - Items to display in the popover.
  * `showCloseButton` boolean (optional) - `true` to display a close button
    on the left of the popover, `false` to not show it. Default is `true`.

### Instance Properties

The following properties are available on instances of `TouchBarPopover`:

#### `touchBarPopover.label`

A `string` representing the popover's current button text. Changing this value immediately updates the
popover in the touch bar.

#### `touchBarPopover.icon`

A `NativeImage` representing the popover's current button icon. Changing this value immediately updates the
popover in the touch bar.

---
title: "IpcMainInvokeEvent Object extends `Event`"
description: ""
slug: ipc-main-invoke-event
hide_title: false
---

# IpcMainInvokeEvent Object extends `Event`

* `processId` Integer - The internal ID of the renderer process that sent this message
* `frameId` Integer - The ID of the renderer frame that sent this message
* `sender` [WebContents](latest/api/web-contents.md) - Returns the `webContents` that sent the message
* `senderFrame` [WebFrameMain](latest/api/web-frame-main.md) _Readonly_ - The frame that sent this message

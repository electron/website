---
title: "IpcMainEvent Object extends `Event`"
description: ""
slug: ipc-main-event
hide_title: false
---

# IpcMainEvent Object extends `Event`

* `processId` Integer - The internal ID of the renderer process that sent this message
* `frameId` Integer - The ID of the renderer frame that sent this message
* `returnValue` any - Set this to the value to be returned in a synchronous message
* `sender` [WebContents](latest/api/web-contents.md) - Returns the `webContents` that sent the message
* `senderFrame` [WebFrameMain](latest/api/web-frame-main.md) _Readonly_ - The frame that sent this message
* `ports` [MessagePortMain](latest/api/message-port-main.md)[] - A list of MessagePorts that were transferred with this message
* `reply` Function - A function that will send an IPC message to the renderer frame that sent the original message that you are currently handling.  You should use this method to "reply" to the sent message in order to guarantee the reply will go to the correct process and frame.
  * `channel` string
  * `...args` any[]

---
title: "PreloadScriptRegistration Object"
description: ""
slug: preload-script-registration
hide_title: false
---

# PreloadScriptRegistration Object

* `type` string - Context type where the preload script will be executed.
  Possible values include `frame` or `service-worker`.
* `id` string (optional) - Unique ID of preload script. Defaults to a random UUID.
* `filePath` string - Path of the script file. Must be an absolute path.

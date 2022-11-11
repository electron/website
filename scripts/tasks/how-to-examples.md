---
title: 'Examples Overview'
description: 'A set of examples for common Electron features'
slug: examples
hide_title: false
---

# Examples Overview

In this section, we have collected a set of guides for common features
that you may want to implement in your Electron application. Each guide
contains a practical example in a minimal, self-contained example app.
The easiest way to run these examples is by downloading [Electron Fiddle][fiddle].

Once Fiddle is installed, you can press on the "Open in Fiddle" button that you
will find below code samples like the following one:

```fiddle docs/fiddles/quick-start
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
```

## How to...?

You can find the full list of "How to?" in the sidebar. If there is
something that you would like to do that is not documented, please join
our [Discord server][] and let us know!

[discord server]: https://discord.com/invite/electronjs
[fiddle]: https://www.electronjs.org/fiddle

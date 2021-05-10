---
title: 'Examples'
description: 'Electron examples directly for you to use'
slug: examples
hide_title: false
---

# Examples

In this section we have documented some of the most popular things developers do
in their Electron applications. The easiest way to run the examples is using
[Fiddle][fiddle]. To do this, first you will have to download and install the
right version for your Operating System from [here][fiddle].

Once you have done this, you can press on the "Open in Fiddle" button that you
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

The following are all the "How to?" available at the moment (you can access them
from the sidebar as well). If there is something that you would like to do that
is not documented, please join our [discord server][] and let us know!

[discord server]: https://discord.com/invite/electron
[fiddle]: https://www.electronjs.org/fiddle

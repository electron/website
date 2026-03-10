---
title: 'Tech Talk: How Electron went Wayland-native (and how it affects your apps)'
date: 2026-03-10T00:00:00.000Z
authors:
  - name: mitchchn
    url: 'https://github.com/mitchchn'
    image_url: 'https://github.com/mitchchn.png?size=96'
slug: tech-talk-wayland
tags: [techtalk, internals]
---

_Tech talks are a new blog post series where we share glimpses into our work on Electron. If you find this work interesting, please consider [contributing](https://github.com/electron/electron/)!_

When Electron switched to the [Wayland](https://wayland.freedesktop.org/) display protocol last fall, most people didn't even notice.

That's likely a good thing. Major Linux distributions have already adopted Wayland for their default graphical sessions, and both the KDE Plasma and GNOME desktop environments are in the process of [dropping X11 support](https://blogs.kde.org/2025/11/26/going-all-in-on-a-wayland-future/) [completely](https://www.phoronix.com/news/GNOME-50-Alpha/).

But a platform migration isn't complete without apps, and the Linux app ecosystem went through a rapid Wayland transition last August after Chromium [turned on Wayland support by default](https://chromium-review.googlesource.com/c/chromium/src/+/6819616). That move brought along the Electron framework and dozens of Linux desktop apps built on top of it.

## The third impact: Electron goes Wayland-native

Wayland is supported out of the box in [Electron 38.2](https://releases.electronjs.org/release/v38.2.0) and newer. As long as your apps are up-to-date, it just works. (If you were previously launching your Electron apps with very long commands like `CONFUSING_OZONE_VARIABLE --ozone-platform=wayland`, you no longer need to do that.)

The Chromium and Electron projects have been [working on Wayland support](https://github.com/electron/electron/pull/26022) for more than half a decade. But until recently, Chrome and Electron apps continued to use X11 by default, even when launched in a Wayland session. This wasn’t a big issue, since X11 apps still work fairly well on Wayland by running inside an invisible X server called Xwayland.

![Screenshot of an Electron app running in X11 compatibility mode (XWayland) in a Wayland session on Ubuntu](/assets/img/blog/tech-talk-wayland/xwayland.png)

But running apps through a compatibility layer is not the same as running them directly on Wayland. On Wayland, there’s less sitting between your app and the compositor, so there's lower overhead and much stronger isolation between applications. Modern Wayland compositors also let apps take advantage of newer platform and display features like variable refresh rates, fractional scaling, and HDR.

![Screenshot of an Electron app running natively on Wayland, demonstrating support for wide gamut color and HDR](/assets/img/blog/tech-talk-wayland/hdr.png)

These are all good reasons for Electron apps to make the switch. In late September, Electron followed Chromium’s lead and began [defaulting to Wayland](https://www.electronjs.org/blog/electron-38-0#removed-electron_ozone_platform_hint-environment-variable). As apps began to update, people who had been “using Wayland” without issues for months or years started to find out what it was really like to experience their apps on Wayland for the first time.

## Wayland’s house, Wayland’s rules

Supporting Wayland required [dozens of changes](https://github.com/electron/electron/pulls?q=is%3Apr+wayland) throughout Electron, from Chromium internals to developer-facing APIs. It also required a different way of thinking about what Electron apps are able to do. Wayland reconsiders assumptions made by older systems and asks whether desktop apps should be able to:

- Take focus away from other apps
- View and interact with windows from other apps
- Respond to mouse and keyboard input when not focused
- Choose where to position their own windows on the screen (and which physical monitor to appear on)
- Resize their windows at any time

Wayland’s answer to these questions is essentially “no.” When you open a window on Wayland, the compositor — not the app developer — decides where it goes. Apps can't change their size, position, or focus without user input, and they can only interact with the rest of the desktop through optional [protocol extensions](https://wayland.app/protocols/) and [XDG portals](https://flatpak.github.io/xdg-desktop-portal/).

These rules are understandable; no one likes it when misbehaving apps steal focus or draw halfway off the screen. But for a cross-platform framework like Electron, Wayland's design philosophy makes it harder for developers to achieve consistency.

In practice, Electron apps have more restrictions on Wayland than they do on X11 and other platforms. Some widely used APIs, like [`BrowserWindow.setPosition(x, y)`](https://www.electronjs.org/docs/latest/api/base-window#winsetpositionx-y-animate), simply don't work on Wayland.

Exact outcomes can vary by compositor. On KDE (KWin), for example, an app that tries to focus one of its windows with [`BrowserWindow.focus()`](https://www.electronjs.org/docs/latest/api/browser-window#winfocus) will flash its icon in the panel instead.

![Screenshot of Slack flashing its app icon in the panel on KDE instead of receiving focus](/assets/img/blog/tech-talk-wayland/focus.png)

On the other hand, some capabilities work better on Wayland, especially around colors, transparency, and hardware-accelerated rendering. APIs like [`setOpacity(n)`](https://www.electronjs.org/docs/latest/api/base-window#winsetopacityopacity-windows-macos) do not currently work on Linux, but they are now more feasible to support.

In some areas, Wayland gives developers more flexibility, but also more responsibility, than before. An example that directly affects end users is client-side decorations (CSD).

## Understanding CSD, or when a window isn’t a window

The Wayland protocol is very lightweight, and its simplicity extends to the way it draws window frames. On X11, the window manager typically supplies a window’s title bar and frame decorations. But when you create a window ([`xdg_toplevel`](https://wayland.app/protocols/xdg-shell)) on Wayland, all you get back from the compositor is a plain rectangle.

![Screenshot of a blank app window on Wayland with no decorations. It's just a white rectangle.](/assets/img/blog/tech-talk-wayland/waylandnocsd.png)

That rectangle is a powerful canvas. On a modern compositor like GNOME’s Mutter, it’s triple-buffered and GPU-accelerated. But if you want any of the trimmings that users might expect on their windows — title bar buttons, drop shadows, even resize handles —  you have to add them all yourself. This requirement is called client-side decorations (CSD), and it’s one of the major differences between X11 and Wayland.

Electron already had some support for client-side decorations, provided by a class called `ClientFrameViewLinux` which uses GTK to paint convincing native window frames. While these look very similar to the ones GNOME used to provide on X11, they are produced entirely in-framework.

![Screenshot of a ClientFrameViewLinux with client-side decorations on GNOME](/assets/img/blog/tech-talk-wayland/clientframeviewlinux.png)

Electron's client-side window frames are "native" in the sense that they use GTK and derive style information from the platform, but they are not an exact match for the server-side decorations (SSD) users may remember from X11. With CSD, the details are implemented by each app or framework, so apps from different frameworks can look noticeably different side by side, right down to their drop shadows and corner shapes. 

![Screenshot of four apps with CSD from different frameworks (clockwise from top-left: Adwaita, Qt, Electron, and Firefox)](/assets/img/blog/tech-talk-wayland/csdcomparison.png)

The differences are usually minor, but when CSD is completely absent from a window, the result can be visually jarring.

Many popular Electron apps, including VS Code, Obsidian, and Discord, use [frameless windows](https://www.electronjs.org/docs/latest/tutorial/custom-window-styles) with [custom title bars](https://www.electronjs.org/docs/latest/tutorial/custom-title-bar). Prior to [Electron 41](https://www.electronjs.org/blog/electron-41-0), frameless windows did not support CSD at all. Even if these apps did not need full GTK title bars, they still required the framework to provide CSD to avoid looking like flat, shadowless rectangles on Wayland.

![Screenshot of VS Code on GNOME with no CSD](/assets/img/blog/tech-talk-wayland/vscodenocsd.png)

Improving coverage for CSD was a task with framework-wide consequences. The biggest obstacle involved window sizes and how to measure them accurately. Electron already manages two different kinds of window boundaries:

- **“window bounds”**, the size of the opaque window, including its titlebar, menubar, and frame.
- **“content bounds”**, the size of the internal web view which hosts the app’s web content.

Both values can be controlled independently by app developers. The framework converts between them internally, applying constraints and resolving any conflicts.

![Diagram of an Electron app's window and content bounds without CSD](/assets/img/blog/tech-talk-wayland/bounds.png)

But to have full coverage for CSD, Electron also needed to keep track of a new kind of boundary:

- “widget bounds”, the size of the underlying transparent surface which draws everything inside of it, including the window frame, but also external decorations like drop shadows and resize targets.

Effectively, CSD makes it so that the “real” window (represented internally as a Chromium “accelerated widget”) is larger than the opaque window which developers and users see and interact with. That part — the “logical” window — is inset inside the transparent widget. So a window that visibly measures 800x600 needs to be set inside a larger, transparent window that might measure something like 844x644 (depending on the GTK theme).

![Diagram of an Electron app's full CSD bounds, including the transparent widget surrounding the window](/assets/img/blog/tech-talk-wayland/csdbounds.png)

All this complexity needs to be managed throughout the window lifecycle and across state changes. It also needs to be abstracted from other parts of the Electron API and app developers, who are generally not thinking about the extents of invisible resize targets when they set their app's dimensions.

The good news: much of this was sorted out between last September and March, and as a result, Electron 41 supports CSD on Wayland in all window configurations, including frameless windows with [Window Controls Overlay](https://www.electronjs.org/docs/latest/api/structures/base-window-options).

## What’s next

Wayland is an everyday reality for Linux users in 2026, so a great Wayland experience is now just a part of what it means to support Linux.

Now that the hardest work is behind us, Wayland opens up new possibilities for Electron apps. CSD could provide developers with new ways to customize window frames and integrate them seamlessly with both their web content and the platform. One feature on my own shortlist is rounded corners.

![Screenshot of a frameless window with rounded corners (not currently possible in Electron, but soon?)](/assets/img/blog/tech-talk-wayland/roundedcorners.png)

Electron reached an important milestone last month with the creation of a [Wayland test job in CI](https://github.com/electron/electron/pull/49908). Not every existing test has been ported over, but it’s now much easier to catch regressions.

The framework is only part of the story. If you develop an Electron app that you haven’t thoroughly tested on Linux in a while (even as recently as last fall), give it a spin with Electron 41+ on a modern Linux distribution like Ubuntu 25.10 or Fedora 43. You may discover changes you could make to accommodate Wayland's unique constraints. Some differences are covered in the [Electron documentation](https://www.electronjs.org/docs/latest/api/browser-window), but the best way to understand the new environment is to use it.

And if you’d like to see faster progress and support for more platform features, consider [becoming a contributor](https://www.electronjs.org/docs/latest/development/build-instructions-gn). Like Linux itself, Electron is a community-run [free software project](https://openjsf.org/blog/electron-joins-the-openjs-foundation) that’s open to everyone.

We're actively looking for Linux contributors and maintainers. Electron powers many of the most popular desktop apps across platforms, so getting involved is a great way to help make desktop Linux even more viable for more people.

We're actively looking for Linux contributors and maintainers. Electron powers many of the most popular desktop apps across platforms, so getting involved is a great way to help make desktop Linux even more viable for more people.

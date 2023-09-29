---
title: 'Breach to Barrier: Strengthening Apps with the Sandbox'
date: 2023-09-29T00:00:00.000Z
authors:
  - name: felixrieseberg
    url: 'https://github.com/felixrieseberg'
    image_url: 'https://github.com/felixrieseberg.png?size=96'
slug: breach-to-barrier
---

It’s been more than a week since [CVE-2023-4863: Heap buffer overflow in WebP](https://chromereleases.googleblog.com/2023/09/stable-channel-update-for-desktop_11.html) was made public, leading to a flurry of new releases of software rendering `webp` images: macOS, iOS, Chrome, Firefox, and various Linux distributions all received updates. This followed investigations by Citizen Lab, discovering that an iPhone used by a “Washington DC-based civil society organization” was under attack using a zero-click exploit within iMessage.

Electron, too, spun into action and released new versions the same day: If your app renders any user-provided content, you should update your version of Electron - v27.0.0-beta.2, v26.2.1, v25.8.1, v24.8.3, and v22.3.24 all contain a fixed version of `libwebp`, the library responsible for rendering `webp` images.

Now that we are all freshly aware that an interaction as innocent as “rendering an image” is a potentially dangerous activity, we want to use this opportunity to remind everyone that Electron comes with a process sandbox that will limit the blast radius of the next big attack — whatever it may be.

The sandbox was available ever since Electron v1 and enabled by default in v20, but we know that many apps (especially those that have been around for a while) may have a `sandbox: false` somewhere in their code – or a `nodeIntegration: true`, which equally disables the sandbox when there is no explicit `sandbox` setting. That’s understandable: If you’ve been with us for a long time, you probably enjoyed the power of throwing a `require("child_process")` or `require("fs")` into the same code that runs your HTML/CSS.

Before we talk about _how_ you migrate to the sandbox, let’s first discuss _why_ you want it.

The sandbox puts a hard cage around all renderer processes, ensuring that no matter what happens inside, code is executed inside a restricted environment. As a concept, it's a lot older than Chromium, and provided as a feature by all major operating systems. Electron's and Chromium's sandbox build on top of these system features. Even if you never display user-generated content, you should consider the possibility that your renderer might get compromised: Scenarios as sophisticated as supply chain attacks and as simple as little bugs can lead to your renderer doing things you didn't fully intend for it to do.

The sandbox makes that scenario a lot less scary: A process inside gets to freely use CPU cycles and memory — that’s it. Processes cannot write to disk or display their own windows. In the case of our `libwep` bug, the sandbox makes sure that an attacker cannot install or run malware. In fact, in the case of the original Pegasus attack on the employee’s iPhone, the attack specifically targeted a non-sandboxed image process to gain access to the phone, first breaking out of the boundaries of the normally sandboxed iMessage. When a CVE like the one in this example is announced, you still have to upgrade your Electron apps to a secure version — but in the meantime, the amount of damage an attacker can do is limited dramatically.

Migrating a vanilla Electron application from `sandbox: false` to `sandbox: true` is an undertaking. I know, because even though I have personally written the first draft of the [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security), I have not managed to migrate one of my own apps to use it. That changed this weekend, and I recommend that you change it, too.

![Don’t be scared by the number of line changes, most of it is in `package-lock.json`](/assets/img/breach-to-barrier.png)

There are two things you need to tackle:

1. If you’re using Node.js code in either `preload` scripts or the actual `WebContents`, you need to move all that Node.js interaction to the main process (or, if you are fancy, a utility process). Given how powerful renderers have become, chances are high that the vast majority of your code doesn’t really need refactoring.

   Consult our documentation on [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc). In my case, I moved a lot of code and wrapped it in `ipcRenderer.invoke()` and `ipcMain.handle()`, but the process was straightforward and quickly done. Be a little mindful of your APIs here - if you build an API called `executeCodeAsRoot(code)`, the sandbox won't protect your users much.

2. Since enabling the sandbox disables Node.js integration in your preload scripts, you can no longer use `require("../my-script")`. In other words, your preload script needs to be a single file.

   There are multiple ways to do that: Webpack, esbuild, parcel, and rollup will all get the job done. I used [Electron Forge’s excellent Webpack plugin](https://www.electronforge.io/config/plugins/webpack), users of the equally popular `electron-builder` can use [`electron-webpack`](https://webpack.electron.build/).

All in all, the entire process took me around four days — and that includes a lot of scratching my head at how to wrangle Webpack’s massive power, since I decided to use the opportunity to refactor my code in plenty of other ways, too.

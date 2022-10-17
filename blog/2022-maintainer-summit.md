---
title: Maintainer Summit 2022 Recap
date: 2022-10-13T00:00:00.000Z
authors:
  - name: erickzhao
    url: 'https://github.com/erickzhao'
    image_url: 'https://github.com/erickzhao.png?size=96'
slug: maintainer-summit-2022-recap
---

# Maintainer Summit 2022 Recap

Last month, Electron’s maintainer group met up in Vancouver, Canada to discuss the direction of the
project for 2023 and beyond. Over four days in a conference room, core maintainers and invited
collaborators discussed new initiatives, maintenance pain points, and general project health.

<figure>
  <img src="/assets/img/2022-maintainer-summit.jpg"/>
  <figcaption align="center">
    Group Photo! Taken by <a href="https://github.com/groundwater">@groundwater</a>.
  </figcaption>
</figure>

Going forward, the team will still be fully dedicated to releasing regular and rapid
Chromium upgrades, fixing bugs, and making Electron more secure and performant for everyone.
We also have a few exciting projects in the works we would love to share with
the community!

## Transformative new APIs

Major API proposals in the Electron project that require consensus go through a Request for Comments
(RFC) process, which gets reviewed by members of our API Working Group.

This year, we have driven forward two major proposals that have the potential to unlock a new
dimension of capabilities for Electron apps. These proposals are highly experimental, but here’s a
sneak peek of what to expect! 

### New native addon enhancements (C APIs)

This proposal outlines a new layer of Electron C APIs that will allow app developers to write their
own Native Node Addons that interface with Electron’s internal resources, similar to Node’s
own Node-API. More information about the proposed new API [can be found here](https://github.com/electron/governance/blob/main/wg-api/spec-documents/electron-c-apis.md).

#### Example: Supercharging apps with Chromium resources

Many Electron apps maintain their own forks to interact directly with Chromium internals that would
otherwise be inaccessible with vanilla (unmodified) Electron. By exposing these resources in the C
API layer, this code can instead live as a native module alongside Electron, potentially reducing
app developer maintenance burden.

### Exposing Chromium’s UI layer (Views API)

Under the hood, the non-website parts of Chrome’s user interface (UI), such as toolbars, tabs, or
buttons, are built with a framework called Views. The Views API proposal introduces parts of this
framework as JavaScript classes in Electron, with the eventual goal of allowing developers to create
non-web UI elements to their Electron applications. This will prevent apps from having to hack
together web contents.

The groundwork to make this new set of APIs possible is currently in progress. Here are a few of the
first things you can expect in the near future.

#### Example: Refactoring the window model with `WebContentsView`

Our first planned change is to expose Chrome’s WebContentsView to Electron’s API surface, which will
be the successor to our existing BrowserView API (which, despite the name, is Electron-specific code
unrelated to Chromium Views). With WebContentsView exposed, we will have a reusable View object that
can display web contents, opening the door to making the BrowserWindow class pure JavaScript and
eliminating even more code complexity.

Although this change doesn’t provide a lot of new functionality to app developers, it is a large
refactor that eliminates a lot of code under the hood, simplifying Chromium upgrades and reducing
the risk of new bugs appearing between major versions.

If you’re an Electron developer using BrowserViews in your app: don’t worry, we haven’t forgotten
about you! We plan on making the existing BrowserView class a shim for WebContentsView to provide a
buffer as you transition to the newer APIs.

See: electron/electron#35658

#### Example: Scrollable web contents with `ScrollView`

Our friends at [Stack](https://stackbrowser.com/) have been driving an initiative to expose the Chromium ScrollView component to
Electron’s API. With this new API, any child View component can be made scrollable horizontally or
vertically.

Although this new API fulfills a single smaller functionality, the team’s eventual goal is to build
a set of utility View components that can be used as a toolkit to build more complex non-HTML
interfaces.

### Getting involved

Are you an Electron app developer interested in either of these API proposals? Although we’re not
quite ready to receive additional RFCs, please stay tuned for more details in the future!

## Electron Forge v6 stable release

Since the framework’s inception, Electron’s build tooling ecosystem has been largely
community-driven and has consisted of many small single-purpose packages (e.g. electron-winstaller,
electron-packager, electron-notarize, electron-osx-sign). Although these tools work well, it’s
intimidating for users to piece together a working build pipeline.

To help build a friendlier experience for Electron developers, we built Electron Forge, an
all-in-one solution that combines all this existing tooling into a single interface. Although Forge
has been in development since 2017, the project has lain dormant for the last few years. However,
given community feedback on the state of build tooling in Electron, we have been hard at work on
releasing the next-gen stable major version of Forge.

Electron Forge 6 comes with first-class TypeScript and Webpack support, as well as an extensible
API that allows developers to create their own plugins and installers.

### Stay tuned: announcement coming soon
If you’re interested in building a project with Forge or building templates or plugins with Forge’s
extensible third-party APIs, stay tuned for our official announcement on the Forge v6 stable
release sometime this month!

## What’s next?

Aside from the above, the team is always thinking of a bunch of exploratory projects to make the
Electron experience better for app developers and end users. Updater tooling, API review processes,
and enhanced documentation are other things we are experimenting with. We hope to have more news to
share in the near future!

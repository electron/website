---
title: December Quiet Month (Dec'25)
date: 2025-11-28T00:00:00.000Z
authors:
  - name: erickzhao
    url: 'https://github.com/erickzhao'
    image_url: 'https://github.com/erickzhao.png?size=96'
slug: dec-quiet-period-25
tags: [news]
---

Starting December 1, the Electron project will enter a quiet period before picking back up at full capacity in January 2026. For full details, see the [Policies](./dec-quiet-period-25.md#quiet-period-policies) section below.

<div style={{ width: "100%", height: 0, paddingBottom: "56%", position: "relative", margin: "2rem 0"}}><iframe src="https://giphy.com/embed/xUA7b5i7joquX9Cp8I" width="100%" height="100%" style={{position: 'absolute'}} frameBorder="0"></iframe></div>

Since 2020, December has been a time for project maintainers to take a breather from regular maintenance duties in order to take a break or focus on heads-down work. This break helps us rest up and come back energized for the year to come.

That said, a month-long pause like this one is only achievable when an open-source project is in a healthy state—we’d like to thank all maintainers and external contributors for all of their continued efforts to keep the project moving. ❤️

<!--truncate-->

## 2025 in review

As we close out the year, we’d like to highlight some of the projects we’ve accomplished. Here are some things we were proud of in 2025:

- ⚛️ Shipped 6 new major versions of Electron in tandem with every other Chromium major version.
- 🌿 Migrated Electron’s build tooling from Ninja to Chromium’s new [siso](https://groups.google.com/a/chromium.org/g/chromium-dev/c/v-WOvWUtOpg) build system, which adds native remote execution support.
- ✨ Revamped the [releases.electronjs.org](http://releases.electronjs.org) page with a fresh new design.
- ✅ Accepted four new [RFCs](https://github.com/electron/rfcs) and implemented two others into `electron/electron`.
- ☀️ Completed two new [Google Summer of Code](https://summerofcode.withgoogle.com/) projects:
  - The [Devtron](https://github.com/electron/devtron/) DevTools IPC tracker Extension is now available via `npm install --save-dev @electron/devtron`.
  - The [Save/Restore Window State API](https://github.com/electron/rfcs/blob/main/text/0016-save-restore-window-state.md) for Electron’s `BaseWindow` module was accepted as an RFC and is awaiting its final merge in Electron core.
- 📦 Released modernized major versions for all `@electron/` npm packages as ECMAScript modules requiring at least Node 22.
- 🔒 Moved package publishing from [Continuous Auth](https://docs.continuousauth.dev/) to the new token-less OIDC-based [trusted publishing](https://docs.npmjs.com/trusted-publishers) system in light of security incidents in the npm ecosystem.
- 🧑‍💻 Onboarded five new maintainers who help us ship great software every day and keep the project running long-term.

**Thanks for a great year, and see you in 2026!**

## Quiet period policies

Not much has changed from previous years, but we changed some of the wording around issue and pull request reviews to temper expectations but allow maintainers to continue to engage with the project as much as they want.

### What will be the same in December

1. Zero-day and other major security-related releases will be published as necessary. Security incidents should be reported via the escalation policy outlined in the [SECURITY.md](https://github.com/electron/electron/blob/main/SECURITY.md) document.
1. [Code of Conduct](https://github.com/electron/electron/blob/main/CODE_OF_CONDUCT.md) reports and moderation will continue.

### What will be different in December

1. The last stable branch releases of the year for Electron 37, 38, and 39 will occur on the week of December 1st. There will be no additional planned releases in December.
1. There will be no nightly, alpha and beta releases for the last two weeks of December.
1. Regular [Working Group](https://github.com/electron/governance) meetings will be paused.
1. Issue triage may be delayed.
1. Pull request reviews and merges may be delayed.

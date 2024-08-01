---
title: 10 years of Electron 🎉
date: 2023-03-13T00:00:00.000Z
authors: erickzhao
slug: 10-years-of-electron
tags: [community, news]
---

# 10 Years of Electron 🎉

The first commit to the `electron/electron` repository was on March 13, 2013[^1].

![Initial commit on electron/electron by @aroben](/assets/img/first-commit.png)

10 years and 27,147 more commits from 1192 unique contributors later, Electron has become one of the
most popular frameworks for building desktop applications today. This milestone is the perfect
opportunity to celebrate and reflect on our journey so far, and to share what we’ve learned along
the way.

We would not be here today without everyone who has dedicated their time and effort to contribute to
the project. Although source code commits are always the most visible contributions, we also have to
acknowledge the effort of folks who report bugs, maintain userland modules, provide documentation
and translations, and participate in the Electron community across cyberspace.
Every contribution is invaluable to us as maintainers.

**Before we continue with the rest of the blog post: thank you. ❤️**

## How did we get here?

**Atom Shell** was built as the backbone for GitHub’s [Atom editor](https://atom.io/), which launched in
public beta in April 2014. It was built from the ground up as an alternative to the web-based
desktop frameworks available at the time (node-webkit and Chromium Embedded Framework). It had a
killer feature: embedding Node.js and Chromium to provide a powerful desktop runtime for web
technologies.

Within a year, Atom Shell began seeing immense growth in capabilities and popularity.
Large companies, startups, and individual developers alike had started building apps with it
(some early adopters include [Slack](https://slack.com), [GitKraken](https://gitkraken.com), and
[WebTorrent](https://webtorrent.io)), and the project was aptly renamed to **Electron**.

From then on, Electron hit the ground running and never stopped. Here’s a look at our weekly
download count over time, courtesy of [npmtrends.com](https://npmtrends.com/electron):

![Electron weekly downloads graph over time](/assets/img/weekly-download-graph.png)

Electron v1 was released in 2016, promising increased API stability and better docs and tooling.
Electron v2 was released in 2018 and introduced semantic versioning, making it easier for Electron
developers to keep track of the release cycle.

By Electron v6, we shifted to a regular 12-week major release cadence to match Chromium’s. This
decision was a change in mentality for the project, bringing “having the most up-to-date Chromium
version” from a nice-to-have to a priority. This has reduced the amount of tech debt between
upgrades, making it easier for us to keep Electron updated and secure.

Since then, we’ve been a well-oiled machine, releasing a new Electron version on the same day as
every Chromium stable. By the time Chromium sped up their release schedule to 4 weeks in 2021,
we were able to shrug our shoulders and increase our release cadence to 8 weeks accordingly.

We’re now on Electron v23 (and counting), and are still dedicated to building the best runtime for
building cross-platform desktop applications. Even with the boom in JavaScript developer tools in
recent years, Electron has remained a stable, battle-tested stalwart of the desktop app framework
landscape. Electron apps are ubiquitous nowadays: you can program with Visual Studio Code, design
with Figma, communicate with Slack, and take notes with Notion (amongst many other use cases).
We’re incredibly proud of this achievement and grateful to everyone who has made it possible.

## What did we learn along the way?

The road to the decade mark has been long and winding. Here are some key things that have
helped us run a sustainable large open source project.

### Scaling distributed decision-making with a governance model

One challenge we had to overcome was handling the long-term direction of the project once Electron
first exploded in popularity. How do we handle being a team of a couple dozen engineers distributed
across companies, countries, and time zones?

In the early days, Electron’s maintainer group relied on informal coordination, which is fast and
lightweight for smaller projects, but doesn’t scale to wider collaboration. In 2019, we shifted to
a governance model where different working groups have formal areas of responsibility. This has been
instrumental in streamlining processes and assigning portions of project ownership to specific
maintainers. What is each Working Group (WG) responsible for nowadays?

- Getting Electron releases out the door (Releases WG)
- Upgrading Chromium and Node.js (Upgrades WG)
- Overseeing public API design (API WG)
- Keeping Electron secure (Security WG)
- Running the website, documentation, and tooling (Ecosystem WG)
- Community and corporate outreach (Outreach WG)
- Community moderation (Community & Safety WG)
- Maintaining our build infrastructure, maintainer tools, and cloud services (Infrastructure WG)

Around the same time we shifted to the governance model, we also moved Electron's ownership from
GitHub [to the OpenJS Foundation](https://www.electronjs.org/blog/electron-joins-openjsf).
Although the original core team still works at Microsoft today, they are only a part of a larger
group of collaborators that form Electron governance.[^2]

While this model isn’t perfect, it has suited us well through a global pandemic and ongoing
macroeconomic headwinds. Going forward, we plan on revamping the governance charter to
guide us through the second decade of Electron.

:::info

If you want to learn more, check out the
[electron/governance](https://github.com/electron/governance) repository!

:::

### Community

The community part of open source is hard, especially when your Outreach team is a dozen engineers
in a trench coat that says “community manager”. That said, being a large open source project means
that we have a lot of users, and harnessing their energy for Electron to build a userland ecosystem
is a crucial part of sustaining project health.

What have we been doing to develop our community presence?

#### Building virtual communities

- In 2020, we launched our community Discord server. We previously had a section in Atom’s forum,
  but decided to have a more informal messaging platform to have a space for discussions between
  maintainers and Electron developers and for general debugging help.
- In 2021, we established the [Electron China](https://github.com/electronjs-cn) user group with the help of
  [@BlackHole1](https://github.com/BlackHole1). This group has been instrumental in Electron growth
  in users from China’s booming tech scene, providing a space for them to collaborate on ideas and
  discuss Electron outside of our English-language spaces. We’d also like to thank
  [cnpm](https://npmmirror.com/) for their work in supporting Electron’s nightly releases in their
  Chinese mirror for npm.

#### Participating in high-visibility open source programs

- We have been celebrating [Hacktoberfest](https://hacktoberfest.com/) every year since 2019.
  Hacktoberfest is yearly celebration of open source organized by DigitalOcean, and we get dozens of
  enthusiastic contributors every year looking to make their mark on open source software.
- In 2020, we participated in the initial iteration of Google Season of Docs, where we worked with
  [@bandantonio](https://github.com/bandantonio) to rework Electron’s new user tutorial flow.
- In 2022, we mentored a Google Summer of Code student for the first time.
  [@aryanshridhar](https://github.com/aryanshridhar) did some awesome work to refactor
  [Electron Fiddle](https://github.com/electron/fiddle)'s core version loading logic and migrate its bundler
  to [webpack](https://webpack.js.org/).

### Automate all the things!

Today, Electron governance has about 30 active maintainers. Less than half of us are full-time
contributors, which means that there’s a lot of work to go around. What’s our trick to keeping
everything running smoothly? Our motto is that computers are cheap, and human time is expensive.
In typical engineer fashion, we’ve developed a suite of automated support tooling to make our lives
easier.

#### Not Goma

The core Electron codebase is a behemoth of C++ code, and build times have always been a limiting
factor in how fast we can ship bug fixes and new features. In 2020, we deployed
[Not Goma](https://www.electronjs.org/docs/latest/development/goma), a custom
Electron-specific backend for Google’s [Goma](https://chromium.googlesource.com/infra/goma/client/)
distributed compiler service.
Not Goma processes compilation requests from authorized user’s machines and distributes the process
across hundreds of cores in the backend. It also caches the compilation result so that someone else
compiling the same files will only need to download the pre-compiled result.

Since launching Not Goma, compilation times for maintainers have decreased from the scale of hours
to minutes. A stable internet connection became the minimum requirement for contributors to compile
Electron!

:::info

If you’re an open source contributor, you can also try Not Goma’s read-only cache, which is
available by default with [Electron Build Tools](https://github.com/electron/build-tools).

:::

#### Continuous Factor Authentication

[Continuous Factor Authentication (CFA)](http://continuousauth.dev/) is a layer of automation
around npm’s two-factor authentication (2FA) system that we combine with
[semantic-release](https://github.com/semantic-release/semantic-release) to manage
secure and automated releases of our various `@electron/` npm packages.

While semantic-release already automates the npm package publishing process, it requires turning off
two-factor authentication or passing in a secret token that bypasses this restriction.

We built CFA to deliver a time-based one-time password (TOTP) for npm 2FA to arbitrary CI jobs,
allowing us to harness the automation of semantic-release while keeping the additional security of
two-factor authentication.

We use CFA with a Slack integration front-end, allowing maintainers to validate package publishing
from any device they have Slack on, as long as they have their TOTP generator handy.

:::info

If you want to try CFA out in your own projects, check out
[the GitHub repository](https://github.com/continuousauth/web) or
[the docs](https://docs.continuousauth.dev/)!
If you use CircleCI as your CI provider, we also have
[a handy orb](https://github.com/continuousauth/npm-orb) to quickly scaffold a project with CFA.

:::

#### Sheriff

[Sheriff](https://github.com/electron/sheriff) is an open source tool we wrote to automate the
management of permissions across GitHub, Slack, and Google Workspace.

Sheriff’s key value proposition is that permission management should be a transparent process.
It uses a single YAML config file that designates permissions across all the above listed services.
With Sheriff, getting collaborator status on a repo or creating a new mailing list is as easy as
getting a PR approved and merged.

Sheriff also has an audit log that posts to Slack, warning admins when suspicious activity occurs
anywhere in the Electron organization.

#### …and all our GitHub bots

GitHub is a platform with rich API extensibility and a first-party bot application framework called
[Probot](https://probot.github.io/). To help us focus on the more creative parts of our job,
we built out a suite of smaller bots that help do the dirty work for us. Here are a
few examples:

- [Sudowoodo](https://github.com/apps/sudowoodo-release-bot) automates the Electron release process
  from start to finish, from kicking off builds to uploading the release assets to GitHub and npm.
- [Trop](https://github.com/electron/trop) automates the backporting process for Electron by
  attempting to cherry-pick patches to previous release branches based on GitHub PR labels.
- [Roller](https://github.com/electron/roller) automates rolling upgrades of Electron’s Chromium
  and Node.js dependencies.
- [Cation](https://github.com/electron/cation) is our status check bot for electron/electron PRs.

Altogether, our little family of bots has given us a huge boost in developer productivity!

#### What’s next?

As we enter our second decade as a project, you might be asking: what’s next for Electron?

We’re going to stay in sync with Chromium's release cadence, releasing new major versions of
Electron every 8 weeks, keeping the framework updated with the latest and greatest from the web
platform and Node.js while maintaining stability and security for enterprise-grade applications.

We generally announce news on upcoming initiatives when they become concrete. If you want to
keep up with future releases, features, and general project updates, you can read
[our blog](https://electronjs.org/blog) and follow our social media profiles
([Twitter](https://twitter.com/electronjs) and [Mastodon](https://social.lfx.dev/@electronjs))!

[^1]:
    This is actually the first commit from the
    [electron-archive/brightray project](https://github.com/electron-archive/brightray), which got
    absorbed into Electron in 2017 and had its git history merged. But who’s counting?
    It’s our birthday, so we get to make the rules!

[^2]:
    Contrary to popular belief, Electron is no longer owned by GitHub or Microsoft, and is part of
    the [OpenJS Foundation](https://openjsf.org/) nowadays.

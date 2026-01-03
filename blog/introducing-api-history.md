---
title: Introducing API History (GSoC 2024)
date: 2024-08-21T00:00:00.000Z
authors: piotrpdev
slug: introducing-api-history
tags: [community]
---

Historical changes to Electron APIs will now be detailed in the docs.

---

Hi 👋, I'm Peter, the 2024 [Google Summer of Code (GSoC)](https://summerofcode.withgoogle.com/)
contributor to Electron.

Over the course of the GSoC program, I implemented an API history feature for the
Electron documentation and its functions, classes, etc. in a similar fashion to the
[Node.js documentation](https://nodejs.org/en/docs): by allowing the
use of a simple but powerful YAML schema in the API documentation Markdown files
and displaying it nicely on the Electron documentation website.

<!--truncate-->

## Details

### API history documentation system / YAML schema

In the Markdown API documentation, the history for a function/class/etc. is now placed directly after the
header for that item in the form of a YAML code block encapsulated by
an HTML comment.

````yaml
#### `win.setTrafficLightPosition(position)` _macOS_

<!--
```YAML history
added:
  - pr-url: https://github.com/electron/electron/pull/22533
changes:
  - pr-url: https://github.com/electron/electron/pull/26789
    description: "Made `trafficLightPosition` option work for `customButtonOnHover` window."
deprecated:
  - pr-url: https://github.com/electron/electron/pull/37094
    breaking-changes-header: deprecated-browserwindowsettrafficlightpositionposition
```
-->

* `position` [Point](structures/point.md)

Set a custom position for the traffic light buttons. Can only be used with `titleBarStyle` set to `hidden`.
````

I believe using YAML like the Node.js docs do was the best approach because it
is easy to read. The API history isn't extremely complicated and should ideally
be as easy to write and read as possible.

The final design shown above is actually significantly different to the one I proposed:

````yaml
<!--
```YAML history
added: v10.0.0
deprecated: v25.0.0
removed: v28.0.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/electron/electron/pull/26789
    description: Made `trafficLightPosition` option work for `customButtonOnHover` window.
```
-->
````

One large change is the removal of version numbers:

> "[...] There’s one somewhat significant change we’d like to call out about
> the proposal, which came up during discussion when we were reviewing proposals.
> [...]
>
> [we] decided that the approach with the [fewest] drawbacks would be to only
> use PR URLs (the root PRs to main) instead of hardcoded version strings as in
> the proposal.
>
> This can serve as a single source of truth which can then be used
> to derive exact version numbers, and no further documentation changes on main
> are necessary if the change is backported to other branches."
>
> — David Sanders [(@dsanders11)][dsanders11] via Slack

We also didn't include removals in the API History, since when an API is removed
from Electron, it is also removed from the documentation.

### JavaScript implementation

I originally planned to create a new `@electron/docs-api-history-tools`
npm package that would contain scripts for extracting, validating/linting and converting
the API history in the documentation files.

About a week before the coding period began, and after some discussion with my
mentors, I realized that was probably unnecessary:

> "Hi everyone, I was thinking about the project after our huddle: Considering
> that extraction logic will have to be handled differently in `e/website` and
> `e/lint-roller` because of their dependencies, maybe there is no need for a
> separate package for API history stuff?"
>
> |         Proposed         |        Revised         |
> | :----------------------: | :--------------------: |
> | ![proposed][js-proposed] | ![revised][js-revised] |
>
> — Piotr Płaczek (me) via Slack

We ultimately decided to not go ahead with my original idea:

> "@Piotr Płaczek that seems fine to me! I think we can always refactor out to a
> separate module in a later iteration if we find that we need to share a lot of
> code between the two implementations anyways :slightly_smiling_face:"
>
> — Erick Zhao ([@erickzhao][erickzhao]) via Slack

Instead, we divided those various tools across the Electron repos that were most
relevant to them:

- `yaml-api-history-schema.json`
  - -> `electron/electron` ([`api-history.schema.json`](https://github.com/electron/electron/blob/main/docs/api-history.schema.json))
- `lint-yaml-api-history.ts`
  - -> `electron/lint-roller` ([`lint-markdown-api-history.ts`](https://github.com/electron/lint-roller/blob/3d87b7ba8f99868a28648297f31a1587945045ab/bin/lint-markdown-api-history.ts#L4))
- `extract-yaml-api-history.ts`
  - -> `electron/website` ([`preprocess-api-history.ts`](https://github.com/electron/website/blob/f7e9446dd7d04b3369e9454f7c95f638fa061f1e/scripts/tasks/preprocess-api-history.ts#L4))
- `yaml-api-history-to-markdown.ts`
  - -> `electron/website` ([`transformers/api-history.ts`](https://github.com/electron/website/blob/f7e9446dd7d04b3369e9454f7c95f638fa061f1e/src/transformers/api-history.ts))
  - -> `electron/website` ([`ApiHistoryTable.tsx`](https://github.com/electron/website/blob/f7e9446dd7d04b3369e9454f7c95f638fa061f1e/src/components/ApiHistoryTable.tsx))

### UI and styling for Electron documentation website

I originally proposed a simple table to display the API History data:

|      Design Prototype (Closed)      |      Design Prototype (Open)      |
| :---------------------------------: | :-------------------------------: |
| ![demo1][prototype-closed-proposed] | ![demo2][prototype-open-proposed] |

This is what the final implemented design looks like:

![demo3][open-implemented]

Pretty much the same as the prototype. The most significant addition is the use
of [SemVer](https://semver.org/) ranges, which were chosen to better communicate
which versions a feature is present in (thanks Samuel Attard
[(@MarshallOfSound)](https://github.com/MarshallOfSound) for the suggestion!).

This is important because changes are frequently backported across supported
Electron release lines e.g. a fix may make it into Electron v32.0.0, v31.1.0 and v30.2.0.
This means it is not present in v31.0.0 which a user might mistakenly deduce based
on the fact it is present in a v30.x.x release.

### Usage/style guide

I added a usage/style guide dedicated to writing API history documentation for
new features. I described proper usages of the YAML schema in detail, provided
typical/useful examples, etc. You can find it
[here](https://github.com/electron/electron/blob/main/docs/development/style-guide.md#api-history).

### Migration guide

Since existing APIs have to be migrated to the new documentation system, I created
a migration guide. It features the typical steps of what a developer has
to do when migrating old APIs: looking through breaking changes, browsing through
the past releases, maybe looking through old commits, etc.
Then instructing the developer to follow the usage/style guide to add API history
documentation for each previously existing class/function/etc.

Sadly, I couldn't think of a way to automate this effectively. This would probably
be a great task for an AI/ML engineer; however, I don't possess those skills and
was too afraid of accidentally introducing [hallucinations](<https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)>)
into the API history. Even if automated, the information would still probably have
to be verified by a human in the end 😕. This task will probably have to be done
manually, on a file-by-file basis,
[just like it was done for the Node.js documentation](https://github.com/nodejs/node/issues/6578).

## Deliverables

- `api-history.schema.json`
  - A comprehensive YAML schema for documenting API history which includes support
    for:
    - [x] Additions
    - [x] Deprecations
    - [x] Changes
    - [x] Links to relevant pull requests
    - [x] Backports
  - [x] Proposed in: [electron/rfc#6][rfc]
  - [x] Implemented/Used in: [electron/electron#42982][electron]
  - [x] Used in: [electron/website#594][website]

- `lint-markdown-api-history.ts`
  - Script for linting YAML API history written according to a custom YAML
    (technically JSON) schema.
    - [x] Useful error messages
    - [x] Comprehensive documentation / code comments
    - [x] Extensive ~~Jest~~ Vitest tests
    - [x] Good performance
  - [x] Implemented in: [electron/lint-roller#73][lint-roller]
  - [x] Used in: [electron/electron#42982][electron]

- `preprocess-api-history.ts`
  - Performs simple validation just in case incorrect API History manages to make
    it into the repo. Also strips the HTML comment tags that wrap API History blocks
    since [Docusaurus](https://docusaurus.io/) cannot parse them.
  - [x] Implemented/Used in: [electron/website#594][website]

- `transformers/api-history.ts`
  - Script for converting YAML API history blocks in the Markdown documentation files
    to ~~Markdown/HTML~~ [React](https://react.dev/) tables (`ApiHistoryTable.tsx`).
  - [x] Implemented/Used in: [electron/website#594][website]

- `ApiHistoryTable.tsx`
  - React table component used to display parsed API History data on the
    documentation website.
    - [x] Uses styling that follows the rest of the website's design.
    - [x] Responsive, accessible, and generally well written HTML, CSS, and JS.
  - [x] Implemented/Used in: [electron/website#594][website]

- `styleguide.md`
  - Usage/style guide section for new API history documentation system.
    - [x] Easy to understand
    - [x] Well written
    - [x] Includes examples
  - [x] Implemented/Used in: [electron/electron#42982][electron]

- `api-history-migration-guide.md`
  - Migration guide for new API history documentation system.
    - [x] Easy to understand
    - [x] Well written
    - [x] Includes examples
  - [x] Implemented/Used in: [electron/electron#42982][electron]

## Conclusion

I had a lot of fun working on this feature and was able to earn valuable experience
from code reviews and discussing its various implementation details with the team.

I believe the addition of API history to the documentation will make the lives of
developers using Electron a lot easier, especially ones attempting to migrate their
existing app from a several year old Electron version.

I also want to sincerely thank my mentors:

- David Sanders [(@dsanders11)][dsanders11]
- Keeley Hammond [(@VerteDinde)](https://github.com/VerteDinde)
- Erick Zhao [(@erickzhao)][erickzhao]

...and the rest of the Electron team for answering my questions
and taking the time to give me feedback on my pull requests.
It is very much appreciated.

[dsanders11]: https://github.com/dsanders11
[erickzhao]: https://github.com/erickzhao
[js-proposed]: /assets/img/blog/api-history-js-proposed.png
[js-revised]: /assets/img/blog/api-history-js-revised.png
[prototype-closed-proposed]: /assets/img/blog/api-history-prototype-closed.png
[prototype-open-proposed]: /assets/img/blog/api-history-prototype-open.png
[open-implemented]: /assets/img/blog/api-history-open-implemented.png
[electron]: https://github.com/electron/electron/pull/42982
[website]: https://github.com/electron/website/pull/594
[lint-roller]: https://github.com/electron/lint-roller/pull/73
[rfc]: https://github.com/electron/rfcs/pull/6

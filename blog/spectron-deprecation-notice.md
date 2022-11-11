---
title: Spectron Deprecation Notice
date: 2021-12-01T00:00:00.000Z
authors:
    - name: vertedinde
      url: 'https://github.com/vertedinde'
      image_url: 'https://github.com/vertedinde.png?size=96'
slug: spectron-deprecation-notice

---

Spectron will be deprecated on February 1st, 2022.

---

Beginning in February 2022, Spectron will be [officially deprecated by the Electron team](https://github.com/electron-userland/spectron/issues/1045).

## Why Deprecate Spectron?

While Spectron has consistently put out new releases for each new version of Electron, the project has had very little maintenance and improvements for well over a year, and currently has no full-time maintainers. With the remote module moving outside of Electron core and into an external module in Electron 14, Spectron will require a major rewrite to continue working reliably.

After reviewing several available options for Spectron's continued maintenance, the Electron team has decided to deprecate Spectron in 2022.

## Deprecation Timeline

The following is our planned deprecation timeline:

- **November 2021 - January 2022**: The Electron team will continue to accept pull requests from the community.
- **January 2022**: A final version of announcement warning about Spectron's deprecation will be released.
- **February 1, 2022**: Spectron's repo will be marked as "archived". No more pull requests will be accepted.

Following February 1st, 2022, Electron will continue to leave the Spectron repo up indefinitely, so that others are welcome to fork or use the existing code for their projects. We hope this will help provide a longer transition to any projects that may still depend on Spectron.

## Alternatives to Spectron

If you're currently using Spectron in your project and would like to migrate to an alternative testing solution, you can read our [guide for automated testing here](https://www.electronjs.org/docs/latest/tutorial/automated-testing).

We currently have several other recommended alternatives to Spectron, including Playwright and WebDriverIO. Official tutorials for each option can be found in our Automated Testing documentation.

## What's Next

We here on the Electron team appreciate you using Spectron and Electron. We understand that many of you depend on Spectron for testing your apps, and we want to make this transition as painless for you as possible. Thank you for choosing Electron!

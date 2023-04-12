---
title: Farewell, Windows 7/8/8.1
date: 2022-11-29T00:00:00.000Z
authors:
  - name: vertedinde
    url: 'https://github.com/vertedinde'
    image_url: 'https://github.com/vertedinde.png?size=96'
slug: windows-7-to-8-1-deprecation-notice
---

Electron will end support of Windows 7, Windows 8 and Windows 8.1 beginning in Electron 23.

---

[In line with Chromium’s deprecation policy](https://support.google.com/chrome/thread/185534985/sunsetting-support-for-windows-7-8-8-1-in-early-2023?hl=en), Electron will end support of Windows 7, Windows 8 and Windows 8.1 beginning in Electron 23. This matches Microsoft's end of support for [Windows 7 ESU](https://docs.microsoft.com/en-US/lifecycle/faq/extended-security-updates) and [Windows 8.1 extended](https://support.microsoft.com/en-us/windows/windows-8-1-support-will-end-on-january-10-2023-3cfd4cde-f611-496a-8057-923fba401e93) on January 10th, 2023.

Electron 22 will be the last Electron major version to support Windows versions older than 10. Windows 7/8/8.1 will not be supported in Electron 23 and later major releases. Older versions of Electron will continue to function on Windows 7, and we will continue to release patches for Electron the 22.x series until May 30 2023, when Electron will end support for 22.x (according to our [support timeline](https://www.electronjs.org/docs/latest/tutorial/electron-timelines)).

## Why deprecate?

Electron follows the planned Chromium deprecation policy, which will deprecate support in Chromium 109 ([read more about Chromium's timeline here](https://support.google.com/chrome/thread/185534985/sunsetting-support-for-windows-7-8-8-1-in-early-2023?hl=en)). Electron 23 will contain Chromium 110, which won’t support older versions of Windows.

Electron 22, which contains Chromium 108, will thus be the last supported version.

## Deprecation timeline

The following is our planned deprecation timeline:

- **December 2022**: The Electron team is entering a quiet period for the holidays
- **January 2023**: Windows 7 & 8 related issues are accepted for all supported release branches.
- **February 7 2023**: Electron 23 is released.
- **February 8 2023 - May 29 2023**: Electron will continue to accept fixes for supported lines older than Electron 23.
- **May 30 2023**: Electron 22 reaches the end of its support cycle.

What this means for developers:

- The Electron team will accept issues and fixes related to Windows 7/8/8.1 for stable supported lines, until each line reaches the end of its support cycle.
  - This specifically applies to Electron 22, Electron 21 and Electron 20.
- New issues related to Windows 7/8/8.1 will be accepted for Electron versions older than Electron 23.
  - New issues will not be accepted for any newer release lines.
- Once Electron 22 has reached the end of its support cycle, all existing issues related to Windows 7/8/8.1 will be closed.

:::info

**2023/02/16: An update on Windows Server 2012 support**

Last month, Google announced that [Chrome 109 would continue to receive critical
security fixes](https://support.google.com/chrome/a/thread/185534987) for
Windows Server 2012 and Windows Server 2012 R2 until October 10, 2023.
In accordance, Electron 22's (Chromium 108) planned end of life date will be extended from May 30, 2023 to October 10, 2023. The Electron team will continue to backport any security fixes that are part of this program to Electron 22 until October 10, 2023.

Note that we will not make additional security fixes for Windows 7/8/8.1.
Also, Electron 23 (Chromium 110) will only function on Windows 10 and above as
previously announced.

:::

## What's next

Please feel free to write to us at info@electronjs.org if you have any questions or concerns. You can also find community support in our official [Electron Discord](https://discord.gg/electronjs).

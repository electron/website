---
title: Statement regarding "runAsNode" CVEs
date: 2024-02-07T12:00:00.000Z
authors:
  - name: VerteDinde
    url: 'https://github.com/VerteDinde'
    image_url: 'https://github.com/VerteDinde.png?size=96'
  - name: felixrieseberg
    url: 'https://github.com/felixrieseberg'
    image_url: 'https://github.com/felixrieseberg.png?size=96'
slug: statement-run-as-node-cves
tags: [security]
---

Earlier today, the Electron team was alerted to several public CVEs recently filed against several notable Electron apps. The CVEs are related to two of Electron’s [fuses](https://www.electronjs.org/docs/latest/tutorial/fuses) - `runAsNode` and `enableNodeCliInspectArguments` - and incorrectly claim that a remote attacker is able to execute arbitrary code via these components if they have not been actively disabled.

We do not believe that these CVEs were filed in good faith. First of all, the statement is incorrect - the configuration does _not_ enable remote code execution. Secondly, companies called out in these CVEs have not been notified despite having bug bounty programs. Lastly, while we do believe that disabling the components in question enhances app security, we do not believe that the CVEs have been filed with the correct severity. “Critical” is reserved for issues of the highest danger, which is certainly not the case here.

Anyone is able to request a CVE. While this is good for the overall health of the software industry, “farming CVEs” to bolster the reputation of a single security researcher is not helpful.

That said, we understand that the mere existence of a CVE with the scary `critical` severity might lead to end user confusion, so as a project, we’d like to offer guidance and assistance in dealing with the issue.

### How might this impact me?

After reviewing the CVEs, the Electron team believes that these CVEs are not critical.

An attacker needs to already be able to execute arbitrary commands on the machine, either by having physical access to the hardware or by having achieved full remote code execution. This bears repeating: The vulnerability described _requires an attacker to already have access to the attacked system_.

Chrome, for example, [does not consider physically-local attacks in their threat model](https://chromium.googlesource.com/chromium/src/+/master/docs/security/faq.md#Why-arent-physically_local-attacks-in-Chromes-threat-model):

> We consider these attacks outside Chrome's threat model, because there is no way for Chrome (or any application) to defend against a malicious user who has managed to log into your device as you, or who can run software with the privileges of your operating system user account. Such an attacker can modify executables and DLLs, change environment variables like `PATH`, change configuration files, read any data your user account owns, email it to themselves, and so on. Such an attacker has total control over your device, and nothing Chrome can do would provide a serious guarantee of defense. This problem is not special to Chrome ­— all applications must trust the physically-local user.

The exploit described in the CVEs allows an attacker to then use the impacted app as a generic Node.js process with inherited TCC permissions. So if the app, for example, has been granted access to the address book, the attacker can run the app as Node.js and execute arbitrary code which will inherit that address book access. This is commonly known as a “[living off the land](https://www.crowdstrike.com/cybersecurity-101/living-off-the-land-attacks-lotl/)” attack. Attackers usually use PowerShell, Bash, or similar tools to run arbitrary code.

### Am I impacted?

By default, all released versions of Electron have the `runAsNode` and `enableNodeCliInspectArguments` features enabled. If you have not turned them off as described in the [Electron Fuses documentation](https://www.electronjs.org/docs/latest/tutorial/fuses), your app is equally vulnerable to being used as a “living off the land” attack. Again, we need to stress that an attacker needs to _already_ be able to execute code and programs on the victim’s machine.

### Mitigation

The easiest way to mitigate this issue is to disable the `runAsNode` fuse within your Electron app. The `runAsNode` fuse toggles whether the `ELECTRON_RUN_AS_NODE` environment variable is respected or not. Please see the [Electron Fuses documentation](https://www.electronjs.org/docs/latest/tutorial/fuses) for information on how to toggle theses fuses.

Please note that if this fuse is disabled, then `process.fork` in the main process will not function as expected as it depends on this environment variable to function. Instead, we recommend that you use [Utility Processes](https://www.electronjs.org/docs/latest/api/utility-process), which work for many use cases where you need a standalone Node.js process (like a Sqlite server process or similar scenarios).

You can find more info about security best practices we recommend for Electron apps in our [Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security).

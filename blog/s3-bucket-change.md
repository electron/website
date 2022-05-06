---
title: "S3 Bucket Migration"
date: 2022-05-06T00:00:00.000Z
authors:
  name: MarshallOfSound
  url: 'https://github.com/MarshallOfSound'
  image_url: 'https://github.com/MarshallOfSound.png?size=96'
---

Electron is changing its primary S3 bucket, you may need to update your build scripts

---

# What is happening?

A significant amount of Electron's build artifacts are uploaded to an S3 bucket called `gh-contractor-zcbenz`. As part of ongoing infrastructure/ownership migrations that started way back in 2020, we will be changing everything that used `gh-contractor-zcbenz` from its old home in S3 to a new storage system hosted at `https://artifacts.electronjs.org`.  The path prefix that most of our assets use is changing slightly as well.  Examples are included below:

**Before:** https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/dist/v17.0.0/node.lib  
**After:** https://artifacts.electronjs.org/headers/dist/v17.0.0/node.lib  

The important things here are the **Hostname** changed and the `/atom-shell` **prefix** changed.  Another example, this time for debug symbols:

**Before:** https://gh-contractor-zcbenz.s3.amazonaws.com/atom-shell/symbols/path/to/symbol.pdb  
**After:** https://artifacts.electronjs.org/symbols/path/to/symbol.pdb  

Again, the hostname changed and the `/atom-shell` prefix was changed.

# How might this impact you?

Anyone using standard build tooling such as `electron-rebuild`, `electron-packager` or `@electron/get` won't have to do anything. This should be the majority of people.

For anyone directly referencing the S3 bucket, you must update your reference to point at the hostname and update the path as well.

# What about existing data?

Most data that existed on the `gh-contractor-zcbenz` bucket has been cloned into the new storage system. This means all debug symbols and all headers have been copied.  If you relied on some data in that bucket that hasn't been copied over please raise an issue in [`electron/electron`](https://github.com/electron/electron) and let us know.

The current `gh-contractor-zcbenz` S3 bucket will not be actively deleted. However, we can't guarantee how long that bucket will be left alive.  We **strongly** recommend updating to target the new bucket as soon as possible.

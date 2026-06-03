---
title: 'A Faster Electron'
date: 2026-05-20T00:00:00.000Z
authors: MarshallOfSound
slug: a-faster-electron
tags: [internals]
---

import ThemedImage from '@theme/ThemedImage';

Over the last few releases we've been making Electron faster. Not one feature, and not one benchmark: startup, IPC, `contextBridge`, networking, module loading, and raw JavaScript throughput, across every app that runs on Electron.

<div>
  <ThemedImage alt="Electron performance improvements. Startup: sandboxed renderer startup drops from about 230 ms to about 130 ms (about 43%); browser-process startup drops from about 125 ms to about 75 ms (about 40%). Everything after startup: Speedometer 3.1 on an M5 MacBook rises from 56.6 to 66.2 (about 17%); contextBridge calls are about 28% faster overall." sources={{ light: '/assets/img/blog/faster-startup-hero-light.svg', dark: '/assets/img/blog/faster-startup-hero-dark.svg' }} />
</div>

The short version: **sandboxed renderers** start up **~43%** faster, the **browser process** boots **~40%** faster, and Electron's compiled code itself got faster across the board: **Speedometer is up ~17%**, `contextBridge` calls are up **28-50%**, and networking is up **19-40%**. None of it requires a single change to your app.

This post is in two parts. **Part one is startup**: three changes that shrink the time between launching an app and seeing pixels. **Part two is everything after startup**: the discovery that Electron has been shipping with _Chrome's_ compiler optimization data for years, and what fixing that is worth.

<!--truncate-->

## Part one: faster startup

Before any of your code runs, a freshly spawned Electron process loads the binary, initializes Chromium and V8, bootstraps a Node.js environment (where it has one), and parses and compiles Electron's own framework JavaScript. The last two are pure CPU spent turning JavaScript into bytecode, and they happen on _every launch of every process_.

Part one removes that work from the critical path with three independent changes:

- **Pushing sandboxed-renderer startup data over Mojo** instead of a synchronous IPC, and caching the preload bytecode.
- **A build-time V8 code cache** for Electron's framework bundles, so they're _deserialized_ instead of _compiled_.
- **A Node.js startup snapshot for the browser process**, so the Node bootstrap is _restored_ instead of _executed_.

<div>
  <ThemedImage alt="Two startup timelines. The browser process, from spawn to first user JavaScript, shrinks mainly because the Node.js bootstrap is restored from a snapshot. The sandboxed renderer, from spawn to first paint, shrinks because preload setup is pushed instead of pulled and framework JavaScript comes from a build-time code cache. Bars are illustrative, not to exact scale." sources={{ light: '/assets/img/blog/startup-timeline-light.svg', dark: '/assets/img/blog/startup-timeline-dark.svg' }} />
</div>

### Getting the sandboxed renderer off synchronous IPC

A sandboxed renderer historically bootstrapped by asking the browser process for its preload scripts and metadata over a **synchronous** IPC message, then blocking until the answer came back. The catch: at startup the browser process is the busiest it will ever be, so the renderer's cheap request keeps getting preempted by everything else. A reply that takes 2 ms of actual work can land 80 ms later, and the renderer is frozen the whole time.

<div>
  <ThemedImage alt="Before and after of the synchronous preload IPC. Before: the renderer blocks while the main process is busy with other startup work, so the cheap reply isn't delivered until about 80 ms. After: the main process pushes the bundle one-way during navigation setup and the renderer resumes at about 22 ms." sources={{ light: '/assets/img/blog/sync-ipc-light.svg', dark: '/assets/img/blog/sync-ipc-dark.svg' }} />
</div>

The fix was to stop asking. The browser process already knows everything the renderer needs, so it now **pushes** that data down with the frame-creation parameters over Mojo. No round-trip, no blocking, and the synchronous message is gone entirely. The preload scripts also gained a **bytecode cache**, so repeat launches deserialize them instead of re-compiling.

Together these make sandboxed renderer startup roughly **43% faster** under real-world conditions, and the renderer's pre-paint time no longer depends on how busy your main process is.

### A build-time code cache for the framework bundles

Electron's framework JavaScript is embedded in the binary as source, and V8 compiles it from scratch in every process, on every launch. V8 has a standard fix for this, a **code cache**: compile once, serialize the bytecode, deserialize on later runs. We now generate that cache _at build time_ and embed it next to the source, so no process ever compiles the framework bundles again.

The catch is that a V8 code cache is keyed to the exact V8 configuration that produced it: the V8 version, the source, the isolate's snapshot checksum, and a hash of V8's non-default flags. If anything differs, V8 silently rejects the cache and compiles from source; no error, just no speedup. And those keys **differ per process type**: a sandboxed renderer, a normal renderer, and the browser process each run V8 with different flags. So the build generates one cache per process flavor, and each process picks up the one that matches it.

<div>
  <ThemedImage alt="How the build-time code cache works. At build time, Electron's framework JavaScript is compiled once per process flavor, producing five caches (sandbox, renderer, browser, utility, worker), each keyed to that process type's V8 flags. At runtime each process deserializes the cache that matches its own flags; a mismatch is silently rejected and V8 compiles from source." sources={{ light: '/assets/img/blog/code-cache-flow-light.svg', dark: '/assets/img/blog/code-cache-flow-dark.svg' }} />
</div>

The cache is also built with **eager compilation**, so it covers every inner function rather than just the top level. The framework bundles run in full during bootstrap anyway; this just moves all of that compilation to build time.

The clearest win is the sandboxed renderer, whose pre-paint blocking window is almost entirely framework compilation:

|                                | Pre-paint blocking window |
| ------------------------------ | ------------------------- |
| No cache (compile from source) | ~9.8 ms                   |
| **Eager build-time cache**     | **~6.4 ms (-35%)**        |

That's on every launch, embedded in the binary, with no warm-up. The Node-enabled processes consume the cache too, but their startup is dominated by something a code cache can't fix: the Node bootstrap itself. Which brings us to the next change.

### A Node.js startup snapshot for the browser process

A code cache skips _compilation_. The Node.js bootstrap is mostly _execution_: building `process`, wiring the module loader, running ~50 internal setup scripts. Node has a feature designed for exactly this, the **startup snapshot**: serialize a fully bootstrapped environment once, then deserialize it on every launch instead of re-running the bootstrap. Upstream Node ships with it on. Electron has had it disabled for years.

Why? Electron already boots from two snapshots, and neither is Node's:

1. **V8 startup snapshot**: V8's read-only heap and a bare context.
2. **Blink context snapshot**: the DOM bindings, with zero compiled JavaScript.
3. **Node snapshot**: the bootstrapped Node environment. _This is the missing one._

<div>
  <ThemedImage alt="The three snapshot layers stacked: the V8 startup snapshot and the Blink context snapshot were already loaded, but neither captures Node's bootstrap. The Node snapshot, the missing layer, is the one that does." sources={{ light: '/assets/img/blog/snapshot-layers-light.svg', dark: '/assets/img/blog/snapshot-layers-dark.svg' }} />
</div>

Building the missing one looked impossible at first. Creating a snapshot appears to require a special from-scratch build of V8 that only V8's own tooling gets to use; embedders like Node and Electron only get the "deserialize from an existing snapshot" build, and trying to create a snapshot with it fails with `Heap setup supported only in mksnapshot`.

The way out is that you don't have to build a heap from scratch. You can **extend an existing snapshot**: load the V8 startup snapshot as a base, run Node's bootstrap on top of it, and serialize the result. That's exactly how Chromium builds the Blink context snapshot on every build, with the same "deserialize-only" V8 that Electron has.

<div>
  <ThemedImage alt="Two ways to create a snapshot. Building a heap from scratch needs V8's full setup-isolate delegate, which is only in V8's own mksnapshot and unavailable to embedders. Extending an existing snapshot loads snapshot_blob.bin as a base and uses the deserialize delegate Electron already links, which works." sources={{ light: '/assets/img/blog/extend-not-build-light.svg', dark: '/assets/img/blog/extend-not-build-dark.svg' }} />
</div>

The snapshot is consumed by the **browser process only**: a renderer's isolate already comes from the Blink snapshot, and V8 allows one snapshot per process. The browser process has no Blink, so Node's snapshot becomes its process-wide blob, and `node::CreateEnvironment` deserializes the environment instead of bootstrapping it.

One trap worth sharing if you benchmark this kind of work: measure from process **spawn**, in a **release** build. Local debug-ish builds make snapshot deserialization look artificially slow, and measuring from your entry script's first line misses the entire point, because the win is everything that happens _before_ your script runs. Measured correctly, the Node snapshot is worth roughly **40% of browser-process startup**, about 50 ms on the hardware tested.

### Startup, summed up

- **Sandboxed renderers** skip a synchronous IPC round-trip and reuse cached preload bytecode: **~43% faster**.
- **Every process** deserializes framework JavaScript instead of compiling it: **~35%** off the pre-paint window.
- **The browser process** restores its Node.js bootstrap from a snapshot: **~40% faster** to first user JavaScript.

The hardest part of all three wasn't the optimization, it was the seams: Chromium, V8, and Node each have their own model of how a process boots, and the bugs live where those models meet.

Startup is half the story. The other half starts with an uncomfortable discovery about how Electron has been built for years.

## Part two: Electron has been shipping with Chrome's optimization data

Modern compilers optimize code around how it actually runs. The biggest lever is **Profile-Guided Optimization** (PGO): run an instrumented build through real workloads, record which functions are hot, then rebuild with that profile so the compiler knows what to inline, how to lay out branches, and what to keep in the hot path.

Chrome uses PGO aggressively, and Google publishes fresh Chrome profiles every few hours. Here's the uncomfortable part: **Electron's release builds have been applying Chrome's profile.** Not a profile of Electron. Chrome's.

### What borrowing a profile costs

A profile matches functions by name plus a hash of their code. Functions that exist in Electron but not Chrome (all of Node.js, all of Electron's own C++, `contextBridge`) were never in Chrome's profile. Functions that exist in both but are compiled differently in Electron (different patches, flags, V8 configuration) match by name but fail the hash check and are **silently rejected**. Either way, the compiler gets no guidance and lays the code out as cold.

We measured it with `llvm-profdata`: **about a quarter of the code Electron executes gets zero optimization guidance**, and it's concentrated in exactly the code that makes Electron _Electron_.

<div>
  <ThemedImage alt="What Chrome's profile knows about Electron's code: 74.5% is optimized (name and hash match), 19.3% is silently rejected (same name, different code: Skia SIMD kernels, V8's JSON stringifier, Mojo, net), and 6.2% is not in Chrome's profile at all (all of Node.js, contextBridge, Electron's own C++). One quarter of the code Electron executes gets zero optimization guidance." sources={{ light: '/assets/img/blog/pgo-coverage-light.svg', dark: '/assets/img/blog/pgo-coverage-dark.svg' }} />
</div>

This isn't theoretical. While doing this work we found that `crypto.randomBytes` in Electron 44 runs at **less than half** its Electron 42 speed. Nobody touched the crypto code: a BoringSSL patch changed the functions' hashes, Chrome's profile silently stopped covering them, and the compiler started treating them as cold. That's what makes a borrowed profile insidious: code gets slower without anyone changing it, and nothing warns you. With an Electron profile, the regression disappears.

### Fix one: turn on link-time optimization

Chromium links with **ThinLTO**, which lets the compiler optimize across source files at link time, but the default setting does no optimization at all (`--lto-O0`). Chrome's release builds opt into `--lto-O2`. Electron never did.

Opting in is worth about **+5%** on Speedometer 3.1 on an M5 MacBook (and more on older hardware). Useful, but as it turns out, the smaller half of the story.

### Fix two: Electron's own profiles

If borrowing Chrome's profile is the problem, the fix is to train our own: instrumented builds for every release platform, training workloads that exercise Electron the way apps actually use it, and a pipeline that publishes the profiles for release builds to consume.

The training workloads turn out to be the entire game, because PGO is symmetric: everything the training runs gets optimized, and everything it _doesn't_ run gets explicitly laid out as cold. Our first profile was trained on browser benchmarks. Browser-style code got faster, and Node.js `Buffer` operations got **63% slower than stock**, because the training never ran Node.

<div>
  <ThemedImage alt="The cold-marking trap. A profile trained only on browser benchmarks: browser-style code gets 13% faster, but Node.js Buffer operations get 63% slower than stock because the training never ran Node and the profile marked it cold. The enriched profile, trained on Node.js, contextBridge, IPC, TLS networking, and ASAR module loading as well as browser workloads, keeps the browser wins and fully recovers Node." sources={{ light: '/assets/img/blog/cold-marking-light.svg', dark: '/assets/img/blog/cold-marking-dark.svg' }} />
</div>

The training suite now covers what Electron apps actually do: main-process Node.js, `contextBridge` and IPC marshaling, networking over real TLS, module loading from ASAR archives, and compression. It also covers V8's **builtins**, which have their own separate profile; Chrome's version rejects every promise and async builtin in Electron (we build V8 with promise hooks enabled, Chrome doesn't), so those were running unoptimized too.

### The results

Each layer stacks on the last. On Speedometer 3.1, on an M5 MacBook:

| Configuration              | Score    | Step     |
| -------------------------- | -------- | -------- |
| Stock Electron             | 56.6     |          |
| + ThinLTO `--lto-O2`       | 59.2     | +5%      |
| + Electron C++ PGO         | 65.5     | **+11%** |
| + Electron V8 builtins PGO | **66.2** | +1%      |

That's **+17% end to end**, and the biggest single step is Electron's own profile, not the compiler flag. The borrowed optimization data really was the main problem.

<div>
  <ThemedImage alt="Speedometer 3.1 on an M5 MacBook as each layer is added: stock Electron 56.6, plus ThinLTO 59.2 (+5%), plus Electron's C++ PGO 65.5 (+11%, the largest step), plus Electron's V8 builtins PGO 66.2. Total +17%, and the biggest gain comes from replacing Chrome's borrowed profile with Electron's own." sources={{ light: '/assets/img/blog/speedometer-stack-light.svg', dark: '/assets/img/blog/speedometer-stack-dark.svg' }} />
</div>

We also validated the whole stack against the official nightly across a 38-test suite covering `contextBridge`, IPC, and networking, with statistical significance testing:

**37 significant improvements, zero regressions, one tie.**

| Area                                     | Improvement (geomean) |
| ---------------------------------------- | --------------------- |
| `contextBridge`                          | **+28%**              |
| Networking (`fetch`, WebSocket, `https`) | **+19%**              |
| IPC                                      | **+11%**              |
| Overall                                  | **+19.5%**            |

The wins land exactly where Electron's own code runs: `contextBridge` calls that round-trip objects are up 40-55%, `fetch` round-trips are up 23-40%, IPC payloads of every size are up 7-16%. On identical workloads, an optimized Electron now matches or exceeds Chrome itself; the penalty for being "Chrome plus Node.js" instead of Chrome is gone.

### What this means for your app

The same app, on the same hardware, spends less CPU doing what it already does. Chat apps: channel switching and message rendering cost 16-20% less CPU, and every preload API call is 28-50% cheaper. Editors: module loading from ASAR is 8-10% faster and `Buffer`-heavy work is no longer pessimized. Document apps: JSON and structured clone of cached data are 13-37% faster.

A useful frame: a UI interaction that costs 19.7 ms today misses the 60 fps frame budget and feels janky. At ~19.5% less CPU it costs about 16.4 ms, inside the budget. These changes move real interactions across that line.

<div>
  <ThemedImage alt="The 60 fps frame budget is 16.7 ms. Before: an interaction costing 19.7 ms misses the budget and the app drops a frame. After, at about 19.5% less CPU: the same interaction costs about 16.4 ms, inside the budget, and the app stays smooth." sources={{ light: '/assets/img/blog/frame-budget-light.svg', dark: '/assets/img/blog/frame-budget-dark.svg' }} />
</div>

## Putting it together

- **Startup**: sandboxed renderers start ~43% faster, framework JavaScript comes from an embedded code cache, and the browser process restores its Node.js bootstrap from a snapshot.
- **Everything after**: Electron stopped borrowing Chrome's compiler optimization data and started generating its own, removing a silent ~20-25% CPU penalty on its hottest code paths.

Apps don't need to do anything except update.

If this kind of work sounds fun, the [Electron repository](https://github.com/electron/electron) is always looking for contributors.

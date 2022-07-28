---
title: Electron and the V8 Memory Cage
date: 2022-06-30T00:00:00.000Z
authors:
  - name: nornagon
    url: 'https://github.com/nornagon'
    image_url: 'https://github.com/nornagon.png?size=96'
slug: v8-memory-cage
---

Electron 20 and later will have the V8 Memory Cage enabled, with implications for some native modules.

---

In Electron 20, we will be enabling [V8 sandboxed pointers](https://docs.google.com/document/d/1HSap8-J3HcrZvT7-5NsbYWcjfc0BVoops5TDHZNsnko/edit) in Electron, following Chrome's [decision to do the same in Chrome 103](https://chromiumdash.appspot.com/commit/9a6a76bf13d3ca1c6788de193afc5513919dd0ed). This has some implications for native modules. Also, we previously enabled a related technology, [pointer compression](https://v8.dev/blog/pointer-compression), in Electron 14. We didn't talk about it much then, but pointer compression has implications for the maximum V8 heap size.

These two technologies, when enabled, are significantly beneficial for security, performance and memory usage. However, there are some downsides to enabling them, too.

The main downside of enabling sandboxed pointers is that **ArrayBuffers which point to external ("off-heap") memory are no longer allowed**. This means that native modules which rely on this functionality in V8 will need to be refactored to continue working in Electron 20 and later.

The main downside of enabling pointer compression is that **the V8 heap is limited to a maximum size of 4GB**. The exact details of this are a little complicated—for example, ArrayBuffers are counted separately from the rest of the V8 heap, but have their [own limits](https://bugs.chromium.org/p/chromium/issues/detail?id=1243314).

The [Electron Upgrades Working Group](https://github.com/electron/governance/tree/main/wg-upgrades) believes that the benefits of pointer compression and the V8 memory cage outweigh the downsides. There are three main reasons for doing so:

1. It keeps Electron closer to Chromium. The less Electron diverges from Chromium in complex internal details such as V8 configuration, the less likely we are to accidentally introduce bugs or security vulnerabilities. Chromium's security team is formidable, and we want to make sure we are taking advantage of their work. Further, if a bug only affects configurations that aren't used in Chromium, fixing it is not likely to be a priority for the Chromium team.
2. It performs better. [Pointer compression reduces V8 heap size by up to 40% and improves CPU and GC performance by 5%–10%](https://v8.dev/blog/pointer-compression#results). For the vast majority of Electron applications which won't bump into the 4GB heap size limit and don't use native modules that require external buffers, these are significant performance wins.
3. It's more secure. Some Electron apps run untrusted JavaScript (hopefully following our [security recommendations](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)!), and for those apps, having the V8 memory cage enabled protects them from a large class of nasty V8 vulnerabilities.

Lastly, there are workarounds for apps that really need a larger heap size. For example, it is possible to include a copy of Node.js with your app, which is built with pointer compression disabled, and move the memory-intensive work to a child process. Though somewhat complicated, it is also possible to build a custom version of Electron with pointer compression disabled, if you decide you want a different trade-off for your particular use case. And lastly, in the not-too-distant future, [wasm64](https://github.com/WebAssembly/memory64) will allow apps built with WebAssembly both on the Web and in Electron to use significantly more than 4GB of memory.

---

## FAQ

### How will I know if my app is impacted by this change?
Attempting to wrap external memory with an ArrayBuffer will crash at runtime in Electron 20+.

If you don't use any native Node modules in your app, you're safe—there's no way to trigger this crash from pure JS. This change only affects native Node modules which allocate memory outside of the V8 heap (e.g. using `malloc` or `new`) and then wrap the external memory with an ArrayBuffer. This is a fairly rare use case, but some modules do use this technique, and such modules will need to be refactored in order to be compatible with Electron 20+.

### How can I measure how much V8 heap memory my app is using to know if I'm close to the 4GB limit?
In the renderer process, you can use [`performance.memory.usedJSHeapSize`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory), which will return the V8 heap usage in bytes. In the main process, you can use [`process.memoryUsage().heapUsed`](https://nodejs.org/api/process.html#processmemoryusage), which is comparable.

### What is the V8 memory cage?
Some documents refer to it as the "V8 sandbox", but that term is easily confusable with [other kinds of sandboxing](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/design/sandbox.md) that happen in Chromium, so I'll stick to the term "memory cage".

There's a fairly common kind of V8 exploit that goes something like this:

1. Find a bug in V8's JIT engine. JIT engines analyze code in order to be able to omit slow runtime type checks and produce fast machine code. Sometimes logic errors mean it gets this analysis wrong, and omits a type check that it actually needed—say, it thinks x is a string, but in fact it's an object.
2. Abuse this confusion to overwrite some bit of memory inside the V8 heap, for instance, the pointer to the beginning of an ArrayBuffer.
3. Now you have an ArrayBuffer that points wherever you like, so you can read and write **any** memory in the process, even memory that V8 normally doesn't have access to.

The V8 memory cage is a technique designed to categorically prevent this kind of attack. The way this is accomplished is by _not storing any pointers in the V8 heap_. Instead, all references to other memory inside the V8 heap are stored as offsets from the beginning of some reserved region. Then, even if an attacker manages to corrupt the base address of an ArrayBuffer, for instance by exploiting a type confusion error in V8, the worst they can do is read and write memory inside the cage, which they could likely already do anyway.
There's a lot more available to read on how the V8 memory cage works, so I won't go into further detail here—the best place to start reading is probably the [high-level design doc](https://docs.google.com/document/d/1FM4fQmIhEqPG8uGp5o9A-mnPB5BOeScZYpkHjo0KKA8/edit) from the Chromium team.

### I want to refactor a Node native module to support Electron 20+. How do I do that?
There are two ways to go about refactoring a native module to be compatible with the V8 memory cage. The first is to **copy** externally-created buffers into the V8 memory cage before passing them to JavaScript. This is generally a simple refactor, but it can be slow when the buffers are large. The other approach is to **use V8's memory allocator** to allocate memory which you intend to eventually pass to JavaScript. This is a bit more involved, but will allow you to avoid the copy, meaning better performance for large buffers.

To make this more concrete, here's an example N-API module that uses external array buffers:

```c
// Create some externally-allocated buffer.
// |create_external_resource| allocates memory via malloc().
size_t length = 0;
void* data = create_external_resource(&length);
// Wrap it in a Buffer--will fail if the memory cage is enabled!
napi_value result;
napi_create_external_buffer(
    env, length, data,
    finalize_external_resource, NULL, &result);
```

This will crash when the memory cage is enabled, because data is allocated outside the cage. Refactoring to instead copy the data into the cage, we get:

```c
size_t length = 0;
void* data = create_external_resource(&length);
// Create a new Buffer by copying the data into V8-allocated memory
napi_value result;
void* copied_data = NULL;
napi_create_buffer_copy(env, length, data, &copied_data, &result);
// If you need to access the new copy, |copied_data| is a pointer
// to it!
```

This will copy the data into a newly-allocated memory region that is inside the V8 memory cage. Optionally, N-API can also provide a pointer to the newly-copied data, in case you need to modify or reference it after the fact.

Refactoring to use V8's memory allocator is a little more complicated, because it requires modifying the `create_external_resource` function to use memory allocated by V8, instead of using `malloc`. This may be more or less feasible, depending on whether or not you control the definition of `create_external_resource`. The idea is to first create the buffer using V8, e.g. with `napi_create_buffer`, and then initialize the resource into the memory that has been allocated by V8. It is important to retain a `napi_ref` to the Buffer object for the [lifetime of the resource](https://nodejs.org/api/n-api.html#references-to-objects-with-a-lifespan-longer-than-that-of-the-native-method), otherwise V8 may garbage-collect the Buffer and potentially result in use-after-free errors.

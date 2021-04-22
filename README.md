# electronjs.org-new

This repository contains the code for the new electronsjs.org website. It is built using
[Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

```console
yarn install
```

## Local Development

If you want to use the contents from [`electron/electron`](https://github.com/electron/electron)
run the following:

```console
yarn prebuid
yarn start
```

If you want the website to pick your local documentation, run:

```console
yarn prebuild ../relative/path/to/local/electron/repo
yarn start
```

For example, if you have the following structure:

```
└── projects
     ├─ electron
     ├─ electronjs.org-new
     ├─ ...
```

and assuming your prompt is in `/projects/electronjs.org-new/` you will have to run:

```console
yarn prebuild ../electron
yarn start
```

`yarn start` starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

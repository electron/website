# `create-electron-documentation`

The goal of this package is to help developers create the scaffolding
for [Electron] examples faster.

## How to use it?

Electron's documentation is under the `/docs` folder of the [main repo].
You will have to clone it locally and call the following script from one
of the folders under `/docs` (e.g.: [`/docs/tutorial`][tutorials]):

```console
npm create electron-documentation
```

The script will prompt you to enter the documentation page title and description:

```console
> npm create electron-documentation
> Title:
> my-new-doc-page
> Description:
> A description for my new doc page
```

Once executed, the following files will be created:

- A markdown file `the-provided-title.md` in the folder you invoked the script
- A new folder under `/docs/fiddles/the-provided-title` with a minimum [fiddle]
  example for your documentation following good practices.

At this point, feel free to modify any of them or move the fiddle somewhere
else (but remember to update the reference in the markdown file!).

Thanks for contributing to Electron!

[electron]: https://www.electronjs.org
[fiddle]: https://www.electronjs.org/fiddle
[main repo]: https://github.com/electron/electron
[tutorials]: https://github.com/electron/electron/tree/main/docs/tutorial

# Docusaurus Plugins

From the [Docusaurus documentation](https://docusaurus.io/docs/using-plugins):

> Plugins are the building blocks of features in a Docusaurus 2 site. Each plugin
> handles its own individual feature. Plugins may work and be distributed as part
> of a bundle via presets.

By default, Docusaurus' classic theme comes with plugins to display different types
of content (docs, blog, one-off pages, etc.). You can also create custom plugins
using the Docusaurus [Lifecycle APIs](https://docusaurus.io/docs/lifecycle-apis).

## Custom page plugins

`@docusaurus/content-plugin-pages` already handles static page creation, but not the
loading of remote content for each specific page. For pages that need to load data
from external sources (e.g. the `/governance` route loading from the GitHub API),
we need to write a one-off plugin that fetches the data, stores it into a JSON
file in the `.docusaurus/` cache, and gets loaded into the page component as a prop
on compile-time.

### Architecture

The architecture of this type of plugin has two parts: the plugin itself, and the React
code that acts as the page template.

This is what the plugin code looks like:

```
plugins/my-plugin
└── index.js
```

The `index.js` file is the entry point, and should use the `loadContent` and `contentLoaded`
lifecycle APIs to create a new route in the Docusaurus website and load the remote data
into a React component.

```js
module.exports = function myPlugin() {
  return {
    name: 'my-plugin-name',
    async loadContent() {
      const data = await loadSomeContentHere();
      return data; // gets passed to contentLoaded API
    },
    async contentLoaded({content, actions}) {
      // saves to the `.docusaurus/` cache.
      const myFile = await actions.createData(
        `my-file.json`,
        JSON.stringify(content), // content from above
      );
      // adds the page as a route
      actions.addRoute({
        path: '/my-route-on-website',
        exact: true,
        component: '@site/src/pages/_my-page.jsx', // the react template component
        modules: {
          myPropName: myFile, // myPropName passed down as prop to component
        },
      });
    }
  }
}
```

Notice how the above `actions.addRoute` call specifies a `component` property.
This is the React template that'll be used to generate the page UI.

This component can be placed anywhere, but we've made the decision to put this
component into the same folder as pages handled by `@docusaurus/content-plugin-pages`.
Because of some bundler magic, we can use the `@site` prefix from the plugin to specify
the site root.

```
src/pages
├── _my-page.jsx
├── _my-page.module.scss
```

Notice that `_my-page.jsx` begins with an `_underscore`. This is so that
`@docusaurus/content-plugin-pages` will ignore the file.

Also, we prefer to use CSS modules for page-specific custom styles.

### Examples

* [plugins/fiddle](./fiddle/index.ts)
* [plugins/releases](./releases/index.ts)

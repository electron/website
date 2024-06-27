# Swizzled `src/theme` Components

The contents of this folder are custom Docusaurus React components generated
from the `yarn swizzle @docusaurus/theme-classic <component-name>` command.

Note that Docusaurus discourages the use of this command during the beta phase
due to API instability, so please keep swizzling to a minimum.

For more reading, see the [Themes](https://docusaurus.io/docs/using-themes)
guide in the Docusaurus documentation.

## List of Swizzled components

### `BlogSidebar` (unsafe)

To enhance the functionality of our blog sidebar, we [patched Docusaurus](https://github.com/electron/website/pull/587/files#diff-e196318ff66c78116a07aaa92f5eb7191cf888f36bd942e609a12ff75167f9ed)
to extract the publication date of each blog post from its YAML frontmatter
in the sidebar prop passed to `BlogSidebar` component. Utilizing this
date, we can then group the posts by year, in both desktop and mobile.
This improves the navigational experience for users by making it easier
for them to find content from specific years.

### `DocSidebarItem` (unsafe)

Electron has a lot of platform-specific APIs, and guides to go along with them.
A lot of these guides have long-winded suffixes indicating which platforms they
apply to (e.g. `(Windows and macOS)`). This information is more scannable with
visual imagery instead of text.

We can attach metadata onto `sidebars.js` items via the `customProps` object,
but the default `DocSidebarItem` component has no way to act on the props being
passed in, so we must Swizzle.

See: https://docusaurus.io/docs/sidebar#passing-custom-props

The `customProps` object will accept a `tags` property of type
`Array<'mac'|'windows'|'linux'>`. These will be rendered as SVG icons that are
stored as static assets in `static/assets/img/`.

```js
// sidebars.js
{
  type: 'doc',
  id: 'doc1',
  customProps: {
    tags: ['mac', 'windows', 'linux']
  },
};
```

### `TOC` (unsafe)

Electron's documentation uses a lot of Markdown syntax in its API documentation
headings to denote if an API has certain attributes (platform-specific, experimental,
deprecated, etc.). This clutters up heading titles.

We customize the right-hand side Table of Contents (TOC) component to run a script
(see `src/utils/cleanHeadings.js`) that cleans up the heading content before
it gets displayed on the website.

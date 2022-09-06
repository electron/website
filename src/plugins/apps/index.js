//@ts-check
const { default: fetch } = require('node-fetch');

module.exports = async function appsPlugin() {
  // TODO: actually use the electron/apps repo as a data source
  const response = await fetch(
    'https://raw.githubusercontent.com/erickzhao/apps/master/index.json'
  );
  const apps = await response.json();
  return {
    name: 'apps-plugin',
    async loadContent() {
      const FAVS = new Set([
        '1password',
        'agora-flat',
        'asana',
        'discord',
        'figma',
        'github-desktop',
        'hyper',
        'itchio',
        'loom',
        'microsoft-teams',
        'notion',
        'obsidian',
        'polypane',
        'postman',
        'signal',
        'slack',
        'skype',
        'splice',
        'tidal',
        'trello',
        'twitch',
        'visual-studio-code',
        'whatsapp',
        'wordpress',
      ]);

      const appsWithExtraMetadata = apps.map((app) => ({
        ...app,
        isFavorite: FAVS.has(app.slug),
      }));

      return {
        apps: appsWithExtraMetadata,
        categories: Object.fromEntries(
          appsWithExtraMetadata.reduce((map, app) => {
            if (map.has(app.category)) {
              const list = map.get(app.category);
              list.push(app);
            } else {
              map.set(app.category, [app]);
            }
            return map;
          }, new Map())
        ),
      };
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      setGlobalData(content);
    },
  };
};

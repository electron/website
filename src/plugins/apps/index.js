const fetch = require('node-fetch');

module.exports = async function appsPlugin() {
  const response = await fetch(
    'https://raw.githubusercontent.com/erickzhao/apps/master/index.json'
  );
  const apps = await response.json();
  return {
    name: 'apps-plugin',
    async loadContent() {
      const FAVS = new Set([
        '1password',
        'asana',
        'discord',
        'figma',
        'flat',
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
        'whatsapp',
        'wordpress',
      ]);

      return {
        apps: apps.map((app) => ({
          ...app,
          isFavorite: FAVS.has(app.slug),
        })),
        favs: apps.filter((app) => FAVS.has(app.slug)),
      };
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      // Create friends global data
      setGlobalData(content);
    },
  };
};

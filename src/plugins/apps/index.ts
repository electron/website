import fetch from 'node-fetch';
import { Plugin } from '@docusaurus/types';

export interface App {
  category: string;
  date: string;
  description: string;
  faintColorOnWhite: string;
  highlightColor: string;
  isFavorite?: boolean;
  logo: string;
  name: string;
  repository: string;
  slug: string;
  website: string;
}

export interface AppsPluginContent {
  apps: App[];
  categories: Map<string, App>;
}

module.exports = async function appsPlugin() {
  // TODO: actually use the electron/apps repo as a data source
  const response = await fetch(
    'https://raw.githubusercontent.com/erickzhao/apps/master/index.json'
  );
  const apps = (await response.json()) as App[];
  const plugin: Plugin<AppsPluginContent> = {
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
  return plugin;
};

import fetch from 'node-fetch';
import semver from 'semver';
import { Plugin } from '@docusaurus/types';

module.exports = async function fiddleVersionPlugin() {
  const plugin: Plugin<string> = {
    name: 'fiddle-versions-plugin',
    async loadContent() {
      const response = await fetch(
        'https://github.com/electron/fiddle/releases/latest',
        {
          method: 'GET',
        }
      );

      return response.url;
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      const url = new URL(content);
      const version = semver.parse(url.pathname.split('/').pop());
      setGlobalData(version);
    },
  };

  return plugin;
};

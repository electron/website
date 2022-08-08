const fetch = require('node-fetch');
const semver = require('semver');

module.exports = async function fiddleVersionPlugin() {
  // ...
  return {
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
      // Create friends global data
      const url = new URL(content);
      const version = semver.parse(url.pathname.split('/').pop());
      setGlobalData(version);
    },
  };
};

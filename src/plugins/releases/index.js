const releases = require('electron-releases/lite.json');

module.exports = async function releasesPlugin() {
  // ...
  return {
    name: 'releases-plugin',
    async loadContent() {
      const stable = releases.find(
        (release) =>
          release.npm_dist_tags.length > 0 &&
          release.npm_dist_tags.includes('latest')
      );
      const beta = releases.find(
        (release) =>
          release.npm_dist_tags.length > 0 &&
          release.npm_dist_tags.includes('beta')
      );
      const alpha = releases.find(
        (release) =>
          release.npm_dist_tags.length > 0 &&
          release.npm_dist_tags.includes('alpha')
      );
      const nightly = releases.find(
        (release) =>
          release.npm_dist_tags.length > 0 &&
          release.npm_dist_tags.includes('nightly')
      );
      return { stable, alpha, beta, nightly };
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      // Create friends global data
      setGlobalData(content);
    },
  };
};

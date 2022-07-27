const fetch = require('node-fetch');
const semver = require('semver');

module.exports = async function releasesPlugin() {
  return {
    name: 'releases-plugin',
    async loadContent() {
      const req = await fetch.default(
        'https://electronjs.org/headers/index.json'
      );
      const releases = (await req.json()).sort((a, b) =>
        semver.compare(b.version, a.version)
      );
      const stable = releases.find((release) => !release.version.includes('-'));
      const prerelease = releases.find(
        (release) =>
          release.version.includes('beta') || release.version.includes('alpha')
      );
      const nightly = releases.find((release) =>
        release.version.includes('nightly')
      );
      return { stable, prerelease, nightly };
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      // Create friends global data
      setGlobalData(content);
    },
  };
};

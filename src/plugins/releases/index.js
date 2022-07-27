const fetch = require('node-fetch');
const semver = require('semver');

module.exports = async function releasesPlugin() {
  return {
    name: 'releases-plugin',
    async loadContent() {
      const req = await fetch.default(
        'https://electronjs.org/headers/index.json'
      );
      // sort all versions by semver (descending)
      const releases = (await req.json()).sort((a, b) =>
        semver.compare(b.version, a.version)
      );
      // stable releases won't have a prerelease tag
      const stable = releases.find((release) => !release.version.includes('-'));
      // the highest semver prerelease will be the latest alpha or beta
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

import fetch, { Response } from 'node-fetch';
import semver from 'semver';

import { Plugin } from '@docusaurus/types';

/**
 * A partial implementation of the Electron header type
 */
interface ReleaseInfo {
  chrome: string;
  node: string;
  version: string;
}

export interface ReleasesPluginContent {
  stable: ReleaseInfo;
  prerelease: ReleaseInfo;
  nightly: ReleaseInfo;
}

let req: Response;

module.exports = async function releasesPlugin() {
  const plugin: Plugin<ReleasesPluginContent> = {
    name: 'releases-plugin',
    async loadContent() {
      if (!req) {
        req = await fetch('https://electronjs.org/headers/index.json');
      }
      // sort all versions by semver (descending)
      const releases = ((await req.json()) as ReleaseInfo[]).sort((a, b) =>
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
      setGlobalData(content);
    },
  };

  return plugin;
};

import { Plugin } from '@docusaurus/types';
import AdmZip from 'adm-zip';

export interface PrReleaseVersions {
  release: string | null;
  backports: Array<string>;
}
export type PrReleaseVersionsPluginContent = Map<number, PrReleaseVersions>;

interface PrReleaseArtifact {
  data: PrReleaseVersionsPluginContent;
  endCursor: string;
}

module.exports = async function prReleaseVersionsPlugin() {
  const plugin: Plugin<PrReleaseVersionsPluginContent> = {
    name: 'pr-release-versions-plugin',
    async loadContent() {
      // TODO: Add error handling and logging
      if (process.env.GITHUB_ACTIONS === 'true' && !process.env.GH_TOKEN) {
        throw new Error('GH_TOKEN is required when running in GitHub Actions.');
      }

      // TODO: Remove this
      if (process.env.LOCAL_DEV === 'true') {
        const versions: PrReleaseVersionsPluginContent = new Map([
          [
            35658,
            {
              release: 'v30.0.0-nightly.20231214',
              backports: ['v29.0.0-alpha.9'],
            },
          ],
          [
            41391,
            {
              release: 'v31.0.0-alpha.1',
              backports: [] as string[],
            },
          ],
          [
            42086,
            {
              release: 'v32.0.0-nightly.20240531',
              backports: ['v31.0.0'],
            },
          ],
        ]);

        return versions;
      }

      // ? Maybe log this?
      if (!process.env.GH_TOKEN) return null;

      const fetchOptions = {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
        },
      };

      const artifactsListResponse = await fetch(
        'https://api.github.com/repos/electron/website/actions/artifacts',
        fetchOptions
      );
      const latestArtifact = (await artifactsListResponse.json()).artifacts
        .filter(({ name }) => name === 'resolved-pr-versions')
        .sort((a: { id: number }, b: { id: number }) => a.id > b.id)[0];

      // ? Maybe use streams/workers
      const archiveDownloadResponse = await fetch(
        latestArtifact.archive_download_url,
        fetchOptions
      );
      const buffer = Buffer.from(await archiveDownloadResponse.arrayBuffer());

      const zip = new AdmZip(buffer);
      const parsedData = JSON.parse(
        zip.readAsText(zip.getEntries()[0])
      ) as PrReleaseArtifact;

      if (!parsedData?.data) {
        throw new Error('No data found in the artifact.');
      }

      return parsedData.data;
    },
    async contentLoaded({ content: versions, actions }) {
      const { setGlobalData } = actions;
      setGlobalData(versions);
    },
  };

  return plugin;
};

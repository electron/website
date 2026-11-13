import type { LoadContext } from '@docusaurus/types';

import { fetchData } from './fetch-data.ts';

module.exports = function governancePlugin(context: LoadContext) {
  return {
    name: 'electron-governance-plugin',
    async loadContent() {
      const workingGroups = await fetchData();
      return workingGroups;
    },
    async contentLoaded({ content, actions }) {
      const governanceJSON = await actions.createData(
        `governance.json`,
        JSON.stringify(content),
      );
      actions.addRoute({
        // Prefix with the locale's baseUrl (e.g. `/de/`) so the route
        // matches links on translated sites.
        path: `${context.baseUrl}governance`,
        component: '@site/src/plugins/governance/components/index.tsx',
        modules: {
          governance: governanceJSON,
        },
        exact: true,
      });
    },
  };
};

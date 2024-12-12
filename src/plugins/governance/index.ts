import { fetchData } from './fetch-data';

module.exports = function governancePlugin() {
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
        path: '/governance',
        component: '@site/src/plugins/governance/components/index.tsx',
        modules: {
          governance: governanceJSON,
        },
        exact: true,
      });
    },
  };
};

//@ts-check

const { fetchData } = require("./fetch-data")

module.exports = function myPlugin() {
  return {
    name: 'electron-governance-plugin',
    async loadContent() {
      const workingGroups = await fetchData();
      return workingGroups;
    },
    async contentLoaded({content, actions}) {
      const governanceJSON = await actions.createData(
        `governance.json`,
        JSON.stringify(content),
      );
      actions.addRoute({
        path: '/governance',
        component: '@site/src/pages/_governance.jsx',
        modules: {
          // propName -> JSON file path
          governance: governanceJSON,
        },
        exact: true,
      });

    }
  }
}

//@ts-check

const { writeFile } = require('fs').promises;
const { dirname } = require('path');
const makeDir = require('make-dir');

const saveJSON = async (filename, contents) => {
  await makeDir(dirname(filename));

  await writeFile(filename, `${JSON.stringify(contents, null, 2)}\n`);
};

module.exports = {
  saveJSON,
};

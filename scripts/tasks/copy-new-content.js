const fs = require('fs').promises;
const path = require('path');

const newContent = new Map();

/**
 * Copies the new content files to the destination
 * @param {string} destination
 */
const copyNewContent = async (destination) => {
  for (const [source, target] of newContent) {
    await fs.copyFile(
      path.join(__dirname, source),
      path.join(destination, target)
    );
  }
};

module.exports = {
  copyNewContent,
};

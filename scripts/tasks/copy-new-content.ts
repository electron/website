import fs from 'fs-extra';
import path from 'path';

const newContent = new Map([['how-to-examples.md', 'tutorial/examples.md']]);

/**
 * Copies the new content files to the destination
 * @param destination
 */
export const copyNewContent = async (destination: string) => {
  for (const [source, target] of newContent) {
    await fs.copyFile(
      path.join(__dirname, source),
      path.join(destination, target)
    );
  }
};

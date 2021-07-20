//@ts-check

/**
 * Transforms the original markdown of the posts in electron/electronjs.org
 * into something that can be consumed by Docusaurus.
 *
 * This should not happen very frequently as we want to move the blog content
 * to this repo, but until that happens this file should remain here.
 */

const fs = require('fs').promises;
const path = require('path');
const globby = require('globby');
const frontmatter = require('gray-matter');

const start = async () => {
  const postsPaths = await globby(['blog/*.md']);

  const imgRegex = /<img\s((.|\n)*?)>/gm;
  const descriptionRegex = /((.|\n)*)\n---\n/gm;

  for (const postPath of postsPaths) {
    const post = await fs.readFile(postPath, 'utf-8');
    const info = frontmatter(post);

    if (Array.isArray(info.data.author)) {
      const authors = info.data.author;
      info.data.author = 'Electron';
      info.content += `
Signed ${authors.map((author) => `@${author}`).join(', ')}
`;
    }

    info.content = info.content
      .replace(imgRegex, `<img $1/>`)
      .replace(/<br>/gm, '<br />');

    info.data.slug = path.basename(postPath).replace('.md', '');
    info.data.date = new Date(info.data.date);

    const content = frontmatter.stringify(info.content.trim(), info.data);

    await fs.writeFile(postPath, content, 'utf-8');
  }
};

start();

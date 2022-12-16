/**
 * Transforms the original markdown of the posts in electron/electronjs.org
 * into something that can be consumed by Docusaurus.
 *
 * This should not happen very frequently as we want to move the blog content
 * to this repo, but until that happens this file should remain here.
 */
import path from 'path';

import fs from 'fs-extra';
import globby from 'globby';
import frontmatter from 'gray-matter';

const createAuthor = (author: string) => {
  return {
    name: author,
    url: `https://github.com/${author}`,
    image_url: `https://github.com/${author}.png?size=96`,
  };
};

const start = async () => {
  const postsPaths = await globby(['blog/*.md']);

  const imgRegex = /<img\s((.|\n)*?)>/gm;

  for (const postPath of postsPaths) {
    const post = await fs.readFile(postPath, 'utf-8');
    const info = frontmatter(post);

    // Docusaurus multiple authors format is different: https://docusaurus.io/docs/blog#blog-post-authors
    if (info.data.author) {
      info.data.authors = Array.isArray(info.data.author)
        ? info.data.author.map(createAuthor)
        : createAuthor(info.data.author);

      delete info.data.author;
    }
    info.content = info.content
      .replace(imgRegex, `<img $1/>`)
      .replace(/<br>/gm, '<br />')
      .replace(/\/\/>/gm, '/>');

    info.data.slug = path.basename(postPath).replace('.md', '');
    info.data.date = new Date(info.data.date);

    const content = frontmatter.stringify(info.content.trim(), info.data);

    await fs.writeFile(postPath, content, 'utf-8');
  }
};

start();

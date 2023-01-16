import globby from 'globby';
import path from 'path';
import fs from 'fs-extra';
/*
  To make `/docs/latest` have content we need to set the
  slug of a particular page to `/latest/`. `START_PAGE` is how we
  indicate the right document.
*/
const START_PAGE = 'tutorial/introduction.md';

/**
 * Collects all documentation files in the repo.
 * @param startPath The absolute path for the docs folder
 * @returns A Map of file paths and their corresponding file contents
 */
const getMarkdownFiles = async (startPath: string) => {
  const filesPaths = await globby(path.posix.join(startPath, '**/*.md'));

  const files = new Map();
  for (const filePath of filesPaths) {
    const content = await fs.readFile(filePath, 'utf-8');
    files.set(filePath, content);
  }

  return files;
};

/**
 * Generates a title using the file name.
 * This should be used as a last resort.
 * @param filepath
 */
const getTitleFromPath = (filepath: string) => {
  const filename = path.basename(filepath);
  const title = filename
    // Other logic here
    .replace(/-/g, ' ');

  return title;
};

/**
 * Removes markdown links and quotes
 * @param content
 */
const cleanUpMarkdown = (content: string) => {
  const mdLinkRegex = /\[(.*?)\][([].*?[)\]]/gim;
  const groups = content.matchAll(mdLinkRegex);
  let cleanedUp = content;

  if (!groups) {
    return cleanedUp;
  }

  for (const group of groups) {
    const [match, replacement] = group;
    cleanedUp = cleanedUp.replace(match, replacement);
  }

  // Other link formats and inline codeblocks
  cleanedUp = cleanedUp
    .replace(/\[`/g, '')
    .replace(/`\]/g, '')
    .replace(/`/g, '')
    .trim();

  return cleanedUp;
};

/**
 * Returns the first paragraph of content (first
 * occurrence of `\n\n`) without
 * considering the headers
 * @param content
 */
const getDescriptionFromContent = (content: string) => {
  const lines = content.split('\n');

  let description = '';
  let subHeader = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // The content of structures is often only bullet lists and no general description
    if (trimmedLine.startsWith('#') || trimmedLine.startsWith('*')) {
      if (subHeader && description.length > 0) {
        return cleanUpMarkdown(description.trim());
      } else {
        subHeader = true;
      }
    } else if (trimmedLine.length === 0) {
      if (description.length > 0) {
        return cleanUpMarkdown(description.trim());
      }
    } else {
      description += `${trimmedLine.replace(/^>/, '')} `;
    }
  }

  return description;
};

/**
 *
 * @param content
 * @param filepath
 */
const addFrontMatter = (content: string, filepath: string) => {
  if (content.startsWith('---')) {
    return content;
  }

  // Some pages (under API mostly) start with ## instead of #
  const titleRegex = /^##?\s(.*)$/im;
  const titleMatches = content.match(titleRegex);
  const title = titleMatches
    ? titleMatches[1].trim()
    : getTitleFromPath(filepath).trim();

  // The description of the files under `api/structures` is not meaningful so we ignore it
  const description = filepath.includes('structures')
    ? ''
    : getDescriptionFromContent(content);
  const defaultSlug = path.basename(filepath, '.md');

  let slug: string;

  if (filepath.endsWith(START_PAGE)) {
    slug = '/latest/';
  } else if (path.dirname(filepath).endsWith(defaultSlug)) {
    // We want paths like `/security/security/` to be `/security/`
    slug = `/${defaultSlug}/`;
  } else {
    slug = defaultSlug;
  }

  const mdWithFrontmatter = `---
title: "${title}"
description: "${description.replace(/"/g, '\\"')}"
slug: ${slug}
hide_title: false
---

${content}`;

  return mdWithFrontmatter;
};

/**
 * Automatically adds a frontmatter to all the markdown
 * files under `startPath` using the first heading as
 * title and paragraph as description.
 * @param startPath
 */
export const addFrontmatterToAllDocs = async (startPath: string) => {
  const files = await getMarkdownFiles(startPath);

  for (const [filepath, content] of files) {
    const newContent = addFrontMatter(content, filepath);

    await fs.writeFile(filepath, newContent, 'utf-8');
  }
};

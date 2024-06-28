import globby from 'globby';
import path from 'path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';
import type { Code, Html, Root } from 'mdast';
import type { Node, Literal } from 'unist';
import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { readFile, writeFile } from 'fs/promises';
import { fromHtml } from 'hast-util-from-html';
import logger from '@docusaurus/logger';
import { parse as parseYaml } from 'yaml';

const apiHistoryRegex = /<!--[\s\S]*?(```[\s\S]*?```)[\s\S]*?-->/;

interface ChangeSchema {
  'pr-url': string;
  'breaking-changes-header'?: string;
  description?: string;
}

interface ApiHistory {
  added?: ChangeSchema[];
  deprecated?: ChangeSchema[];
  changes?: ChangeSchema[];
}

interface LiteralString extends Literal {
  value: string;
}

// Copied from here: <https://github.com/electron/website/blob/feat/api-history/scripts/tasks/add-frontmatter.ts#L16-L23>
const getMarkdownFiles = async (startPath: string) => {
  const filesPaths = await globby(path.posix.join(startPath, '**/*.md'));

  const files: Map<string, string> = new Map();
  for (const filePath of filesPaths) {
    const content = await readFile(filePath, 'utf-8');
    files.set(filePath, content);
  }

  return files;
};

// Copied from here but slightly different: <https://github.com/electron/lint-roller/blob/bac245478ba69017c2a82e8ba1b2884a37647494/bin/lint-markdown-api-history.ts#L42-L67>
function findPossibleApiHistoryBlocks(tree: Root) {
  const codeBlocks: Html[] = [];

  visit(
    tree,
    (node: Node) =>
      node.type === 'html' &&
      (node as LiteralString).value.toLowerCase().includes('```') &&
      (node as LiteralString).value.toLowerCase().includes('yaml') &&
      (node as LiteralString).value.toLowerCase().includes('history'),
    (node) => {
      codeBlocks.push(node as Html);
    }
  );

  return codeBlocks;
}

function findValidApiHistoryBlocks(
  possibleHistoryBlocks: Html[],
  filePath: string,
  validateAgainstSchema: ValidateFunction<ApiHistory>
) {
  const validHistoryBlocks: Html[] = [];

  // All of the validation logic copied from here: <https://github.com/electron/lint-roller/blob/bac245478ba69017c2a82e8ba1b2884a37647494/bin/lint-markdown-api-history.ts#L117-L176>
  for (const possibleHistoryBlock of possibleHistoryBlocks) {
    const {
      children: [htmlComment],
    } = fromHtml(possibleHistoryBlock.value);

    if (htmlComment.type !== 'comment') {
      logger.warn(
        `Possible API History block is not in a HTML comment (${logger.green(
          filePath
        )})`
      );
      continue;
    }

    const {
      children: [codeBlock],
    } = fromMarkdown(htmlComment.value);

    if (
      codeBlock.type !== 'code' ||
      codeBlock.lang?.toLowerCase() !== 'yaml' ||
      codeBlock.meta?.trim() !== 'history'
    ) {
      // TODO: Better error message
      logger.warn(
        `Error parsing possible history block in ${logger.green(filePath)}`
      );
      continue;
    }

    let unsafeHistory = null;

    try {
      unsafeHistory = parseYaml(codeBlock.value);
    } catch (error) {
      logger.warn(
        `Error parsing YAML in possible history block (${logger.green(
          filePath
        )})`
      );
      continue;
    }

    const isValid = validateAgainstSchema(unsafeHistory);

    if (!isValid) {
      logger.warn(
        `Error validating YAML in possible history block (${logger.green(
          filePath
        )})`
      );
      continue;
    }

    validHistoryBlocks.push(possibleHistoryBlock);
  }

  return validHistoryBlocks;
}

export const preprocessApiHistory = async (startPath: string) => {
  // ? Allow for a custom schema to be passed in.
  const schema = path.resolve(startPath, 'api-history.schema.json');

  let validateAgainstSchema: ValidateFunction<ApiHistory> | null = null;

  try {
    const ajv = new Ajv();
    const ApiHistorySchemaFile = await readFile(schema, { encoding: 'utf-8' });
    const ApiHistorySchema = JSON.parse(
      ApiHistorySchemaFile
    ) as JSONSchemaType<ApiHistory>;
    validateAgainstSchema = ajv.compile(ApiHistorySchema);
  } catch (error) {
    logger.error(`Error reading API history schema:\n${error}`);
    return;
  }

  const files = await getMarkdownFiles(startPath);

  for (const [filePath, content] of files) {
    const tree = fromMarkdown(content);

    const possibleHistoryBlocks = findPossibleApiHistoryBlocks(tree as Root);
    const validHistoryBlocks = findValidApiHistoryBlocks(
      possibleHistoryBlocks,
      filePath,
      validateAgainstSchema
    );

    if (validHistoryBlocks.length === 0) continue;

    let newContent = content;
    let fileLengthDifference = 0;

    // Strip HTML comment tags from history blocks
    for (const validHistoryBlock of validHistoryBlocks) {
      const apiHistoryRegexMatches =
        validHistoryBlock.value.match(apiHistoryRegex);

      if (apiHistoryRegexMatches.length !== 2) {
        logger.warn(
          `Error extracting the API history block inside HTML comment in ${logger.green(
            filePath
          )}`
        );
        continue;
      }

      const [, historyBlockWithoutTags] = apiHistoryRegexMatches;

      const start = newContent.substring(
        0,
        validHistoryBlock.position!.start.offset + fileLengthDifference
      );
      const end = newContent.substring(
        validHistoryBlock.position!.end.offset + fileLengthDifference
      );

      // Stripping the HTML comment tags of a history block will offset the position of the next history block
      fileLengthDifference +=
        historyBlockWithoutTags.length - validHistoryBlock.value.length;

      newContent = start + historyBlockWithoutTags + end;
    }

    await writeFile(filePath, newContent, { encoding: 'utf-8' });
  }
};

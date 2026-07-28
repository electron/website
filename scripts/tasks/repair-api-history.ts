import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '@docusaurus/logger';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

import {
  type ApiHistoryProblem,
  type ApiHistoryValidator,
  compileApiHistorySchema,
  getApiHistoryBlockProblem,
  matchApiHistoryCodeBlock,
} from './validate-api-history.ts';

import type { Code, Root } from 'mdast';

const PR_URL_REGEX = /https:\/\/github\.com\/electron\/electron\/pull\/\d+/g;

export interface RepairApiHistoryResult {
  repaired: number;
  unrepaired: ApiHistoryProblem[];
}

const findApiHistoryBlocks = (content: string) => {
  const blocks: Code[] = [];

  visit(fromMarkdown(content) as Root, matchApiHistoryCodeBlock, (node) => {
    blocks.push(node);
  });

  return blocks;
};

/**
 * The PR URLs of a block, which are never translated, so they identify
 * a block even when the surrounding content is in another language.
 * @param block
 */
const getSignature = (block: Code) =>
  (block.value.match(PR_URL_REGEX) ?? []).join(',');

/**
 * The block as it is written in the document, fence included.
 * @param content
 * @param block
 */
const getRawBlock = (content: string, block: Code) => {
  const { start, end } = block.position!;
  return content.slice(start.offset!, end.offset!);
};

/**
 * Finds the English counterpart of a translated block: by PR URLs first,
 * falling back to the position of the block in the document when a
 * translation mangled them.
 * @param block
 * @param index
 * @param englishBlocks
 * @param translatedBlockCount
 */
const findEnglishBlock = (
  block: Code,
  index: number,
  englishBlocks: Code[],
  translatedBlockCount: number,
) => {
  const signature = getSignature(block);

  if (signature !== '') {
    const matches = englishBlocks.filter(
      (englishBlock) => getSignature(englishBlock) === signature,
    );

    // Only trust the signature when it is unambiguous
    if (matches.length === 1) {
      return matches[0];
    }
  }

  if (englishBlocks.length === translatedBlockCount) {
    return englishBlocks[index];
  }

  return undefined;
};

const repairFile = async (
  filePath: string,
  englishFilePath: string,
  validateAgainstSchema?: ApiHistoryValidator,
): Promise<RepairApiHistoryResult> => {
  const content = await fs.readFile(filePath, 'utf-8');

  if (!content.includes('```')) return { repaired: 0, unrepaired: [] };

  const blocks = findApiHistoryBlocks(content);

  if (blocks.length === 0) return { repaired: 0, unrepaired: [] };

  // Only the broken blocks need touching, so don't read the English file until
  // we know there is something to repair
  const brokenBlocks = blocks
    .map((block, index) => ({
      block,
      index,
      reason: getApiHistoryBlockProblem(block, validateAgainstSchema),
    }))
    .filter(({ reason }) => reason !== undefined);

  if (brokenBlocks.length === 0) return { repaired: 0, unrepaired: [] };

  const toProblem = ({ block, reason }: (typeof brokenBlocks)[number]) => ({
    filePath,
    line: block.position!.start.line,
    reason: reason!,
    block: block.value,
  });

  let englishContent: string;

  try {
    englishContent = await fs.readFile(englishFilePath, 'utf-8');
  } catch {
    logger.warn(
      `No English counterpart for ${logger.green(filePath)}, cannot repair its API history blocks`,
    );
    return { repaired: 0, unrepaired: brokenBlocks.map(toProblem) };
  }

  const englishBlocks = findApiHistoryBlocks(englishContent);

  let repaired = 0;
  const unrepaired: ApiHistoryProblem[] = [];
  let newContent = content;

  // Replace back to front so the positions of the earlier blocks hold
  for (const brokenBlock of [...brokenBlocks].reverse()) {
    const { block, index } = brokenBlock;
    const englishBlock = findEnglishBlock(
      block,
      index,
      englishBlocks,
      blocks.length,
    );

    if (englishBlock === undefined) {
      unrepaired.push(toProblem(brokenBlock));
      continue;
    }

    newContent =
      newContent.slice(0, block.position!.start.offset!) +
      getRawBlock(englishContent, englishBlock) +
      newContent.slice(block.position!.end.offset!);
    repaired++;
  }

  if (newContent !== content) {
    await fs.writeFile(filePath, newContent, 'utf-8');
  }

  return { repaired, unrepaired };
};

/**
 * The structure of an API history block (its keys, PR URLs and
 * `breaking-changes-header` values) must stay in English or it breaks the
 * `api-history` transformer at build time, while its `description` values are
 * rendered to readers and are worth translating. So replace a block with its
 * English counterpart only when the translation has actually broken it, which
 * leaves translated descriptions in place everywhere else.
 * @param root The translated docs folder, e.g. `i18n/es/docusaurus-plugin-content-docs/current/latest`
 * @param englishRoot The English docs folder the translations were made from, e.g. `docs/latest`
 * @param schemaPath The **English** `api-history.schema.json`
 */
export const repairApiHistory = async (
  root: string,
  englishRoot: string,
  schemaPath: string,
): Promise<RepairApiHistoryResult> => {
  const validateAgainstSchema = await compileApiHistorySchema(schemaPath);
  const files = fs.glob('**/*.md', { cwd: root });

  let repaired = 0;
  const unrepaired: ApiHistoryProblem[] = [];

  for await (const filePath of files) {
    const result = await repairFile(
      path.join(root, filePath),
      path.join(englishRoot, filePath),
      validateAgainstSchema,
    );

    repaired += result.repaired;
    unrepaired.push(...result.unrepaired);
  }

  return { repaired, unrepaired };
};

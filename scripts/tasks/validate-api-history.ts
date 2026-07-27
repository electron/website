import fs from 'node:fs/promises';
import path from 'node:path';

import { logger } from '@docusaurus/logger';
import Ajv, { type ValidateFunction } from 'ajv';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';
import { parse as parseYaml } from 'yaml';

import { isCode } from '../../src/util/mdx-utils.ts';

import type { Code, Root } from 'mdast';
import type { Node } from 'unist';

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

export type ApiHistoryValidator = ValidateFunction<ApiHistory>;

export interface ApiHistoryProblem {
  filePath: string;
  line: number;
  reason: string;
  block: string;
}

/**
 * Same predicate the `api-history` remark transformer uses to pick up
 * blocks at build time, so we only flag blocks which can break the build.
 * See `src/transformers/api-history.ts`.
 */
export function matchApiHistoryCodeBlock(node: Node): node is Code {
  return (
    isCode(node) &&
    node.lang?.toLowerCase() === 'yaml' &&
    node.meta?.toLowerCase() === 'history'
  );
}

function isObject(
  value: unknown,
): value is Record<string | number | symbol, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Same shape check as `src/transformers/api-history.ts`, which throws
 * `Invalid API history YAML` from inside the MDX loader when it fails.
 */
function isApiHistory(value: unknown): value is ApiHistory {
  return (
    isObject(value) &&
    ('added' in value || 'deprecated' in value || 'changes' in value)
  );
}

/**
 * `description` is the one part of a history block we want translated, and a
 * translation is regularly longer than the source it came from. The 120
 * character cap is a style rule for the English docs, not something the site
 * needs, so drop it rather than reject a good translation over its length.
 * @param schema
 */
const allowLongDescriptions = (schema: Record<string, unknown>) => {
  const definitions = schema['definitions'];
  if (!isObject(definitions)) return;

  const baseChangeSchema = definitions['baseChangeSchema'];
  if (!isObject(baseChangeSchema)) return;

  const properties = baseChangeSchema['properties'];
  if (!isObject(properties)) return;

  const description = properties['description'];
  if (!isObject(description)) return;

  delete description['maxLength'];
};

/**
 * Compiles the API history JSON schema.
 *
 * Note this must always be the English schema: Crowdin translates the
 * localized copies of `api-history.schema.json` (`"type": "objeto"`), which
 * makes them useless for validation.
 * @param schemaPath
 */
export const compileApiHistorySchema = async (schemaPath: string) => {
  try {
    const ajv = new Ajv();
    const apiHistorySchemaFile = await fs.readFile(schemaPath, 'utf-8');
    const apiHistorySchema = JSON.parse(apiHistorySchemaFile) as Record<
      string,
      unknown
    >;
    allowLongDescriptions(apiHistorySchema);
    return ajv.compile<ApiHistory>(apiHistorySchema);
  } catch (error) {
    logger.warn(
      `Error reading API history schema, continuing without schema validation:\n${error}`,
    );
    return undefined;
  }
};

/**
 * Checks a single block, and returns why it is invalid, or `undefined` when
 * there is nothing wrong with it.
 * @param block
 * @param validateAgainstSchema
 */
export const getApiHistoryBlockProblem = (
  block: Code,
  validateAgainstSchema?: ApiHistoryValidator,
): string | undefined => {
  let apiHistory: unknown;

  try {
    apiHistory = parseYaml(block.value);
  } catch (error) {
    return `YAML could not be parsed: ${(error as Error).message}`;
  }

  // This is the check which fails the build in the `api-history` transformer
  if (!isApiHistory(apiHistory)) {
    return 'YAML has none of the `added`, `deprecated` or `changes` keys (were they translated?)';
  }

  if (validateAgainstSchema && !validateAgainstSchema(apiHistory)) {
    const details = (validateAgainstSchema.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message}`)
      .join(', ');
    return `YAML does not match the API history schema: ${details}`;
  }

  return undefined;
};

const getProblemsInFile = (
  filePath: string,
  content: string,
  validateAgainstSchema?: ApiHistoryValidator,
) => {
  const problems: ApiHistoryProblem[] = [];

  visit(fromMarkdown(content) as Root, matchApiHistoryCodeBlock, (node) => {
    const reason = getApiHistoryBlockProblem(node, validateAgainstSchema);

    if (reason !== undefined) {
      problems.push({
        filePath,
        line: node.position?.start.line ?? 0,
        reason,
        block: node.value,
      });
    }
  });

  return problems;
};

/**
 * Finds API history blocks a translation has broken. Those only blow up deep
 * inside the MDX loader at build time, so find them here instead.
 * @param root The docs folder to check, e.g. `i18n/es/docusaurus-plugin-content-docs/current`
 * @param schemaPath The **English** `api-history.schema.json`
 * @param version
 */
export const validateApiHistory = async (
  root: string,
  schemaPath: string,
  version = 'latest',
) => {
  const validateAgainstSchema = await compileApiHistorySchema(schemaPath);

  const files = fs.glob(`${version}/**/*.md`, { cwd: root });
  const problems: ApiHistoryProblem[] = [];

  for await (const filePath of files) {
    const fullFilePath = path.join(root, filePath);
    const content = await fs.readFile(fullFilePath, 'utf-8');

    if (!content.includes('```')) continue;

    problems.push(
      ...getProblemsInFile(fullFilePath, content, validateAgainstSchema),
    );
  }

  return problems;
};

/**
 * Logs the problems found by {@link validateApiHistory}.
 * @param problems
 */
export const logApiHistoryProblems = (problems: ApiHistoryProblem[]) => {
  for (const { filePath, line, reason, block } of problems) {
    logger.error(
      `Invalid API history block in ${logger.green(`${filePath}:${line}`)}: ${reason}\n${block}`,
    );
  }
};

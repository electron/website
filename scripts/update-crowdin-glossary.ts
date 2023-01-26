import fs from 'fs-extra';
import path from 'path';
import assert from 'assert';

import { Glossaries, UploadStorage } from '@crowdin/crowdin-api-client';
import logger from '@docusaurus/logger';
import {
  ParsedDocumentationResult,
  ClassDocumentationContainer,
  ModuleDocumentationContainer,
  StructureDocumentationContainer,
  ElementDocumentationContainer,
} from '@electron/docs-parser';
import * as dotenv from 'dotenv';
import latestVersion from 'latest-version';
import toString from 'mdast-util-to-string';
import fetch from 'node-fetch';
import remarkParse from 'remark-parse';
import unified from 'unified';

import { convertToCSV } from './utils/csv';
import { Parent, Text } from 'mdast';

dotenv.config();
const GLOSSARY_ID = 66562;
const glossary = new Map<string, string>();

/**
 * Narrows whether an API from electron-api.json is of type "Class"
 */
function isClass(
  api:
    | ModuleDocumentationContainer
    | ClassDocumentationContainer
    | StructureDocumentationContainer
    | ElementDocumentationContainer
): api is ClassDocumentationContainer {
  return api.type === 'Class';
}

/**
 * Collects all JavaScript built-ins in the current environment.
 */
function collectGlobals() {
  const globals = Object.getOwnPropertyNames(globalThis);
  for (const term of globals) {
    if (Object.keys(glossary.entries).includes(term)) return;
    glossary.set(
      term,
      'This is a JavaScript built-in and should usually not be translated.'
    );
  }
}

/**
 * Collects all Electron APIs and their respective methods and properties.
 */
async function collectElectronAPI() {
  const version = await latestVersion('electron');
  const url = `https://github.com/electron/electron/releases/download/v${version}/electron-api.json`;
  const apis: ParsedDocumentationResult = await (await fetch(url)).json();

  // Electron API names
  for (const api of apis) {
    glossary.set(
      api.name,
      `This is an Electron ${api.type} and should usually not be translated.`
    );
  }

  // Electron class instance methods, properties, and events
  for (const api of apis) {
    if (isClass(api)) {
      const methods = api.instanceMethods || [];
      for (const method of methods) {
        const term = `${api.instanceName}.${method.name}`;
        if (Object.keys(glossary.entries).includes(term)) continue;
        glossary.set(
          term,
          'This is an Electron instance method and should usually not be translated.'
        );
      }

      const props = api.instanceProperties || [];
      for (const prop of props) {
        const term = `${api.instanceName}.${prop.name}`;
        if (Object.keys(glossary.entries).includes(term)) continue;
        glossary.set(
          term,
          'This is an Electron instance property and should usually not be translated.'
        );
      }

      const events = api.instanceEvents || [];

      for (const event of events) {
        const term = event.name;
        // only include multi-word event names because some single-word events
        // are just common English words like `close` or `quit`.
        if (
          Object.keys(glossary.entries).includes(term) ||
          !term.includes('-')
        ) {
          continue;
        }
        glossary.set(
          term,
          'This is an Electron instance event and should usually not be translated.'
        );
      }
    }
  }
}

/**
 * Collects all entries in the Electron `glossary.md` doc.
 * For the definition, uses the first paragraph from each doc entry for brevity.
 */
async function collectElectronGlossary() {
  // Generate a Markdown AST from remark
  const source = path.join(__dirname, '..', 'docs', 'latest', 'glossary.md');
  const md = fs.readFileSync(source, 'utf8');
  const syntaxTree = unified().use(remarkParse).parse(md);

  // visit each top-level child of the syntax tree.
  // in the current doc, each glossary entry is an H3 (###)
  (syntaxTree as Parent).children.forEach((val, index, arr) => {
    if (val.type === 'heading' && val.depth === 3) {
      // value of the h3 text
      const headingText = (val.children[0] as Text).value;
      // the next element in the MDAST should be the first paragraph
      const firstParagraph = toString((arr[index + 1] as Parent).children)
        .replace(/"/g, '""') // escape double quotes for CSV " -> ""
        .replace(/\n/g, ' '); // replace newlines in text with spaces
      glossary.set(headingText, firstParagraph);
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  logger.info('Collecting all JavaScript built-ins');
  collectGlobals();
  logger.info('Collecting Electron API data');
  await collectElectronAPI();
  logger.info("Collecting data from Electron's glossary.md doc");
  await collectElectronGlossary();

  logger.info(
    `There are ${logger.green(glossary.size)} glossary entries to upload`
  );
  assert(
    glossary.size > 500,
    'There should be at least 500 values in the Electron glossary'
  );
  logger.info('Converting glossary to CSV format');
  const csv = convertToCSV(Array.from(glossary));

  if (!args.includes('--dry-run')) {
    // Updating the glossary is a two-step process with the v2 Crowdin API

    if (!process.env.CROWDIN_PERSONAL_TOKEN) {
      logger.error(
        `Missing ${logger.red('CROWDIN_PERSONAL_TOKEN')} environment variable`
      );
    }
    const glossaries = new Glossaries({
      token: process.env.CROWDIN_PERSONAL_TOKEN,
    });

    const uploadStorage = new UploadStorage({
      token: process.env.CROWDIN_PERSONAL_TOKEN,
    });

    // Step 1: Upload the CSV to the Crowdin server storage
    logger.info('Uploading glossary.csv to Crowdin server storage');
    const response = await uploadStorage.addStorage(
      `glossary-${Date.now()}.csv`,
      csv
    );
    const { id } = response.data;

    // Step 2: Assign the CSV in storage to the Electron glossary
    logger.info('Importing glossary.csv into Electron project glossary');
    await glossaries.importGlossaryFile(GLOSSARY_ID, {
      storageId: id,
      scheme: {
        term_en: 0,
        description_en: 1,
      },
    });
    logger.info(
      `✨ Done! See https://crowdin.com/resources/glossaries/${GLOSSARY_ID} for output.`
    );
  } else {
    logger.info('Dry run triggered, logging CSV output');
    console.log(csv);
  }
}

main().catch((err) => logger.error(err));

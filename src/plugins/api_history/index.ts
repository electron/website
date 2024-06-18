import { Options as StringReplaceLoaderOptions } from 'string-replace-loader';
import { Plugin } from '@docusaurus/types';

const apiHistoryRegex =
  /<!--\r?\n(```YAML history\r?\n([\s\S]*?)\r?\n```)\r?\n-->/g;

// TODO: Rename to something better
// MDX doesn't parse HTML comments: <https://github.com/mdx-js/mdx/pull/1039>
//  so we need to strip the HTML comment tags that surround the API history blocks.
module.exports =
  async function stripHtmlCommentTagsFromApiHistoryBlocksPlugin() {
    const plugin: Plugin<string> = {
      // TODO: Rename to something better
      name: 'stripHtmlCommentTagsFromApiHistoryBlocks-plugin',
      configureWebpack() {
        return {
          module: {
            rules: [
              {
                test: /\/api\/.*?\.md$/,
                loader: 'string-replace-loader',
                options: {
                  // TODO: Test this regex
                  search: apiHistoryRegex,
                  replace(_, p1) {
                    return p1;
                  },
                  flags: 'g',
                } satisfies StringReplaceLoaderOptions,
              },
            ],
          },
        };
      },
    };

    return plugin;
  };

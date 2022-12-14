import { Node } from 'unist';

/**
 * This is the output from remark-mdx
 * but that library isn't typed so we make do.
 */
export interface Import extends Node {
  type: 'import';
  value: string;
}

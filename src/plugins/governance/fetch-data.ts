import { remark } from 'remark';
import gfm from 'remark-gfm';
import toString from 'mdast-util-to-string';
import { Node, Parent } from 'unist';
import { Table, Link } from 'mdast';

export interface WorkingGroup {
  name: string;
  description: string;
  chair?: string;
  link: string;
  members: string[];
}

async function fetchData(): Promise<WorkingGroup[]> {
  const groupNames = [
    'administrative',
    'api',
    'community-safety',
    'ecosystem',
    'outreach',
    'releases',
    'security',
    'upgrades',
  ];

  const groups = await Promise.all(groupNames.map(getWGInfo));
  return groups;
}

function isTable(node: Node): node is Table {
  return node.type === 'table';
}

function isLink(node: Node): node is Link {
  return node.type === 'link';
}

async function getWGInfo(workingGroup: string): Promise<WorkingGroup> {
  const link = `https://github.com/electron/governance/blob/main/wg-${workingGroup}/README.md`;
  const readme = await getGitHubREADME(workingGroup);
  const rootNode = remark().use(gfm).parse(readme) as Parent;

  if (!Array.isArray(rootNode.children)) {
    throw new Error('Incorrect README file?');
  }

  // All governance READMEs have the WG name
  // as the first line and the WG description in the
  // second line.
  const name = toString(rootNode.children[0])
    .replace(' WG', '')
    .replace(' Working Group', '');
  const description = toString(rootNode.children[1]);
  const table = rootNode.children.find((child) => isTable(child)) as Table;

  // get rid of first header row
  const rows = table.children.slice(1);

  const wgMembers = rows.reduce(
    (acc, row) => {
      // skip rows that have empty table cells
      // and check if row has github link
      if (
        row.children.some((cell) => !toString(cell)) ||
        !isLink(row.children[1].children[1])
      ) {
        return acc;
      }

      const member = row.children[1].children[1].url.replace(
        'https://github.com/',
        ''
      );
      const status = toString(row.children[2].children[0]);

      if (status === 'Chair') {
        acc.chair = member;
      } else {
        acc.members.push(member);
      }
      return acc;
    },
    { chair: undefined, members: [] }
  );

  const { chair, members } = wgMembers;

  return { name, description, chair, members, link };
}

/**
 * Fetches the string content of a working group's
 * README file in the `electron/governance` repo.
 */
async function getGitHubREADME(wg: string) {
  const res = await fetch(
    `https://raw.githubusercontent.com/electron/governance/main/wg-${wg}/README.md`
  );
  return res.text();
}

export { fetchData };
